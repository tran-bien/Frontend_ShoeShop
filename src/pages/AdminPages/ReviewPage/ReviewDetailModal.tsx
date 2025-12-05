import { FaStar, FaRegStar, FaUser, FaTimes, FaHeart } from "react-icons/fa";
import type { Review } from "../../../services/ReviewService";

interface ReviewDetailModalProps {
  review: Review;
  onClose: () => void;
}

const ReviewDetailModal = ({ review, onClose }: ReviewDetailModalProps) => {
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
          {/* Product Info */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-mono-50 rounded-lg">
            {review.product?.images?.[0]?.url ? (
              <img
                src={review.product.images[0].url}
                alt={review.product.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-mono-200" />
            )}
            <div>
              <h3 className="font-semibold text-mono-800 text-lg">
                {review.product?.name || "Sản phẩm không tồn tại"}
              </h3>
              <p className="text-mono-500 text-sm">
                Slug: {review.product?.slug || "N/A"}
              </p>
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
            <label className="text-mono-500 text-sm block mb-1">Đánh giá</label>
            <div className="flex items-center gap-2">
              {renderStars(review.rating)}
              <span className="text-mono-700 font-medium">
                {review.rating}/5
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="mb-4">
            <label className="text-mono-500 text-sm block mb-1">Nội dung</label>
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
            <div>
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  review.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-orange-100 text-orange-800"
                }`}
              >
                {review.isActive ? "Đang hiện" : "Đang ẩn"}
              </span>
            </div>
          </div>

          {/* Reply */}
          {review.reply && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
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
                  <span className="ml-2 px-2 py-0.5 bg-blue-200 text-blue-700 text-xs rounded-full">
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
                {new Date(review.reply.repliedAt).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}

          {/* Deleted Info */}
          {review.deletedAt && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg text-red-700">
              <p className="text-sm">
                Đã xóa vào{" "}
                {new Date(review.deletedAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
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
