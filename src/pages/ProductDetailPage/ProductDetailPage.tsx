import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ProductAttributes,
  ProductVariants,
  ProductImages,
} from "../../types/product";
import ProductDetail from "../../components/ProductDetail/ProductDetail";
import {
  Product as ServiceProduct,
  productPublicService,
} from "../../services/ProductServiceV2";

// Local Product interface for component compatibility
interface Product {
  _id: string;
  id?: string;
  name: string;
  description: string;
  category?: {
    _id: string;
    name: string;
  };
  brand?: {
    _id: string;
    name: string;
  };
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  totalQuantity?: number;
  rating?: number;
  numReviews?: number;
  images?: Array<{
    url: string;
    alt?: string;
    isMain?: boolean;
    public_id?: string;
    displayOrder?: number;
  }>;
  slug?: string;
  mainImage?: string;
  price?: number;
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

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [attributes, setAttributes] = useState<ProductAttributes | null>(null);
  const [variants, setVariants] = useState<ProductVariants | null>(null);
  const [images, setImages] = useState<ProductImages | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add effect to scroll to top when component mounts or slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug, location.pathname]);

  // Helper function to convert service product to local product
  const convertServiceProductToLocal = (
    serviceProduct: ServiceProduct
  ): Product => {
    return {
      _id: serviceProduct._id,
      name: serviceProduct.name,
      description: serviceProduct.description,
      category: serviceProduct.category,
      brand: serviceProduct.brand,
      stockStatus: serviceProduct.stockStatus,
      totalQuantity: serviceProduct.totalQuantity,
      rating: serviceProduct.rating,
      numReviews: serviceProduct.numReviews,
      images: serviceProduct.images,
      slug: serviceProduct.slug,
      mainImage: serviceProduct.mainImage,
      price: serviceProduct.price,
      variants: serviceProduct.variants,
      isActive: serviceProduct.isActive,
      createdAt: serviceProduct.createdAt,
      updatedAt: serviceProduct.updatedAt,
      priceRange: serviceProduct.priceRange,
      originalPrice: serviceProduct.originalPrice,
      averageRating: serviceProduct.averageRating,
      reviewCount: serviceProduct.reviewCount,
      isNew: serviceProduct.isNew,
      salePercentage: serviceProduct.salePercentage,
      discountPercent: serviceProduct.discountPercent,
      hasDiscount: serviceProduct.hasDiscount,
      maxDiscountPercent: serviceProduct.maxDiscountPercent,
      variantSummary: serviceProduct.variantSummary,
    };
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!slug) {
          setError("Không tìm thấy slug sản phẩm");
          return;
        }

        let response;

        // Kiểm tra nếu slug là ID MongoDB
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(slug);

        if (isMongoId) {
          response = await productPublicService.getProductById(slug);
        } else {
          response = await productPublicService.getProductBySlug(slug);
        }

        if (response.data.success) {
          const serviceProduct = response.data.product || response.data.data;
          setProduct(convertServiceProductToLocal(serviceProduct));

          // Lấy thông tin về thuộc tính và biến thể
          if (response.data.attributes) {
            setAttributes(response.data.attributes);
          }

          if (response.data.variants) {
            setVariants(response.data.variants);
          }

          if (response.data.images) {
            setImages(response.data.images);
          }

          // Lấy sản phẩm liên quan nếu có product ID
          const productData = response.data.product || response.data.data;
          if (productData?._id) {
            try {
              const relatedRes = await productPublicService.getRelatedProducts(
                productData._id,
                { limit: 8 }
              );
              if (relatedRes.data.success) {
                const relatedServiceProducts =
                  relatedRes.data.products || relatedRes.data.data || [];
                const relatedLocalProducts = relatedServiceProducts.map(
                  convertServiceProductToLocal
                );
                setSimilarProducts(relatedLocalProducts);
              }
            } catch (relatedError) {
              console.error("Error fetching related products:", relatedError);
              // Không set error cho related products vì đây không phải lỗi chính
            }
          }
        } else {
          setError("Không thể tải sản phẩm");
          toast.error("Không thể tải sản phẩm");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Đã xảy ra lỗi khi tải sản phẩm");
        toast.error("Không thể tải sản phẩm");
        setProduct(null);
        setAttributes(null);
        setVariants(null);
        setImages(null);
        setSimilarProducts([]);
      } finally {
        setLoading(false);
      }
    };

    // Gọi lại API khi slug thay đổi
    fetchProduct();
  }, [slug, location.pathname]);

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Render not found state
  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-gray-600">Không tìm thấy sản phẩm</p>
          </div>
        </div>
      </div>
    );
  }

  // Main render - chỉ khi có product
  return (
    <div>
      <ProductDetail
        product={product}
        attributes={attributes || undefined}
        variants={variants || undefined}
        images={images || undefined}
        similarProducts={similarProducts}
      />
    </div>
  );
};

export default ProductDetailPage;
