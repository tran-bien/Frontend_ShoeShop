import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import cartService from "../../services/CartServiceV2";
import wishlistService from "../../services/WishlistService";
import { productPublicService } from "../../services/ProductServiceV2";
import {
  Product as ProductType,
  ProductCardProduct,
} from "../../services/ProductServiceV2";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import {
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiShoppingCart,
  FiInfo,
} from "react-icons/fi";
import ProductInfo from "./ProductInfo";
import ProductComments from "./ProductComments";
import ProductCard from "../ProductCard/ProductCard";
import toast from "react-hot-toast";
import { FaStar, FaRegStar } from "react-icons/fa";

interface Brand {
  _id: string;
  name: string;
  logo?:
    | {
        url: string;
      }
    | string;
}

interface Category {
  _id: string;
  name: string;
}

interface Color {
  _id: string;
  name: string;
  code: string;
  type: "solid" | "gradient";
  colors?: string[];
}

interface Size {
  _id: string;
  value: string | number;
  description?: string;
}

interface Gender {
  id: string;
  name: string;
}

interface ProductImage {
  url: string;
  alt?: string;
  isMain?: boolean;
  public_id?: string;
  displayOrder?: number;
}

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
    };
  };
}

interface VariantSize {
  sizeId: string;
  sizeValue?: string | number;
  quantity: number;
  description?: string;
}

interface Variant {
  id: string;
  sizes?: VariantSize[];
  price?: number;
  priceFinal?: number;
  percentDiscount?: number;
}

interface Product {
  _id: string;
  id?: string;
  name: string;
  description: string;
  category?: Category;
  brand?: Brand;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  totalQuantity?: number;
  rating?: number;
  numReviews?: number;
  images?: ProductImage[];
  slug?: string;
  mainImage?: string;
  price?: number;
  // Add missing properties for compatibility
  variants?: string[] | any[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  priceRange?: {
    min: number | null;
    max: number | null;
    isSinglePrice?: boolean;
  };
  originalPrice?: number;
  averageRating?: number;
  reviewCount?: number;
  isNew?: boolean;
  salePercentage?: number;
  discountPercent?: number;
  hasDiscount?: boolean;
  maxDiscountPercent?: number;
  variantSummary?: {
    priceRange?: {
      min: number | null;
      max: number | null;
      isSinglePrice?: boolean;
    };
  };
}

interface ProductAttributes {
  genders?: Gender[];
  colors?: Color[];
  sizes?: Size[];
  priceRange?: {
    min: number;
    max: number;
  };
  inventoryMatrix?: {
    summary?: {
      total: number;
    };
  };
}

interface ProductDetailProps {
  product: Product;
  attributes?: ProductAttributes;
  variants?: Record<string, Variant>;
  images?: Record<string, ProductImage[]>;
  similarProducts?: Product[];
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  attributes,
  variants,
  images,
  similarProducts,
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("details");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingBuyNow, setLoadingBuyNow] = useState(false);
  const [displayedImages, setDisplayedImages] = useState<ProductImage[]>([]);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<ProductType[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Wishlist state
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  // Stock information for selected variant and size
  const [availableStock, setAvailableStock] = useState(0);
  const [selectedSizeInfo, setSelectedSizeInfo] = useState<VariantSize | null>(
    null
  );

  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product?._id && !product?.id) return;

      setLoadingRelated(true);
      try {
        const response = await productPublicService.getRelatedProducts(
          product._id || product.id || "",
          { limit: 8 }
        );

        if (response.data.success && response.data.data) {
          setRelatedProducts(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
        // Fallback to similar products from props
        setRelatedProducts([]);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedProducts();
  }, [product?._id, product?.id]);

  // Cập nhật hiển thị ảnh theo variant được chọn
  useEffect(() => {
    if (!images) {
      if (product?.images?.length) {
        setDisplayedImages(product.images);
      }
      return;
    }

    if (selectedGender && selectedColorId) {
      const key = `${selectedGender}-${selectedColorId}`;
      if (images[key] && images[key].length > 0) {
        setDisplayedImages(images[key]);
        setCurrentImageIndex(0);
        return;
      }
    }

    if (product?.images?.length) {
      setDisplayedImages(product.images);
    }
  }, [images, product?.images, selectedGender, selectedColorId]);

  // Fetch stock information when variant or size changes
  useEffect(() => {
    const fetchStockInfo = () => {
      if (!variants || !selectedGender || !selectedColorId) {
        setAvailableStock(0);
        setSelectedSizeInfo(null);
        return;
      }

      const variantKey = `${selectedGender}-${selectedColorId}`;
      const variant = variants[variantKey];

      if (variant && variant.sizes) {
        if (selectedSizeId) {
          const sizeInfo = variant.sizes.find(
            (size) => size.sizeId === selectedSizeId
          );
          setAvailableStock(sizeInfo?.quantity || 0);
          setSelectedSizeInfo(sizeInfo || null);
        }
      }
    };

    fetchStockInfo();
  }, [variants, selectedGender, selectedColorId, selectedSizeId]);

  // Tự động chọn gender và color mặc định khi tải sản phẩm
  useEffect(() => {
    if (attributes?.genders?.length && !selectedGender) {
      setSelectedGender(attributes.genders[0].id);
    }

    if (attributes?.colors?.length && selectedGender && !selectedColorId) {
      for (const color of attributes.colors) {
        const variantKey = `${selectedGender}-${color._id}`;
        if (variants && variants[variantKey]) {
          setSelectedColorId(color._id);
          break;
        }
      }
    }
  }, [attributes, variants, selectedGender, selectedColorId]);

  // Reset quantity when size changes
  useEffect(() => {
    setSelectedQuantity(1);
    setQuantityInput("1");
  }, [selectedSizeId, selectedColorId]);

  const [quantityInput, setQuantityInput] = useState("1");

  // Xử lý nhập số lượng
  const handleQuantityChange = (value: string) => {
    // Chỉ cho phép nhập số dương
    const sanitizedValue = value.replace(/[^0-9]/g, "").slice(0, 2);
    setQuantityInput(sanitizedValue);

    const numValue = parseInt(sanitizedValue);
    if (!isNaN(numValue) && numValue > 0) {
      // Giới hạn số lượng không vượt quá tồn kho
      const limitedValue = Math.min(numValue, availableStock);
      setSelectedQuantity(limitedValue);

      // Nếu giới hạn tồn kho ít hơn số nhập, cập nhật lại input và hiển thị thông báo
      if (limitedValue < numValue) {
        setQuantityInput(limitedValue.toString());
        toast.error(`Số lượng tối đa có thể chọn là ${availableStock}`);
      }
    }
  };

  // Xử lý khi input mất focus
  const handleQuantityBlur = () => {
    const numValue = parseInt(quantityInput);
    if (isNaN(numValue) || numValue < 1) {
      // Nếu giá trị không hợp lệ, đặt về 1
      setQuantityInput("1");
      setSelectedQuantity(1);
    }
  };

  // Kiểm tra sản phẩm đã có trong wishlist khi component mount hoặc variant thay đổi
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (
        isAuthenticated &&
        product &&
        (product._id || product.id) &&
        selectedColorId
      ) {
        const variantId = getVariantId();
        if (!variantId) return;

        try {
          const wishlistResponse = await wishlistService.getWishlist();
          if (wishlistResponse.data && wishlistResponse.data.success) {
            const foundItem = wishlistResponse.data.wishlist.find((item) => {
              const productIdMatches =
                item.product._id === (product._id || product.id);
              const variantIdMatches =
                item.variant && item.variant._id === variantId;
              return productIdMatches && variantIdMatches;
            });

            setIsLiked(!!foundItem);
            setWishlistItemId(foundItem ? foundItem._id : null);
          }
        } catch (error) {
          console.error("Lỗi khi kiểm tra trạng thái wishlist:", error);
        }
      }
    };

    checkWishlistStatus();
  }, [isAuthenticated, product, selectedColorId, selectedGender, variants]);

  if (!product) {
    return (
      <div className="text-center text-gray-500 mt-10">
        Không tìm thấy sản phẩm.
      </div>
    );
  }

  const currentImage = displayedImages[currentImageIndex];

  // Tìm variantId theo gender và color
  const getVariantId = () => {
    if (!variants || !selectedGender || !selectedColorId) return null;
    const variantKey = `${selectedGender}-${selectedColorId}`;
    return variants[variantKey]?.id || null;
  };

  // Tìm variant hiện tại
  const getCurrentVariant = () => {
    if (!variants || !selectedGender || !selectedColorId) return null;
    const variantKey = `${selectedGender}-${selectedColorId}`;
    return variants[variantKey] || null;
  };

  // Lấy thông tin size từ attributes
  const getSizeDetails = (sizeId: string): Size | null => {
    return attributes?.sizes?.find((size) => size._id === sizeId) || null;
  };

  // Xử lý thêm vào giỏ hàng - Cập nhật với error handling tốt hơn
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      // Lưu URL hiện tại để quay lại sau khi đăng nhập
      navigate(
        `/login?returnUrl=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    if (!selectedGender || !selectedColorId || !selectedSizeId) {
      toast.error("Vui lòng chọn đầy đủ thông tin sản phẩm");
      return;
    }

    if (availableStock < selectedQuantity) {
      toast.error("Số lượng vượt quá tồn kho");
      return;
    }

    const variantId = getVariantId();
    if (!variantId) {
      toast.error("Không tìm thấy thông tin sản phẩm");
      return;
    }

    setLoadingAdd(true);
    try {
      const response = await cartService.addToCart({
        variantId,
        sizeId: selectedSizeId,
        quantity: selectedQuantity,
      });

      if (response.data.success) {
        toast.success("Đã thêm sản phẩm vào giỏ hàng");
        setSelectedQuantity(1);
      }
    } catch (error: unknown) {
      console.error("Add to cart error:", error);
      const apiError = error as ApiError;

      // Nếu lỗi xác thực, không hiển thị thông báo vì interceptor đã xử lý
      if (apiError.response?.status === 401) {
        // Không cần hiển thị thông báo vì axios interceptor sẽ xử lý
        return;
      } else {
        const errorMessage =
          apiError?.response?.data?.message ||
          apiError?.response?.data?.error ||
          "Có lỗi xảy ra khi thêm vào giỏ hàng";
        toast.error(errorMessage);
      }
    } finally {
      setLoadingAdd(false);
    }
  };

  // Xử lý mua ngay - Cập nhật với error handling tốt hơn
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để mua hàng");
      navigate(
        `/login?returnUrl=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    if (!selectedGender || !selectedColorId || !selectedSizeId) {
      toast.error("Vui lòng chọn đầy đủ thông tin sản phẩm");
      return;
    }

    if (availableStock < selectedQuantity) {
      toast.error("Số lượng vượt quá tồn kho");
      return;
    }

    setLoadingBuyNow(true);
    try {
      const variantId = getVariantId();
      if (!variantId) {
        toast.error("Không tìm thấy thông tin sản phẩm");
        return;
      }

      const response = await cartService.addToCart({
        variantId,
        sizeId: selectedSizeId,
        quantity: selectedQuantity,
      });

      if (response.data.success) {
        navigate("/cart?checkout=true");
        toast.success("Đã thêm sản phẩm vào giỏ hàng, chuyển đến thanh toán");
      }
    } catch (error: unknown) {
      console.error("Buy now error:", error);
      const apiError = error as ApiError;

      if (apiError.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      } else {
        const errorMessage =
          apiError?.response?.data?.message || "Có lỗi xảy ra khi mua ngay";
        toast.error(errorMessage);
      }
    } finally {
      setLoadingBuyNow(false);
    }
  };

  // Xử lý yêu thích
  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
      // Lưu URL hiện tại để redirect sau khi đăng nhập
      const currentPath = window.location.pathname + window.location.search;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    const variantId = getVariantId();
    if (!variantId) {
      toast.error("Vui lòng chọn màu sắc");
      return;
    }

    setLikeLoading(true);
    try {
      if (isLiked && wishlistItemId) {
        const response = await wishlistService.removeFromWishlist(
          wishlistItemId
        );
        if (response.data && response.data.success) {
          setIsLiked(false);
          setWishlistItemId(null);
          toast.success("Đã xóa khỏi danh sách yêu thích");
        }
      } else {
        // Thêm vào wishlist
        const productId = product._id || product.id || "";
        const response = await wishlistService.addToWishlist(
          productId,
          variantId
        );

        if (response.data && response.data.success) {
          // Nếu thêm thành công hoặc đã tồn tại
          if (response.data.isExisting) {
            toast.success(
              response.data.message ||
                "Sản phẩm đã có trong danh sách yêu thích"
            );
          } else {
            toast.success(
              response.data.message || "Đã thêm vào danh sách yêu thích"
            );
          }

          // Lấy danh sách wishlist mới để có được ID của item vừa thêm
          try {
            const wishlistRes = await wishlistService.getWishlist();
            const wishlistItems = wishlistRes.data.wishlist || [];

            // Tìm item mới thêm vào
            const newItem = wishlistItems.find(
              (item) =>
                item.product._id === (product._id || product.id) &&
                item.variant?._id === variantId
            );

            if (newItem) {
              setWishlistItemId(newItem._id);
            }
          } catch (fetchError) {
            console.error("Lỗi khi tải lại wishlist:", fetchError);
          }

          setIsLiked(true);
        }
      }
    } catch (error: any) {
      console.error("Lỗi khi thêm/xóa wishlist:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi xử lý yêu thích";
      toast.error(errorMessage);
    } finally {
      setLikeLoading(false);
    }
  };

  // Convert ProductType to ProductCardProduct
  const convertToProductCardFormat = (
    products: Product[]
  ): ProductCardProduct[] => {
    return products.map((p) => {
      // Calculate price range safely
      const variants = Array.isArray(p.variants) ? p.variants : [];
      const prices = variants
        .filter((v) => v && typeof v === "object" && v.priceFinal !== undefined)
        .map((v) => v.priceFinal);

      // Fallback to variantSummary if available
      let priceRange = {
        min: 0,
        max: 0,
        isSinglePrice: true,
      };

      if (prices.length > 0) {
        priceRange = {
          min: Math.min(...prices),
          max: Math.max(...prices),
          isSinglePrice: Math.min(...prices) === Math.max(...prices),
        };
      } else if (p.variantSummary?.priceRange) {
        const min = p.variantSummary.priceRange.min || 0;
        const max = p.variantSummary.priceRange.max || 0;
        const isSinglePrice =
          p.variantSummary.priceRange.isSinglePrice !== false;
        priceRange = { min, max, isSinglePrice };
      } else if (p.price !== undefined) {
        priceRange = {
          min: p.price,
          max: p.price,
          isSinglePrice: true,
        };
      }

      // Handle images safely
      const images = Array.isArray(p.images) ? p.images : [];
      let mainImage = "";

      if (images.length > 0) {
        const main = images.find((img) => img.isMain === true) || images[0];
        mainImage = main?.url || "";
      }

      // Xử lý brand.logo để đảm bảo đúng định dạng yêu cầu
      let brandLogo: { url: string; public_id: string } | undefined = undefined;
      if (p.brand?.logo) {
        if (typeof p.brand.logo === "string") {
          brandLogo = { url: p.brand.logo, public_id: "" };
        } else if (typeof p.brand.logo === "object") {
          const logoObj = p.brand.logo as any;
          brandLogo = {
            url: logoObj.url || "",
            public_id: logoObj.public_id || "",
          };
        }
      }

      // Ensure all properties match ProductCardProduct interface from the service
      return {
        _id: p._id,
        name: p.name || "",
        slug: p.slug || "",
        images: Array.isArray(p.images)
          ? p.images.map((img) => ({
              url: img.url || "",
              public_id: img.public_id || "",
              isMain: img.isMain || false,
              displayOrder: img.displayOrder || 0,
            }))
          : [],
        category: p.category || { _id: "", name: "Chưa phân loại" },
        brand: {
          _id: p.brand?._id || "",
          name: p.brand?.name || "Chưa có thương hiệu",
          logo: brandLogo, // Sử dụng brandLogo đã được xử lý
        },
        priceRange: {
          min: priceRange.min || 0,
          max: priceRange.max || 0,
          isSinglePrice: priceRange.isSinglePrice !== false,
        },
        originalPrice: p.originalPrice || priceRange.max || 0,
        averageRating: p.averageRating || p.rating || 0,
        reviewCount: p.reviewCount || p.numReviews || 0,
        isNew: p.isNew || false,
        salePercentage: p.salePercentage || p.discountPercent || 0,
        stockStatus: p.stockStatus,
        totalQuantity: p.totalQuantity,
        price: p.price || priceRange.min || 0,
        discountPercent: p.discountPercent || p.maxDiscountPercent || 0,
        hasDiscount: p.hasDiscount || (p.discountPercent || 0) > 0,
        mainImage: mainImage,
      };
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main image */}
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            <img
              src={currentImage?.url || "/placeholder.jpg"}
              alt={product.name}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "/placeholder.jpg";
              }}
            />
          </div>

          {/* Thumbnail images */}
          {displayedImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {displayedImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square overflow-hidden rounded-md border-2 ${
                    currentImageIndex === index
                      ? "border-blue-500"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "/placeholder.jpg";
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title and price */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {product.name}
            </h1>

            <div className="mt-3">
              <p className="text-3xl font-bold text-gray-900">
                {getCurrentVariant()?.priceFinal?.toLocaleString() ||
                  getCurrentVariant()?.price?.toLocaleString() ||
                  "Liên hệ"}
                đ
              </p>

              {getCurrentVariant()?.percentDiscount &&
                (getCurrentVariant()?.percentDiscount ?? 0) > 0 && (
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-lg text-gray-500 line-through">
                      {getCurrentVariant()?.price?.toLocaleString()}đ
                    </span>
                    <span className="text-sm font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                      -{getCurrentVariant()?.percentDiscount}%
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* Rating and reviews */}
          <div className="flex items-center space-x-2 mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) =>
                i <= (product.averageRating || 0) ? (
                  <FaStar key={i} className="text-yellow-400 w-4 h-4" />
                ) : (
                  <FaRegStar key={i} className="text-yellow-400 w-4 h-4" />
                )
              )}
            </div>
            <span className="text-sm text-gray-600">
              {Number(product.averageRating || 0).toFixed(1)} (
              {product.reviewCount || 0} đánh giá)
            </span>
          </div>

          {/* Gender selection */}
          {attributes?.genders && attributes.genders.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Giới tính:</h3>
              <div className="flex gap-2">
                {attributes.genders.map((gender) => (
                  <button
                    key={gender.id}
                    onClick={() => {
                      setSelectedGender(gender.id);
                      setSelectedColorId(null);
                      setSelectedSizeId(null);
                    }}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      selectedGender === gender.id
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {gender.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color selection */}
          {selectedGender && attributes?.colors && (
            <div>
              <h3 className="text-lg font-medium mb-3">Màu sắc:</h3>
              <div className="flex flex-wrap gap-2">
                {attributes.colors
                  .filter((color) => {
                    const variantKey = `${selectedGender}-${color._id}`;
                    return variants && variants[variantKey];
                  })
                  .map((color) => (
                    <button
                      key={color._id}
                      onClick={() => {
                        setSelectedColorId(color._id);
                        setSelectedSizeId(null);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
                        selectedColorId === color._id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {color.type === "solid" ? (
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color.code }}
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full border relative overflow-hidden">
                          <div
                            style={{
                              backgroundColor: color.colors?.[0] || "#fff",
                              width: "100%",
                              height: "100%",
                              position: "absolute",
                              left: 0,
                              top: 0,
                              clipPath: "inset(0 50% 0 0)",
                            }}
                          />
                          <div
                            style={{
                              backgroundColor: color.colors?.[1] || "#fff",
                              width: "100%",
                              height: "100%",
                              position: "absolute",
                              right: 0,
                              top: 0,
                              clipPath: "inset(0 0 0 50%)",
                            }}
                          />
                        </div>
                      )}
                      <span>{color.name}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Size selection với size description */}
          {selectedGender && selectedColorId && getCurrentVariant() && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium">Kích thước:</h3>
                <button
                  onClick={() => setShowSizeGuide(!showSizeGuide)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <FiInfo size={14} />
                  Hướng dẫn chọn size
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {getCurrentVariant()?.sizes?.map((sizeInfo) => {
                  const sizeDetails = getSizeDetails(sizeInfo.sizeId);
                  return (
                    <div key={sizeInfo.sizeId} className="relative group">
                      <button
                        onClick={() => setSelectedSizeId(sizeInfo.sizeId)}
                        disabled={sizeInfo.quantity === 0}
                        className={`px-4 py-2 border rounded-lg transition-colors ${
                          selectedSizeId === sizeInfo.sizeId
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : sizeInfo.quantity === 0
                            ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {sizeInfo.sizeValue}
                        {sizeInfo.quantity === 0 && (
                          <span className="block text-xs">Hết hàng</span>
                        )}
                      </button>

                      {/* Size description tooltip */}
                      {sizeDetails?.description && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          {sizeDetails.description}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Selected size description */}
              {selectedSizeInfo &&
                getSizeDetails(selectedSizeInfo.sizeId)?.description && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FiInfo className="text-blue-600" size={16} />
                      <span className="text-sm font-medium text-blue-900">
                        Size {selectedSizeInfo.sizeValue}:
                      </span>
                    </div>
                    <p className="text-sm text-blue-800 mt-1">
                      {getSizeDetails(selectedSizeInfo.sizeId)?.description}
                    </p>
                  </div>
                )}

              {/* Size guide */}
              {showSizeGuide && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-2">Hướng dẫn chọn size giày</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Đo chiều dài bàn chân từ gót đến ngón cái dài nhất</p>
                    <p>• Nên đo vào buổi chiều khi bàn chân hơi phù</p>
                    <p>• Chọn size lớn hơn 0.5-1cm so với chiều dài bàn chân</p>
                    <p>• Tham khảo bảng size cụ thể của từng thương hiệu</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quantity selection */}
          {selectedSizeId && availableStock > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Số lượng:</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const newQty = Math.max(1, selectedQuantity - 1);
                    setSelectedQuantity(newQty);
                    setQuantityInput(newQty.toString());
                  }}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <FiMinus />
                </button>

                <input
                  type="text"
                  value={quantityInput}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  onBlur={handleQuantityBlur}
                  className="px-4 py-2 border border-gray-300 rounded-lg w-[60px] text-center"
                />

                <button
                  onClick={() => {
                    const newQty = Math.min(
                      availableStock,
                      selectedQuantity + 1
                    );
                    setSelectedQuantity(newQty);
                    setQuantityInput(newQty.toString());
                  }}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <FiPlus />
                </button>
                <span className="text-sm text-gray-500">
                  Còn {availableStock} sản phẩm
                </span>
              </div>
            </div>
          )}

          {/* Add to cart & buy now buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={
                loadingAdd ||
                !selectedSizeId ||
                availableStock < selectedQuantity
              }
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium ${
                loadingAdd ||
                !selectedSizeId ||
                availableStock < selectedQuantity
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105 transition-all duration-200"
              }`}
            >
              {loadingAdd ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <>
                  <FiShoppingCart size={20} />
                  <span>Thêm vào giỏ hàng</span>
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={
                loadingBuyNow ||
                !selectedSizeId ||
                availableStock < selectedQuantity
              }
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium ${
                loadingBuyNow ||
                !selectedSizeId ||
                availableStock < selectedQuantity
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700 transform hover:scale-105 transition-all duration-200"
              }`}
            >
              {loadingBuyNow ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <>
                  <FiShoppingBag size={20} />
                  <span>Mua ngay</span>
                </>
              )}
            </button>

            <button
              onClick={handleToggleWishlist}
              disabled={likeLoading || !selectedColorId}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border font-medium ${
                likeLoading || !selectedColorId
                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
                  : isLiked
                  ? "border-red-500 text-red-500 bg-red-50 hover:bg-red-100"
                  : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
              }`}
            >
              {likeLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full"></div>
              ) : isLiked ? (
                <AiFillHeart size={20} className="text-red-500" />
              ) : (
                <AiOutlineHeart size={20} />
              )}
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-8 border-t pt-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("details")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "details"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Chi tiết sản phẩm
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "reviews"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Đánh giá
              </button>
            </div>
            <div className="py-4">
              {activeTab === "details" && <ProductInfo product={product} />}
              {activeTab === "reviews" && (
                <ProductComments productId={product._id || product.id || ""} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {(relatedProducts.length > 0 ||
        (similarProducts && similarProducts.length > 0)) && (
        <div className="mt-16 border-t pt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Sản phẩm liên quan
            </h2>
            <span className="text-sm text-gray-500">
              {loadingRelated
                ? "Đang tải..."
                : `${
                    relatedProducts.length || similarProducts?.length || 0
                  } sản phẩm được đề xuất`}
            </span>
          </div>

          {loadingRelated ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                  <div className="p-3 md:p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {(() => {
                // Use relatedProducts first, fallback to similarProducts
                const sourceProducts =
                  relatedProducts.length > 0
                    ? relatedProducts
                    : similarProducts || [];

                const displayProducts =
                  convertToProductCardFormat(sourceProducts);

                return displayProducts
                  .slice(0, 10)
                  .map((relatedProduct, index) => (
                    <ProductCard
                      key={relatedProduct._id || `product-${index}`}
                      product={relatedProduct}
                      onClick={() =>
                        navigate(
                          `/product/${
                            relatedProduct.slug || relatedProduct._id
                          }`
                        )
                      }
                    />
                  ));
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
