import { useState, useEffect } from "react";
import { FaStar, FaRegStar, FaUser, FaTimes, FaHeart } from "react-icons/fa";
import type { Review, ReviewOrderItem } from "../../../types/review";
import { adminReviewApi } from "../../../services/ReviewService";

interface ReviewDetailModalProps {
  review: Review;
  onClose: () => void;
}

const ReviewDetailModal = ({
  review: initialReview,
  onClose,
}: ReviewDetailModalProps) => {
  const [review, setReview] = useState<Review>(initialReview);
  const [loading, setLoading] = useState(true);

  // Fetch fresh data when modal opens
  useEffect(() => {
    const fetchReviewDetail = async () => {
      try {
        setLoading(true);
        const res = await adminReviewApi.getReviewById(initialReview._id);
        // BE returns { success, review, isDeleted }
        const reviewData = res.data.review || res.data.data || res.data;
        if (reviewData && reviewData._id) {
          setReview(reviewData);
        }
      } catch (error) {
        console.error("Error fetching review detail:", error);
        // Keep initial data if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchReviewDetail();
  }, [initialReview._id]);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-yellow-500 w-5 h-5" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-500 w-5 h-5" />);
      }
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  // Helper function to get product info from review
  const getProductInfo = () => {
    // Get variant/size info from orderItem (populated by BE aggregate)
    const orderItem =
      typeof review.orderItem === "object"
        ? (review.orderItem as ReviewOrderItem)
        : null;

    const variantInfo = {
      variant: orderItem?.variant?.color?.name || null,
      variantCode: orderItem?.variant?.color?.code || null,
      size: orderItem?.size?.value?.toString() || null,
    };

    // Priority 1: Use direct product field if available
    if (review.product && typeof review.product === "object") {
      const product = review.product;
      return {
        name:
          product.name || orderItem?.productName || "Sản phẩm không tồn tại",
        image: product.images?.[0]?.url || orderItem?.image || null,
        slug: product.slug || null,
        ...variantInfo,
      };
    }

    // Priority 2: Use orderItem data directly (from BE aggregate)
    if (orderItem) {
      return {
        name:
          orderItem.productName ||
          orderItem.product?.name ||
          "Sản phẩm không tồn tại",
        image: orderItem.image || orderItem.product?.images?.[0]?.url || null,
        slug: null,
        ...variantInfo,
      };
    }

    return {
      name: "Sản phẩm không tồn tại",
      image: null,
      slug: null,
      variant: null,
      variantCode: null,
      size: null,
    };
  };

  const productInfo = getProductInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-mono-800">Chi tiết đánh giá</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-mono-100 rounded-full transition-colors"
          >
            <FaTimes className="text-mono-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mono-800"></div>
              <span className="ml-3 text-mono-500">Đang tải...</span>
            </div>
          ) : (
            <>
              {/* Product Info */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-mono-50 rounded-lg">
                {productInfo.image ? (
                  <img
                    src={productInfo.image}
                    alt={productInfo.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-mono-200 flex items-center justify-center text-mono-400">
                    N/A
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-mono-800 text-lg">
                    {productInfo.name}
                  </h3>
                  {/* Hiển thị variant và size nếu có */}
                  {(productInfo.variant || productInfo.size) && (
                    <div className="flex items-center gap-2 mt-1 text-sm text-mono-600">
                      {productInfo.variant && (
                        <span className="flex items-center gap-1">
                          <span
                            className="w-4 h-4 rounded-full border border-mono-300"
                            style={{
                              backgroundColor:
                                productInfo.variantCode || "#ccc",
                            }}
                          />
                          {productInfo.variant}
                        </span>
                      )}
                      {productInfo.variant && productInfo.size && (
                        <span>•</span>
                      )}
                      {productInfo.size && (
                        <span>Size: {productInfo.size}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Reviewer Info */}
              <div className="flex items-center gap-4 mb-6">
                {review.user?.avatar?.url ? (
                  <img
                    src={review.user.avatar.url}
                    alt={review.user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-mono-200 flex items-center justify-center">
                    <FaUser className="text-mono-500" />
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-mono-800">
                    {review.user?.name || "Ẩn danh"}
                  </h4>
                  <p className="text-mono-500 text-sm">
                    Đánh giá vào{" "}
                    {new Date(review.createdAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-4">
                <label className="text-mono-500 text-sm block mb-1">
                  Đánh giá
                </label>
                <div className="flex items-center gap-2">
                  {renderStars(review.rating)}
                  <span className="text-mono-700 font-medium">
                    {review.rating}/5
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="mb-4">
                <label className="text-mono-500 text-sm block mb-1">
                  Nội dung
                </label>
                <p className="text-mono-700 whitespace-pre-line bg-mono-50 p-4 rounded-lg">
                  {review.content}
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <FaHeart className="text-red-500" />
                  <span className="text-mono-700">
                    {review.numberOfLikes || 0} lượt thích
                  </span>
                </div>
              </div>

              {/* Reply */}
              {review.reply && (
                <div className="mt-6 p-4 bg-mono-100 rounded-lg border-l-4 border-mono-400">
                  <div className="flex items-center gap-3 mb-2">
                    {review.reply.repliedBy?.avatar?.url ? (
                      <img
                        src={review.reply.repliedBy.avatar.url}
                        alt={review.reply.repliedBy.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-mono-300 flex items-center justify-center">
                        <FaUser className="text-mono-600 text-sm" />
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-mono-800">
                        {review.reply.repliedBy?.name || "Quản trị viên"}
                      </span>
                      <span className="ml-2 px-2 py-0.5 bg-mono-200 text-mono-700 text-xs rounded-full">
                        {review.reply.repliedBy?.role === "admin"
                          ? "Admin"
                          : "Nhân viên"}
                      </span>
                    </div>
                  </div>
                  <p className="text-mono-700 whitespace-pre-line">
                    {review.reply.content}
                  </p>
                  <p className="text-mono-500 text-xs mt-2">
                    Phản hồi vào{" "}
                    {new Date(review.reply.repliedAt).toLocaleDateString(
                      "vi-VN",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              )}

              {/* Deleted Info */}
              {review.deletedAt && (
                <div className="mt-4 p-3 bg-mono-100 rounded-lg text-mono-700">
                  <p className="text-sm">
                    Đã xóa vào{" "}
                    {new Date(review.deletedAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-mono-100 text-mono-800 rounded-lg hover:bg-mono-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailModal;
