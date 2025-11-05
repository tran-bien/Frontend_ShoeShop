import React, { useState, useEffect } from "react";
import { ProductCardProduct } from "../../types/product";
import { FaStar, FaRegStar } from "react-icons/fa";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { useCompare } from "../../contexts/CompareContext";

interface ProductCardProps {
  product: ProductCardProduct;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  // State cho hiệu ứng fade-in khi ảnh được tải
  const [imageLoaded, setImageLoaded] = useState(false);

  // State cho hiệu ứng slide ảnh
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Compare context
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const inCompare = isInCompare(product._id);

  // Kiểm tra chắc chắn images là mảng và có nhiều hơn 1 phần tử
  const hasMultipleImages =
    Array.isArray(product.images) && product.images.length > 1;

  // Hiệu ứng slide ảnh với tốc độ vừa phải (3 giây cho mỗi ảnh)
  useEffect(() => {
    if (!hasMultipleImages) return;

    const interval = setInterval(() => {
      // Kiểm tra images tồn tại trước khi truy cập length
      if (Array.isArray(product.images) && product.images.length > 0) {
        setCurrentImageIndex((prev) => (prev + 1) % product.images!.length);
        // Reset trạng thái imageLoaded khi chuyển ảnh
        setImageLoaded(false);
      }
    }, 3000); // Tốc độ chuyển ảnh vừa phải: 3 giây

    return () => clearInterval(interval);
  }, [product.images, hasMultipleImages]);

  // Get image URL to display với kiểm tra null/undefined
  const imageUrl =
    hasMultipleImages && Array.isArray(product.images)
      ? product.images[currentImageIndex]?.url || ""
      : product.mainImage ||
        (Array.isArray(product.images) && product.images.length > 0
          ? product.images[0]?.url
          : "/placeholder.jpg");

  // Xử lý khoảng giá
  const renderPrice = () => {
    // Nếu có khoảng giá và không phải giá đơn
    if (product.priceRange && !product.priceRange.isSinglePrice) {
      return (
        <div className="flex flex-col">
          {product.hasDiscount ? (
            <>
              <span className="text-mono-900 font-bold text-base md:text-lg">
                {(product.priceRange.min || 0).toLocaleString()} -{" "}
                {(product.priceRange.max || 0).toLocaleString()}đ
              </span>
              {product.originalPrice && (
                <span className="text-mono-400 text-sm line-through">
                  Gốc: {product.originalPrice.toLocaleString()}đ
                </span>
              )}
            </>
          ) : (
            <span className="text-mono-900 font-bold text-base md:text-lg">
              {(product.priceRange.min || 0).toLocaleString()} -{" "}
              {(product.priceRange.max || 0).toLocaleString()}đ
            </span>
          )}
        </div>
      );
    }

    // Trường hợp giá đơn hoặc fallback về price
    return (
      <div className="flex flex-col">
        {product.hasDiscount ? (
          <>
            <span className="text-mono-900 font-bold text-base md:text-lg">
              {(product.price || product.priceRange?.min || 0).toLocaleString()}
              đ
            </span>
            {product.originalPrice && (
              <span className="text-mono-400 text-sm line-through">
                {product.originalPrice.toLocaleString()}đ
              </span>
            )}
          </>
        ) : (
          <span className="text-mono-900 font-bold text-base md:text-lg">
            {(product.price || product.priceRange?.min || 0).toLocaleString()}đ
          </span>
        )}
      </div>
    );
  };

  // Hiển thị rating bằng các icon sao
  const renderRating = () => {
    // Nếu không có review count thì vẫn hiển thị 5 sao rỗng
    // Chỉ ẩn phần rating khi cả hai điều kiện đều không tồn tại
    if (
      product.reviewCount === undefined &&
      product.averageRating === undefined
    ) {
      return null;
    }

    // Lấy rating, nếu không có thì mặc định là 0
    const rating = product.averageRating || 0;
    const reviewCount = product.reviewCount || 0;
    const stars = [];

    // Tạo 5 sao đánh giá
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <FaStar key={i} className="text-yellow-400 w-4 h-4" />
        ) : (
          <FaRegStar key={i} className="text-yellow-400 w-4 h-4" />
        )
      );
    }

    return (
      <div className="flex items-center mt-2 gap-1">
        <div className="flex">{stars}</div>
        <span className="text-xs text-mono-600 ml-1">({reviewCount})</span>
      </div>
    );
  };

  return (
    <div
      className="group cursor-pointer bg-white rounded-lg shadow-soft hover:shadow-luxury transition-all duration-300 overflow-hidden h-full flex flex-col transform hover:translate-y-[-4px] border border-mono-100"
      onClick={onClick}
    >
      {/* Phần ảnh sản phẩm với hiệu ứng chuyển đổi mềm mại */}
      <div className="aspect-square w-full overflow-hidden bg-mono-50 relative">
        {/* Compare Button - Top Left */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (inCompare) {
              removeFromCompare(product._id);
            } else {
              addToCompare(product as any);
            }
          }}
          className={`absolute top-2 left-2 z-20 p-2 rounded-full transition-all duration-200 ${
            inCompare
              ? "bg-mono-black text-white shadow-lg scale-110"
              : "bg-white/90 hover:bg-white text-mono-700 hover:scale-110 shadow-md"
          }`}
          title={inCompare ? "Xóa khỏi so sánh" : "Thêm vào so sánh"}
        >
          <ArrowsRightLeftIcon className="h-5 w-5" />
        </button>

        <img
          src={imageUrl}
          alt={product.name}
          className={`w-full h-full object-contain object-center transition-all duration-700 ease-in-out hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{
            transformOrigin: "center center",
          }}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "/placeholder.jpg";
            setImageLoaded(true);
          }}
        />

        {/* Hiển thị các chỉ báo slide nếu có nhiều ảnh */}
        {hasMultipleImages && Array.isArray(product.images) && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
            {product.images.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentImageIndex === idx
                    ? "w-3 bg-mono-800"
                    : "w-1.5 bg-mono-400"
                }`}
              />
            ))}
          </div>
        )}

        {/* Sale tag - Sửa lỗi kiểm tra undefined */}
        {typeof product.salePercentage === "number" &&
          product.salePercentage > 0 && (
            <div className="absolute top-2 right-2 bg-mono-800 text-white text-xs font-bold px-2.5 py-1.5 rounded">
              -{product.salePercentage}%
            </div>
          )}

        {/* Stock status */}
        {product.stockStatus === "out_of_stock" && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-center py-1.5 text-sm font-medium">
            Hết hàng
          </div>
        )}
        {product.stockStatus === "low_stock" && (
          <div className="absolute bottom-0 left-0 right-0 bg-mono-600 bg-opacity-70 text-white text-center py-1.5 text-sm font-medium">
            Sắp hết hàng
          </div>
        )}
      </div>

      {/* Thông tin sản phẩm - cải thiện độ rõ ràng */}
      <div className="p-4 flex flex-col flex-1">
        {/* Thương hiệu */}
        {product.brand && (
          <span className="text-sm font-medium text-mono-500 mb-1.5">
            {product.brand.name}
          </span>
        )}

        {/* Tên sản phẩm - Tăng kích thước và độ đậm */}
        <h3 className="text-base md:text-lg font-bold text-mono-900 mb-2 line-clamp-2 flex-grow leading-snug">
          {product.name}
        </h3>

        {/* Giá và đánh giá */}
        <div className="mt-auto pt-2">
          {renderPrice()}
          {renderRating()}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
