import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ProductAttributes,
  ProductVariants,
  ProductImages,
  Product,
} from "../../types/product";
import ProductDetail from "../../components/ProductDetail/ProductDetail";
import { productPublicService } from "../../services/ProductService";

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
          setProduct(serviceProduct);

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
                setSimilarProducts(relatedServiceProducts);
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
        product={product as any}
        attributes={attributes as any}
        variants={variants as any}
        images={images || undefined}
        similarProducts={similarProducts as any}
      />
    </div>
  );
};

export default ProductDetailPage;
