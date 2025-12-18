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
  // State cho hiệu ứng slide ảnh
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // State cho hover để chỉ chạy slider khi hover
  const [isHovering, setIsHovering] = useState(false);

  // Compare context
  const { addToCompareById, removeFromCompare, isInCompare, isLoading } =
    useCompare();

  // Kiểm tra chắc chắn images là mảng và có nhiều hơn 1 phần tử
  const hasMultipleImages =
    product && Array.isArray(product.images) && product.images.length > 1;

  // CHỈ chạy slider KHI hover
  useEffect(() => {
    // KHÔNG chạy nếu không hover hoặc không có nhiều ảnh
    if (!isHovering || !hasMultipleImages) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        if (product.images && product.images.length > 0) {
          return (prev + 1) % product.images.length;
        }
        return prev;
      });
    }, 800); // 0.8 giây mỗi ảnh

    return () => clearInterval(interval);
  }, [isHovering, hasMultipleImages, product.images]);

  // Reset về ảnh đầu khi rời chuột
  useEffect(() => {
    if (!isHovering) {
      setCurrentImageIndex(0);
    }
  }, [isHovering]);

  // Guard clause - return null if product is undefined
  // MUST be after all hooks
  if (!product || !product._id) {
    return null;
  }

  const inCompare = isInCompare(product._id);

  // Get image URL to display
  const imageUrl =
    hasMultipleImages && Array.isArray(product.images)
      ? product.images[currentImageIndex]?.url || ""
      : product.mainImage ||
        (Array.isArray(product.images) && product.images.length > 0
          ? product.images[0]?.url
          : "/placeholder.jpg");

  // Xử lý khoảng giá
  const renderPrice = () => {
    // Priority for displaying price:
    // 1. Use product.priceRange if valid (min/max or single)
    // 2. Fallback to product.price or originalPrice
    // 3. If out_of_stock and price is 0 -> show "Hết hàng"

    const inStock = product.stockStatus !== "out_of_stock";

    // Try top-level priceRange first, fallback to variantSummary.priceRange
    const pr = product.priceRange;
    const prVariant = product.variantSummary?.priceRange;

    const hasRange = !!(pr && pr.min != null && pr.max != null && pr.min > 0);
    const displayMin: number = hasRange
      ? (pr!.min as number)
      : prVariant?.min ?? product.price ?? product.priceRange?.min ?? 0;
    const displayMax: number | null = hasRange ? (pr!.max as number) : null;

    if (!inStock && (!displayMin || displayMin === 0)) {
      return <div className="text-sm font-medium text-mono-700">Hết hàng</div>;
    }

    if (hasRange && displayMax && displayMin !== displayMax) {
      return (
        <div className="flex flex-col">
          <span className="text-mono-900 font-bold text-base md:text-lg">
            {displayMin.toLocaleString()} - {displayMax.toLocaleString()}đ
          </span>
          {product.originalPrice && (
            <span className="text-mono-400 text-sm line-through">
              Gốc: {product.originalPrice.toLocaleString()}đ
            </span>
          )}
        </div>
      );
    }

    // Single price
    const finalPrice = product.price ?? pr?.min ?? prVariant?.min ?? 0;
    return (
      <div className="flex flex-col">
        {product.hasDiscount ? (
          <>
            <span className="text-mono-900 font-bold text-base md:text-lg">
              {finalPrice.toLocaleString()}đ
            </span>
            {product.originalPrice && (
              <span className="text-mono-400 text-sm line-through">
                {product.originalPrice.toLocaleString()}đ
              </span>
            )}
          </>
        ) : (
          <span className="text-mono-900 font-bold text-base md:text-lg">
            {finalPrice.toLocaleString()}đ
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
          <FaStar key={i} className="text-mono-600 w-4 h-4" />
        ) : (
          <FaRegStar key={i} className="text-mono-600 w-4 h-4" />
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
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Phần ảnh sản phẩm với hiệu ứng chuyển đổi mềm mới */}
      <div className="aspect-square w-full overflow-hidden bg-mono-50 relative">
        {/* Compare Button - Top Left */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (inCompare) {
              removeFromCompare(product._id);
            } else {
              addToCompareById(product._id);
            }
          }}
          disabled={isLoading}
          className={`absolute top-2 left-2 z-20 p-2 rounded-full transition-all duration-200 ${
            inCompare
              ? "bg-mono-black text-white shadow-lg scale-110"
              : isLoading
              ? "bg-mono-300 text-mono-500 cursor-wait"
              : "bg-white/90 hover:bg-white text-mono-700 hover:scale-110 shadow-md"
          }`}
          title={
            isLoading
              ? "Đang tải..."
              : inCompare
              ? "Xóa khỏi so sánh"
              : "Thêm vào so sánh"
          }
        >
          {isLoading ? (
            <div className="animate-spin h-5 w-5 border-2 border-mono-700 border-t-transparent rounded-full"></div>
          ) : (
            <ArrowsRightLeftIcon className="h-5 w-5" />
          )}
        </button>

        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-contain object-center transition-transform duration-300 ease-in-out group-hover:scale-105"
          style={{
            transformOrigin: "center center",
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "/placeholder.jpg";
          }}
        />

        {/* Hiện thị các chờ báo slide nếu có nhiều ảnh */}
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

        {/* Sale tag - Sửa lỗi ki?m tra undefined */}
        {typeof product.salePercentage === "number" &&
          product.salePercentage > 0 && (
            <div className="absolute top-2 right-2 bg-mono-800 text-white text-xs font-bold px-2.5 py-1.5 rounded">
              -{product.salePercentage}%
            </div>
          )}

        {/* Stock status - chỉ hiện khi hết hàng */}
        {product.stockStatus === "out_of_stock" && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-center py-1.5 text-sm font-medium">
            Hết hàng
          </div>
        )}
      </div>

      {/* Thông tin sản phẩm - cải thiện để rõ ràng */}
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
