import React, { useState } from "react";
import Modal from "react-modal";
import { FaStar, FaRegStar } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { reviewApi } from "../../services/ReviewService";

// Đảm bảo modal có thể truy cập được cho screen readers
Modal.setAppElement("#root");

interface CreateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orderId: string;
  orderItemId: string;
  productName: string;
  productImage: string;
}

const CreateReviewModal: React.FC<CreateReviewModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  orderId,
  orderItemId,
  productName,
  productImage,
}) => {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá");
      return;
    }

    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return;
    }

    if (content.trim().length < 10) {
      toast.error("Nội dung đánh giá phải có ít nhất 10 ký tự");
      return;
    }

    setLoading(true);
    try {
      const reviewData = {
        orderId,
        orderItemId,
        rating,
        content: content.trim(),
      };

      console.log("Đang gửi đánh giá với dữ liệu:", reviewData);
      const response = await reviewApi.createReview(reviewData);
      console.log("Response từ API:", response);

      // Kiểm tra response structure linh hoạt hơn
      const responseData = response.data || response;
      const isSuccess = responseData.success === true;

      if (isSuccess) {
        toast.success(responseData.message || "Đánh giá sản phẩm thành công");
        setRating(5);
        setContent("");
        onSuccess();
        onClose();
      } else {
        const errorMessage = responseData.message || "Không thể tạo đánh giá";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error("Lỗi khi gửi đánh giá:", error);

      let errorMessage = "Không thể tạo đánh giá";

      if (error.response) {
        const errorData = error.response.data;
        errorMessage =
          errorData?.message ||
          errorData?.error ||
          `Lỗi server: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Lỗi kết nối mạng. Vui lòng thử lại.";
      } else {
        errorMessage = error.message || "Đã xảy ra lỗi không xác định";
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const ratingText = [
    "",
    "Rất không hài lòng",
    "Không hài lòng",
    "Bình thường",
    "Hài lòng",
    "Rất hài lòng",
  ];

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Đánh giá sản phẩm"
      className="max-w-md mx-auto mt-20 bg-white p-5 rounded-lg shadow-lg"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center"
    >
      <h2 className="text-lg font-bold mb-3">Đánh giá sản phẩm</h2>

      <div className="flex items-center space-x-3 mb-3 p-2 bg-gray-50 rounded-lg">
        <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
          {productImage ? (
            <img
              src={productImage}
              alt={productName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
              No image
            </div>
          )}
        </div>
        <div className="overflow-hidden">
          <h3 className="font-medium text-sm truncate">{productName}</h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-2">
            Đánh giá của bạn:
          </label>
          <div className="flex items-center space-x-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-2xl hover:scale-110 transition-transform"
              >
                {star <= (hoverRating || rating) ? (
                  <FaStar className="text-yellow-400" />
                ) : (
                  <FaRegStar className="text-gray-300" />
                )}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            {ratingText[hoverRating || rating]}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Nội dung đánh giá:
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm... (ít nhất 10 ký tự)"
            className="w-full p-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">
            {content.length}/500 ký tự
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading || content.trim().length < 10}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateReviewModal;
