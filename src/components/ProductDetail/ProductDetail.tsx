import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import cartService from "../../services/CartService";
import wishlistService from "../../services/WishlistService";
import { productPublicService } from "../../services/ProductService";
import { publicViewHistoryService } from "../../services/ViewHistoryService";
import {
  Product as ProductType,
  ProductCardProduct,
  VariantSize,
  Variant,
  ProductAttributes,
} from "../../types/product";
import type { Size } from "../../types/size";
import type { ProductImage } from "../../types/common";
import type { SizeGuide } from "../../types/sizeGuide";
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
import ColorSwatch from "../Custom/ColorSwatch";
import SizeGuideModal from "../Modal/SizeGuideModal";
import toast from "react-hot-toast";
import { FaStar, FaRegStar } from "react-icons/fa";

// ApiError interface for error handling - specific to this component
interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
    };
  };
}

interface ProductDetailProps {
  product: ProductType;
  attributes?: ProductAttributes;
  variants?: Record<string, Variant>;
  images?: Record<string, ProductImage[]>;
  similarProducts?: ProductType[];
  sizeGuide?: SizeGuide | null;
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  attributes,
  variants,
  images,
  similarProducts,
  sizeGuide,
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
      if (!product?._id) return;

      setLoadingRelated(true);
      try {
        const response = await productPublicService.getRelatedProducts(
          product._id || "",
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
  }, [product?._id]);

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

  // Track product view
  useEffect(() => {
    if (product?._id) {
      // Track view sau 2 giây để đảm bảo user thật sự xem
      const timer = setTimeout(() => {
        publicViewHistoryService.trackView(product._id).catch((error) => {
          console.error("Failed to track view:", error);
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [product?._id]);

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
      if (isAuthenticated && product && product._id && selectedColorId) {
        const variantId = getVariantId();
        if (!variantId) return;

        try {
          const wishlistResponse = await wishlistService.getWishlist();
          if (wishlistResponse.data && wishlistResponse.data.success) {
            const foundItem = wishlistResponse.data.wishlist.find((item) => {
              const productIdMatches = item.product._id === product._id;
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
      <div className="text-center text-mono-500 mt-10">
        Không tìm thấy sản phẩm.
      </div>
    );
  }

  const currentImage = displayedImages[currentImageIndex];

  // Tìm variantId theo gender và color
  const getVariantId = () => {
    if (!variants || !selectedGender || !selectedColorId) return null;
    const variantKey = `${selectedGender}-${selectedColorId}`;
    const variant = variants[variantKey];
    // BE returns 'id' instead of '_id' in variantsInfo
    return variant?.id || variant?._id || null;
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
        const productId = product._id || "";
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
                item.product._id === product._id &&
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
    products: ProductType[]
  ): ProductCardProduct[] => {
    return products.map((p) => {
      // FIXED: Backend đã tính và trả về priceRange trong product
      // Không cần tính từ variants nữa vì variant không còn price fields

      const priceRange = p.priceRange ||
        p.variantSummary?.priceRange || {
          min: p.price || 0,
          max: p.price || 0,
          isSinglePrice: true,
        };

      // Handle images safely
      const images = Array.isArray(p.images) ? p.images : [];
      let mainImage = p.mainImage || "";

      if (!mainImage && images.length > 0) {
        const main = images.find((img) => img.isMain === true) || images[0];
        mainImage = main?.url || "";
      }

      // Xử lý brand.logo để đảm bảo đúng định dạng yêu cầu
      let brandLogo: { url: string; public_id: string } | undefined = undefined;
      const brand = p.brand;
      if (brand && typeof brand === "object" && "logo" in brand) {
        const brandObj = brand as any;
        if (brandObj.logo) {
          if (typeof brandObj.logo === "string") {
            brandLogo = { url: brandObj.logo, public_id: "" };
          } else if (typeof brandObj.logo === "object") {
            const logoObj = brandObj.logo as any;
            brandLogo = {
              url: logoObj.url || "",
              public_id: logoObj.public_id || "",
            };
          }
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
        category: typeof p.category === "object" ? p.category : undefined,
        brand:
          typeof p.brand === "object"
            ? {
                _id: (p.brand as any)?._id || "",
                name: (p.brand as any)?.name || "Chưa có thương hiệu",
                logo: brandLogo, // Sử dụng brandLogo đã được xử lý
              }
            : undefined,
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
          <div className="aspect-square overflow-hidden rounded-lg bg-mono-100">
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
                      ? "border-mono-500"
                      : "border-mono-200"
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
            <h1 className="text-2xl font-bold text-mono-900 sm:text-3xl">
              {product.name}
            </h1>

            <div className="mt-3">
              {/* FIXED: Hiển thị giá theo size được chọn */}
              {selectedSizeInfo &&
              (selectedSizeInfo.finalPrice || selectedSizeInfo.price) ? (
                <>
                  <p
                    className={`text-3xl font-bold ${
                      selectedSizeInfo.discountPercent &&
                      selectedSizeInfo.discountPercent > 0
                        ? "text-mono-900"
                        : "text-mono-900"
                    }`}
                  >
                    {(
                      selectedSizeInfo.finalPrice ||
                      selectedSizeInfo.price ||
                      0
                    ).toLocaleString()}
                    đ
                  </p>

                  {selectedSizeInfo.discountPercent &&
                    selectedSizeInfo.discountPercent > 0 && (
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-lg text-mono-500 line-through">
                          {(selectedSizeInfo.price || 0).toLocaleString()}đ
                        </span>
                        <span className="text-sm font-medium text-mono-900 bg-red-100 px-2 py-1 rounded">
                          -{selectedSizeInfo.discountPercent}%
                        </span>
                      </div>
                    )}
                </>
              ) : (
                <p className="text-3xl font-bold text-mono-900">
                  {selectedGender && selectedColorId
                    ? "Vui lòng chọn size"
                    : "Vui lòng chọn màu sắc"}
                </p>
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
            <span className="text-sm text-mono-600">
              {Number(product.averageRating || 0).toFixed(1)} (
              {product.reviewCount || 0} đánh giá)
            </span>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {product.tags.map((tag, index) => {
                const tagName = typeof tag === "string" ? tag : tag.name;
                const tagId =
                  typeof tag === "string" ? `tag-${index}` : tag._id;
                return (
                  <span
                    key={tagId}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-mono-100 text-mono-800 border border-mono-200"
                  >
                    {tagName}
                  </span>
                );
              })}
            </div>
          )}

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
                        ? "border-mono-500 bg-mono-50 text-blue-700"
                        : "border-mono-300 hover:border-mono-400"
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
                      className={`flex items-center gap-2 px-3 py-2 border-2 rounded-lg transition-all ${
                        selectedColorId === color._id
                          ? "border-mono-black bg-mono-50 shadow-sm"
                          : "border-mono-300 hover:border-mono-400"
                      }`}
                    >
                      <ColorSwatch
                        color={color}
                        size="md"
                        selected={selectedColorId === color._id}
                      />
                      <span className="font-medium">{color.name}</span>
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
                  onClick={() => setShowSizeGuide(true)}
                  className="text-sm text-mono-700 hover:text-mono-black font-medium flex items-center gap-1 hover:underline"
                >
                  <FiInfo size={16} />
                  Hướng dẫn chọn size
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {getCurrentVariant()?.sizes?.map((sizeInfo) => {
                  if (!sizeInfo.sizeId) return null;
                  const sizeDetails = getSizeDetails(sizeInfo.sizeId);
                  // Sử dụng stock status từ BE
                  const isOutOfStock =
                    sizeInfo.isOutOfStock || sizeInfo.quantity === 0;
                  const isLowStock = sizeInfo.isLowStock && !isOutOfStock;

                  return (
                    <div key={sizeInfo.sizeId} className="relative group">
                      <button
                        onClick={() => setSelectedSizeId(sizeInfo.sizeId!)}
                        disabled={isOutOfStock}
                        className={`px-4 py-2 border rounded-lg transition-colors ${
                          selectedSizeId === sizeInfo.sizeId
                            ? "border-mono-500 bg-mono-50 text-blue-700"
                            : isOutOfStock
                            ? "border-mono-200 bg-mono-100 text-mono-400 cursor-not-allowed"
                            : isLowStock
                            ? "border-orange-300 bg-orange-50"
                            : "border-mono-300 hover:border-mono-400"
                        }`}
                      >
                        {sizeInfo.sizeValue}
                        {isOutOfStock && (
                          <span className="block text-xs">Hết hàng</span>
                        )}
                        {isLowStock && (
                          <span className="block text-xs text-orange-600">
                            Sắp hết
                          </span>
                        )}
                      </button>

                      {/* Size description tooltip */}
                      {sizeDetails?.description && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-mono-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
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
                selectedSizeInfo.sizeId &&
                getSizeDetails(selectedSizeInfo.sizeId)?.description && (
                  <div className="mt-3 p-3 bg-mono-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FiInfo className="text-mono-black" size={16} />
                      <span className="text-sm font-medium text-blue-900">
                        Size {selectedSizeInfo.sizeValue}:
                      </span>
                    </div>
                    <p className="text-sm text-mono-800 mt-1">
                      {getSizeDetails(selectedSizeInfo.sizeId)?.description}
                    </p>
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
                  className="p-2 border border-mono-300 rounded-lg hover:bg-mono-50"
                >
                  <FiMinus />
                </button>

                <input
                  type="text"
                  value={quantityInput}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  onBlur={handleQuantityBlur}
                  className="px-4 py-2 border border-mono-300 rounded-lg w-[60px] text-center"
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
                  className="p-2 border border-mono-300 rounded-lg hover:bg-mono-50"
                >
                  <FiPlus />
                </button>
                <span className="text-sm text-mono-500">
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
                  ? "bg-mono-300 text-mono-500 cursor-not-allowed"
                  : "bg-mono-black text-white hover:bg-blue-700 transform hover:scale-105 transition-all duration-200"
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
                  ? "bg-mono-300 text-mono-500 cursor-not-allowed"
                  : "bg-mono-900 text-white hover:bg-red-700 transform hover:scale-105 transition-all duration-200"
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
                  ? "border-mono-300 text-mono-400 cursor-not-allowed"
                  : isLiked
                  ? "border-mono-800 text-mono-800 bg-red-50 hover:bg-red-100"
                  : "border-mono-300 text-mono-700 hover:border-mono-400 hover:bg-mono-50"
              }`}
            >
              {likeLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-mono-500 border-t-transparent rounded-full"></div>
              ) : isLiked ? (
                <AiFillHeart size={20} className="text-mono-800" />
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
                    ? "text-mono-black border-b-2 border-mono-black"
                    : "text-mono-500 hover:text-mono-700"
                }`}
              >
                Chi tiết sản phẩm
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "reviews"
                    ? "text-mono-black border-b-2 border-mono-black"
                    : "text-mono-500 hover:text-mono-700"
                }`}
              >
                Đánh giá
              </button>
            </div>
            <div className="py-4">
              {activeTab === "details" && <ProductInfo product={product} />}
              {activeTab === "reviews" && (
                <ProductComments productId={product._id || ""} />
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
            <h2 className="text-2xl font-bold text-mono-900">
              Sản phẩm liên quan
            </h2>
            <span className="text-sm text-mono-500">
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
                  <div className="aspect-square bg-mono-200 rounded-t-lg"></div>
                  <div className="p-3 md:p-4 space-y-2">
                    <div className="h-4 bg-mono-200 rounded"></div>
                    <div className="h-4 bg-mono-200 rounded w-3/4"></div>
                    <div className="h-4 bg-mono-200 rounded w-1/2"></div>
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

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        categoryId={
          typeof product?.category === "object"
            ? product.category._id
            : undefined
        }
        gender={selectedGender || undefined}
      />
    </div>
  );
};

export default ProductDetail;
