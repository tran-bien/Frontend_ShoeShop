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
  // State cho hi?u ẩng fade-in khi ẩnh được tại
  const [imageLoaded, setImageLoaded] = useState(false);

  // State cho hi?u ẩng slide ẩnh
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Compare context
  const { addToCompareById, removeFromCompare, isInCompare, isLoading } =
    useCompare();

  // Ki?m tra chỉc chơn images là mẩng và có nhi?u hon 1 phần t?
  const hasMultipleImages =
    product && Array.isArray(product.images) && product.images.length > 1;

  // Hi?u ẩng slide ẩnh với t?c d? v?a ph?i (3 giây cho mới ẩnh)
  useEffect(() => {
    if (!hasMultipleImages || !product) return;

    const interval = setInterval(() => {
      // Ki?m tra images tên tại trước khi truy c?p length
      if (Array.isArray(product.images) && product.images.length > 0) {
        setCurrentImageIndex((prev) => (prev + 1) % product.images!.length);
        // Reset trạng thái imageLoaded khi chuyện ẩnh
        setImageLoaded(false);
      }
    }, 3000); // T?c d? chuyện ẩnh v?a ph?i: 3 giây

    return () => clearInterval(interval);
  }, [product, product?.images, hasMultipleImages]);

  // Guard clause - return null if product is undefined
  // MUST be after all hooks
  if (!product || !product._id) {
    return null;
  }

  const inCompare = isInCompare(product._id);

  // Get image URL to display với ki?m tra null/undefined
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
    // 3. If out_of_stock and price is 0 -> show "H?t hàng"

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
      return <div className="text-sm font-medium text-mono-700">H?t hàng</div>;
    }

    if (hasRange && displayMax && displayMin !== displayMax) {
      return (
        <div className="flex flex-col">
          <span className="text-mono-900 font-bold text-base md:text-lg">
            {displayMin.toLocaleString()} - {displayMax.toLocaleString()}d
          </span>
          {product.originalPrice && (
            <span className="text-mono-400 text-sm line-through">
              G?c: {product.originalPrice.toLocaleString()}d
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
              {finalPrice.toLocaleString()}d
            </span>
            {product.originalPrice && (
              <span className="text-mono-400 text-sm line-through">
                {product.originalPrice.toLocaleString()}d
              </span>
            )}
          </>
        ) : (
          <span className="text-mono-900 font-bold text-base md:text-lg">
            {finalPrice.toLocaleString()}d
          </span>
        )}
      </div>
    );
  };

  // Hiện thọ rating bảng các icon sao
  const renderRating = () => {
    // N?u không có review count thì vẩn hiện thọ 5 sao rẩng
    // Chờ ẩn phần rating khi c? hai di?u kiẩn đầu không tên tại
    if (
      product.reviewCount === undefined &&
      product.averageRating === undefined
    ) {
      return null;
    }

    // L?y rating, n?u không có thì m?c đếnh là 0
    const rating = product.averageRating || 0;
    const reviewCount = product.reviewCount || 0;
    const stars = [];

    // T?o 5 sao đánh giá
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
    >
      {/* Phần ẩnh sản phẩm với hi?u ẩng chuyện đổi m?m mới */}
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
              ? "Ðang tại..."
              : inCompare
              ? "Xóa kh?i so sánh"
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

        {/* Hiện thọ các chờ báo slide n?u có nhi?u ẩnh */}
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

        {/* Stock status */}
        {product.stockStatus === "out_of_stock" && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-center py-1.5 text-sm font-medium">
            H?t hàng
          </div>
        )}
        {product.stockStatus === "low_stock" && (
          <div className="absolute bottom-0 left-0 right-0 bg-mono-600 bg-opacity-70 text-white text-center py-1.5 text-sm font-medium">
            S?p h?t hàng
          </div>
        )}
      </div>

      {/* Thông tin sản phẩm - c?i thiện d? rõ ràng */}
      <div className="p-4 flex flex-col flex-1">
        {/* Thuong hi?u */}
        {product.brand && (
          <span className="text-sm font-medium text-mono-500 mb-1.5">
            {product.brand.name}
          </span>
        )}

        {/* Tên sản phẩm - Tang kích thước và d? d?m */}
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



