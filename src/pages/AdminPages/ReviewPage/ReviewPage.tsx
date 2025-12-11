import { useState, useEffect } from "react";
import {
  FaStar,
  FaRegStar,
  FaEye,
  FaEyeSlash,
  FaReply,
  FaTrash,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import { adminReviewApi } from "../../../services/ReviewService";
import { Review, ReviewOrderItem } from "../../../types/review";
import { toast } from "react-hot-toast";
import ReviewDetailModal from "./ReviewDetailModal";
import ReviewReplyModal from "./ReviewReplyModal";

const ReviewPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [deletedReviews, setDeletedReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [hasReplyFilter, setHasReplyFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState("createdAt_desc");

  // Modals
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);

  const limit = 10;

  const fetchReviews = async (page: number = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = {
        page,
        limit,
        ...(searchQuery && { search: searchQuery }),
        ...(ratingFilter !== "all" && { rating: ratingFilter }),
        ...(hasReplyFilter !== "all" && {
          hasReply: hasReplyFilter === "true",
        }),
        sort: sortOption,
      };

      const res = showDeleted
        ? await adminReviewApi.getAllReviewsDeleted(params)
        : await adminReviewApi.getAllReviews(params);

      const data = res.data.data || [];
      const pagination = res.data.pagination;

      if (showDeleted) {
        setDeletedReviews(Array.isArray(data) ? data : []);
      } else {
        setReviews(Array.isArray(data) ? data : []);
      }
      setTotalPages(pagination?.totalPages || 1);
      setTotalReviews(
        pagination?.totalItems || (Array.isArray(data) ? data.length : 0)
      );
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      if (showDeleted) {
        setDeletedReviews([]);
      } else {
        setReviews([]);
      }
      setTotalPages(1);
      setTotalReviews(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    showDeleted,
    currentPage,
    searchQuery,
    ratingFilter,
    hasReplyFilter,
    sortOption,
  ]);

  const handleToggleVisibility = async (review: Review) => {
    try {
      const newHiddenState = review.isActive;
      await adminReviewApi.toggleReviewVisibility(review._id, newHiddenState);
      toast.success(newHiddenState ? "Đã ẩn đánh giá" : "Đã hiện đánh giá");
      fetchReviews(currentPage);
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error("Không thể thay đổi trạng thái");
    }
  };

  const handleDeleteReply = async (reviewId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phản hồi này?")) return;

    try {
      await adminReviewApi.deleteReply(reviewId);
      toast.success("Đã xóa phản hồi");
      fetchReviews(currentPage);
    } catch (error) {
      console.error("Error deleting reply:", error);
      toast.error("Không thể xóa phản hồi");
    }
  };

  const handleViewDetail = (review: Review) => {
    setSelectedReview(review);
    setShowDetailModal(true);
  };

  const handleOpenReply = (review: Review) => {
    setSelectedReview(review);
    setShowReplyModal(true);
  };

  const onReplySuccess = () => {
    setShowReplyModal(false);
    fetchReviews(currentPage);
  };

  // Helper function to get product info from review (supports both orderItem and product)
  const getReviewProductInfo = (review: Review) => {
    // Check if orderItem is populated (object) with product
    if (typeof review.orderItem === "object" && review.orderItem?.product) {
      const orderItem = review.orderItem as ReviewOrderItem;
      return {
        name: orderItem.product?.name || "Sản phẩm không tồn tại",
        image: orderItem.product?.images?.[0]?.url || null,
        variant: orderItem.variant?.color?.name || null,
        variantCode: orderItem.variant?.color?.code || null,
        size: orderItem.size?.value || null,
      };
    }
    // Fallback to direct product (if BE populates it directly)
    if (review.product) {
      return {
        name: review.product.name || "Sản phẩm không tồn tại",
        image: review.product.images?.[0]?.url || null,
        variant: null,
        variantCode: null,
        size: null,
      };
    }
    // No product info available
    return {
      name: "Sản phẩm không tồn tại",
      image: null,
      variant: null,
      variantCode: null,
      size: null,
    };
  };

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

  const displayedReviews = showDeleted ? deletedReviews : reviews;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-mono-800">Quản lý Đánh giá</h1>
          <p className="text-mono-500 mt-1">
            {totalReviews} đánh giá {showDeleted ? "đã xóa" : ""}
          </p>
        </div>
        <button
          onClick={() => {
            setShowDeleted(!showDeleted);
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            showDeleted
              ? "bg-mono-800 text-white"
              : "bg-mono-100 text-mono-800 hover:bg-mono-200"
          }`}
        >
          {showDeleted ? "Xem đánh giá hoạt động" : "Xem đánh giá đã xóa"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-mono-500 text-sm">Tổng đánh giá</p>
              <p className="text-2xl font-bold text-mono-800">{totalReviews}</p>
            </div>
            <FaStar className="text-yellow-500" size={40} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-mono-500 text-sm">5 sao</p>
              <p className="text-2xl font-bold text-green-600">
                {displayedReviews.filter((r) => r.rating === 5).length}
              </p>
            </div>
            <div className="flex">{renderStars(5)}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-mono-500 text-sm">Có phản hồi</p>
              <p className="text-2xl font-bold text-blue-600">
                {displayedReviews.filter((r) => r.reply).length}
              </p>
            </div>
            <FaReply className="text-blue-500" size={40} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-mono-500 text-sm">Đang ẩn</p>
              <p className="text-2xl font-bold text-orange-600">
                {displayedReviews.filter((r) => !r.isActive).length}
              </p>
            </div>
            <FaEyeSlash className="text-orange-500" size={40} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên sản phẩm, người dùng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500"
            />
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-mono-400" />
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500"
            >
              <option value="all">Tất cả sao</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>

          {/* Has Reply Filter */}
          <select
            value={hasReplyFilter}
            onChange={(e) => setHasReplyFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500"
          >
            <option value="all">Tất cả phản hồi</option>
            <option value="true">Đã phản hồi</option>
            <option value="false">Chưa phản hồi</option>
          </select>

          {/* Sort */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500"
          >
            <option value="createdAt_desc">Mới nhất</option>
            <option value="createdAt_asc">Cũ nhất</option>
            <option value="rating_desc">Sao cao nhất</option>
            <option value="rating_asc">Sao thấp nhất</option>
            <option value="numberOfLikes_desc">Nhiều like nhất</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-mono-800 mx-auto"></div>
            <p className="mt-4 text-mono-500">Đang tải...</p>
          </div>
        ) : displayedReviews.length === 0 ? (
          <div className="p-8 text-center">
            <FaRegStar className="mx-auto text-4xl text-mono-300 mb-3" />
            <p className="text-mono-500">Không có đánh giá nào</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-mono-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                  Người đánh giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                  Đánh giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                  Nội dung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                  Likes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-mono-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedReviews.map((review) => {
                const productInfo = getReviewProductInfo(review);
                return (
                  <tr key={review._id} className="hover:bg-mono-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {productInfo.image ? (
                          <img
                            src={productInfo.image}
                            alt={productInfo.name}
                            className="w-10 h-10 rounded object-cover mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-mono-200 mr-3 flex items-center justify-center text-xs text-mono-400">
                            N/A
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-mono-800 font-medium truncate max-w-[150px]">
                            {productInfo.name}
                          </span>
                          {/* Hiển thị variant và size nếu có */}
                          {(productInfo.variant || productInfo.size) && (
                            <span className="text-xs text-mono-500 flex items-center gap-1 mt-0.5">
                              {productInfo.variant && (
                                <span className="flex items-center gap-1">
                                  <span
                                    className="w-3 h-3 rounded-full border border-mono-300"
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
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-mono-700">
                        {review.user?.name || "Ẩn danh"}
                      </span>
                    </td>
                    <td className="px-6 py-4">{renderStars(review.rating)}</td>
                    <td className="px-6 py-4">
                      <p
                        className="text-mono-600 truncate max-w-[200px]"
                        title={review.content}
                      >
                        {review.content}
                      </p>
                      {review.reply && (
                        <span className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                          <FaReply size={10} /> Đã phản hồi
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-mono-700">
                        {review.numberOfLikes || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          review.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {review.isActive ? "Hiện" : "Ẩn"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-mono-500 text-sm">
                      {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewDetail(review)}
                          className="p-2 text-mono-500 hover:text-mono-800 hover:bg-mono-100 rounded transition-colors"
                          title="Xem chi tiết"
                        >
                          <FaEye size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleVisibility(review)}
                          className={`p-2 rounded transition-colors ${
                            review.isActive
                              ? "text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                              : "text-green-500 hover:text-green-700 hover:bg-green-50"
                          }`}
                          title={
                            review.isActive ? "Ẩn đánh giá" : "Hiện đánh giá"
                          }
                        >
                          {review.isActive ? (
                            <FaEyeSlash size={16} />
                          ) : (
                            <FaEye size={16} />
                          )}
                        </button>
                        {!review.reply ? (
                          <button
                            onClick={() => handleOpenReply(review)}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                            title="Phản hồi"
                          >
                            <FaReply size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeleteReply(review._id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Xóa phản hồi"
                          >
                            <FaTrash size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <p className="text-mono-500 text-sm">
              Trang {currentPage} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-mono-50"
              >
                Trước
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-mono-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedReview && (
        <ReviewReplyModal
          review={selectedReview}
          onClose={() => setShowReplyModal(false)}
          onSuccess={onReplySuccess}
        />
      )}
    </div>
  );
};

export default ReviewPage;
