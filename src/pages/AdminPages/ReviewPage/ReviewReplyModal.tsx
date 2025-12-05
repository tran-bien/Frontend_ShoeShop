import { useState } from "react";
import { FaStar, FaRegStar, FaTimes } from "react-icons/fa";
import { adminReviewApi, Review } from "../../../services/ReviewService";
import { toast } from "react-hot-toast";

interface ReviewReplyModalProps {
  review: Review;
  onClose: () => void;
  onSuccess: () => void;
}

const ReviewReplyModal = ({
  review,
  onClose,
  onSuccess,
}: ReviewReplyModalProps) => {
  const [replyContent, setReplyContent] = useState(review.reply?.content || "");
  const [loading, setLoading] = useState(false);

  const isEditing = !!review.reply;

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-yellow-500 w-4 h-4" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-500 w-4 h-4" />);
      }
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyContent.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await adminReviewApi.updateReply(review._id, replyContent.trim());
        toast.success("Đã cập nhật phản hồi");
      } else {
        await adminReviewApi.replyToReview(review._id, replyContent.trim());
        toast.success("Đã gửi phản hồi");
      }
      onSuccess();
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast.error("Không thể gửi phản hồi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-mono-800">
            {isEditing ? "Chỉnh sửa phản hồi" : "Phản hồi đánh giá"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-mono-100 rounded-full transition-colors"
          >
            <FaTimes className="text-mono-500" />
          </button>
        </div>

        {/* Review Preview */}
        <div className="p-6 border-b bg-mono-50">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-medium text-mono-800">
              {review.user?.name || "Ẩn danh"}
            </span>
            {renderStars(review.rating)}
          </div>
          <p className="text-mono-600 text-sm line-clamp-3">{review.content}</p>
          <p className="text-mono-400 text-xs mt-2">
            Đánh giá: {review.product?.name || "Sản phẩm"}
          </p>
        </div>

        {/* Reply Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <label className="block text-mono-700 font-medium mb-2">
            Nội dung phản hồi
          </label>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Nhập nội dung phản hồi của bạn..."
            rows={5}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 resize-none"
            disabled={loading}
          />

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 bg-mono-100 text-mono-800 rounded-lg hover:bg-mono-200 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !replyContent.trim()}
              className="px-6 py-2 bg-mono-800 text-white rounded-lg hover:bg-mono-900 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang gửi...
                </>
              ) : isEditing ? (
                "Cập nhật"
              ) : (
                "Gửi phản hồi"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewReplyModal;
