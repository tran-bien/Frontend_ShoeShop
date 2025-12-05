import React, { useEffect, useState } from "react";
import {
  reviewApi,
  adminReviewApi,
  Review,
} from "../../services/ReviewService";
import {
  FaHeart,
  FaRegHeart,
  FaStar,
  FaRegStar,
  FaUser,
  FaReply,
} from "react-icons/fa";
import { FiSend, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface ProductCommentsProps {
  productId: string;
}

const ProductComments: React.FC<ProductCommentsProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});
  const [likeLoading, setLikeLoading] = useState<Record<string, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin or staff
  const isAdminOrStaff = user?.role === "admin" || user?.role === "staff";

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await reviewApi.getReviewsByProduct(productId);
        console.log("Reviews data:", res.data);
        setReviews(res.data.data || []);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchReviews();
  }, [productId]);

  const handleLikeReview = async (reviewId: string) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thích đánh giá");
      navigate("/login");
      return;
    }

    setLikeLoading((prev) => ({ ...prev, [reviewId]: true }));
    try {
      // Toggle: nếu đã like thì gọi unlike, ngược lại gọi like
      const isCurrentlyLiked = likedReviews[reviewId];
      const response = isCurrentlyLiked
        ? await reviewApi.unlikeReview(reviewId)
        : await reviewApi.likeReview(reviewId);

      if (response.data.success) {
        // Cập nhật trạng thái like
        setLikedReviews((prev) => ({ ...prev, [reviewId]: !isCurrentlyLiked }));

        // Cập nhật số lượng like trong reviews
        setReviews((prev) =>
          prev.map((review) =>
            review._id === reviewId
              ? {
                  ...review,
                  numberOfLikes:
                    response.data.data?.numberOfLikes ?? review.numberOfLikes,
                }
              : review
          )
        );

        toast.success(
          isCurrentlyLiked ? "Đã bỏ thích đánh giá" : "Đã thích đánh giá"
        );
      }
    } catch (error) {
      console.error("Error toggling like review:", error);
      toast.error("Không thể thực hiện thao tác này");
    } finally {
      setLikeLoading((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  // Handle reply to review (admin/staff only)
  const handleReplySubmit = async (reviewId: string) => {
    if (!replyContent.trim()) {
      toast.error("Vui lòng nhập nội dung phần h?i");
      return;
    }

    setReplyLoading(true);
    try {
      const response = editingReply
        ? await adminReviewApi.updateReply(reviewId, replyContent.trim())
        : await adminReviewApi.replyToReview(reviewId, replyContent.trim());

      if (response.data.success) {
        toast.success(
          editingReply ? "Ðã cập nhật phần h?i" : "Ðã gửi phần h?i"
        );
        // Update the review in local state
        setReviews((prev) =>
          prev.map((review) =>
            review._id === reviewId
              ? { ...review, reply: response.data.data?.reply }
              : review
          )
        );
        setReplyingTo(null);
        setEditingReply(null);
        setReplyContent("");
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast.error("Không thể gửi phần h?i");
    } finally {
      setReplyLoading(false);
    }
  };

  // Handle delete reply
  const handleDeleteReply = async (reviewId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phản hồi này?")) return;

    try {
      const response = await adminReviewApi.deleteReply(reviewId);
      if (response.data.success) {
        toast.success("Đã xóa phản hồi");
        setReviews((prev) =>
          prev.map((review) =>
            review._id === reviewId ? { ...review, reply: undefined } : review
          )
        );
      }
    } catch (error) {
      console.error("Error deleting reply:", error);
      toast.error("Không thể xóa phần h?i");
    }
  };

  // Start editing reply
  const handleEditReply = (reviewId: string, currentContent: string) => {
    setReplyingTo(reviewId);
    setEditingReply(reviewId);
    setReplyContent(currentContent);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-mono-600 w-5 h-5" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-mono-600 w-5 h-5" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="p-6 bg-mono-50 rounded-lg shadow-sm">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-mono-black"></div>
        </div>
        <p className="text-center mt-3 text-mono-500 font-medium">
          Đang tải đánh giá...
        </p>
      </div>
    );
  }

  // Hiển thị danh sách đánh giá
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header Section */}
      <div className="px-8 py-6 border-b border-mono-100 flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-mono-800">
            Đánh giá sản phẩm
          </h3>
          <p className="text-mono-500 mt-1 font-medium">
            {reviews.length} đánh giá từ khách hàng
          </p>
        </div>
        <div className="text-right">
          <span className="text-4xl font-bold text-mono-600">
            {reviews.length > 0
              ? (
                  reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                ).toFixed(1)
              : "0.0"}
          </span>
          <div className="flex justify-end mt-1">
            {renderStars(
              reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : 0
            )}
          </div>
        </div>
      </div>

      {/* Review List */}
      {reviews.length === 0 ? (
        <div className="p-8 text-center">
          <FaRegStar className="mx-auto text-4xl text-mono-300 mb-3" />
          <h3 className="text-xl font-medium text-mono-700 mb-2">
            Chưa có đánh giá nào
          </h3>
          <p className="text-mono-500">
            Hãy là người đầu tiên đánh giá sản phẩm này
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {reviews.map((review) => (
            <div key={review._id} className="p-6">
              <div className="flex items-start">
                {/* Reviewer Avatar */}
                <div className="flex-shrink-0 mr-4">
                  {review.user.avatar?.url ? (
                    <img
                      src={review.user.avatar.url}
                      alt={review.user.name}
                      className="w-12 h-12 rounded-full object-cover border border-mono-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "/image/avatar-placeholder.png";
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-mono-200 flex items-center justify-center">
                      <FaUser className="text-mono-500" />
                    </div>
                  )}
                </div>

                {/* Review Content */}
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-mono-800">
                      {review.user.name}
                    </h4>
                    <span className="text-mono-500 text-sm">
                      {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  {/* Star Rating */}
                  <div className="flex mt-1 mb-2">
                    {renderStars(review.rating)}
                  </div>

                  <p className="text-mono-700 whitespace-pre-line">
                    {review.content}
                  </p>

                  {/* Like Button and Reply Button */}
                  <div className="mt-3 flex items-center gap-4">
                    <button
                      onClick={() => handleLikeReview(review._id)}
                      disabled={likeLoading[review._id]}
                      className={`flex items-center space-x-1 ${
                        likedReviews[review._id]
                          ? "text-mono-800"
                          : "text-mono-500 hover:text-mono-800"
                      } transition-colors disabled:opacity-50`}
                    >
                      {likedReviews[review._id] ? <FaHeart /> : <FaRegHeart />}
                      <span className="text-sm">
                        {review.numberOfLikes || 0} h?u ích
                      </span>
                    </button>

                    {/* Reply button for admin/staff */}
                    {isAdminOrStaff && !review.reply && (
                      <button
                        onClick={() => {
                          setReplyingTo(review._id);
                          setEditingReply(null);
                          setReplyContent("");
                        }}
                        className="flex items-center gap-1 text-mono-500 hover:text-mono-800 transition-colors text-sm"
                      >
                        <FaReply />
                        <span>Phần h?i</span>
                      </button>
                    )}
                  </div>

                  {/* Reply Display */}
                  {review.reply && (
                    <div className="mt-4 ml-4 p-4 bg-mono-50 rounded-lg border-l-4 border-mono-400">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
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
                            <span className="font-medium text-mono-800 text-sm">
                              {review.reply.repliedBy?.name || "Quận trở viên"}
                            </span>
                            <span className="ml-2 px-2 py-0.5 bg-mono-200 text-mono-700 text-xs rounded-full">
                              {review.reply.repliedBy?.role === "admin"
                                ? "Admin"
                                : "Nhân viên"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-mono-500 text-xs">
                            {new Date(
                              review.reply.repliedAt
                            ).toLocaleDateString("vi-VN")}
                          </span>
                          {isAdminOrStaff && (
                            <>
                              <button
                                onClick={() =>
                                  handleEditReply(
                                    review._id,
                                    review.reply!.content
                                  )
                                }
                                className="p-1 text-mono-500 hover:text-mono-800 transition-colors"
                                title="Chơnh sửa"
                              >
                                <FiEdit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteReply(review._id)}
                                className="p-1 text-mono-500 hover:text-mono-700 transition-colors"
                                title="Xóa"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-mono-700 text-sm whitespace-pre-line">
                        {review.reply.content}
                      </p>
                    </div>
                  )}

                  {/* Reply Form */}
                  {replyingTo === review._id && isAdminOrStaff && (
                    <div className="mt-4 ml-4 p-4 bg-mono-50 rounded-lg">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Nhập phản hồi của bạn..."
                        className="w-full px-3 py-2 border border-mono-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-mono-500"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setEditingReply(null);
                            setReplyContent("");
                          }}
                          className="px-3 py-1.5 text-sm text-mono-600 hover:text-mono-800 transition-colors"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => handleReplySubmit(review._id)}
                          disabled={replyLoading || !replyContent.trim()}
                          className="px-3 py-1.5 bg-mono-900 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-mono-800 disabled:bg-mono-400 disabled:cursor-not-allowed transition-colors"
                        >
                          {replyLoading ? (
                            <span className="animate-spin">?</span>
                          ) : (
                            <FiSend size={14} />
                          )}
                          <span>{editingReply ? "Cập nhật" : "Gửi"}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductComments;
