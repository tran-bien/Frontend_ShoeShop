import React, { useEffect, useState } from "react";
import { reviewApi, Review } from "../../services/ReviewServiceV2";
import { FaHeart, FaRegHeart, FaStar, FaRegStar, FaUser } from "react-icons/fa";
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
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
      const response = await reviewApi.likeReview(reviewId);
      if (response.data.success) {
        // Cập nhật trạng thái like
        setLikedReviews((prev) => ({ ...prev, [reviewId]: !prev[reviewId] }));

        // Cập nhật số lượng like trong reviews
        setReviews((prev) =>
          prev.map((review) =>
            review._id === reviewId
              ? {
                  ...review,
                  numberOfLikes:
                    response.data.data?.numberOfLikes || review.numberOfLikes,
                }
              : review
          )
        );
      }
    } catch (error) {
      console.error("Error liking review:", error);
      toast.error("Không thể thích đánh giá này");
    } finally {
      setLikeLoading((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-yellow-400 w-5 h-5" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400 w-5 h-5" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-center mt-3 text-gray-500 font-medium">
          Đang tải đánh giá...
        </p>
      </div>
    );
  }

  // Hiển thị danh sách đánh giá
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header Section */}
      <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">
            Đánh giá sản phẩm
          </h3>
          <p className="text-gray-500 mt-1 font-medium">
            {reviews.length} đánh giá từ khách hàng
          </p>
        </div>
        <div className="text-right">
          <span className="text-4xl font-bold text-yellow-500">
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
          <FaRegStar className="mx-auto text-4xl text-gray-300 mb-3" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            Chưa có đánh giá nào
          </h3>
          <p className="text-gray-500">
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
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "/image/avatar-placeholder.png";
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <FaUser className="text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Review Content */}
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-800">
                      {review.user.name}
                    </h4>
                    <span className="text-gray-500 text-sm">
                      {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  {/* Star Rating */}
                  <div className="flex mt-1 mb-2">
                    {renderStars(review.rating)}
                  </div>

                  <p className="text-gray-700 whitespace-pre-line">
                    {review.content}
                  </p>

                  {/* Like Button */}
                  <div className="mt-3 flex items-center">
                    <button
                      onClick={() => handleLikeReview(review._id)}
                      disabled={likeLoading[review._id]}
                      className={`flex items-center space-x-1 ${
                        likedReviews[review._id]
                          ? "text-red-500"
                          : "text-gray-500 hover:text-red-500"
                      } transition-colors disabled:opacity-50`}
                    >
                      {likedReviews[review._id] ? <FaHeart /> : <FaRegHeart />}
                      <span className="text-sm">
                        {review.numberOfLikes || 0} hữu ích
                      </span>
                    </button>
                  </div>
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
