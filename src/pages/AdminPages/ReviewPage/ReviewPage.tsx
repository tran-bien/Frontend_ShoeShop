import { useState, useEffect } from "react";
import { FaStar, FaRegStar, FaReply, FaFilter } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { adminReviewApi } from "../../../services/ReviewService";
import { Review, ReviewOrderItem } from "../../../types/review";
import { toast } from "react-hot-toast";
import ReviewDetailModal from "./ReviewDetailModal";
import ReviewReplyModal from "./ReviewReplyModal";

const ReviewPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  // Search & Filters
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [hasReplyFilter, setHasReplyFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState("createdAt_desc");

  // Stats
  const [totalCount, setTotalCount] = useState(0);
  const [repliedCount, setRepliedCount] = useState(0);
  const [fiveStarCount, setFiveStarCount] = useState(0);

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

      const res = await adminReviewApi.getAllReviews(params);

      const data = res.data.data || [];
      const pagination = res.data.pagination;

      setReviews(Array.isArray(data) ? data : []);
      setTotalPages(pagination?.totalPages || 1);
      setTotalReviews(
        pagination?.total || (Array.isArray(data) ? data.length : 0)
      );
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
      setTotalPages(1);
      setTotalReviews(0);
    } finally {
      setLoading(false);
    }
  };

  // Effect để reset page và fetch khi filter thay đổi
  useEffect(() => {
    fetchStats();
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, ratingFilter, hasReplyFilter, sortOption]);

  // Effect để fetch khi currentPage thay đổi
  useEffect(() => {
    fetchReviews(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await adminReviewApi.getAllReviews({ page: 1, limit: 50 });
      const data = res.data.data || [];
      const total = res.data.pagination?.total || data.length;

      setTotalCount(total);
      setRepliedCount(data.filter((r: Review) => r.reply).length);
      setFiveStarCount(data.filter((r: Review) => r.rating === 5).length);
    } catch {
      setTotalCount(0);
      setRepliedCount(0);
      setFiveStarCount(0);
    }
  };

  const handleDeleteReply = async (reviewId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phản hồi này?")) return;

    try {
      await adminReviewApi.deleteReply(reviewId);
      toast.success("Đã xóa phản hồi");
      fetchReviews(currentPage);
      fetchStats();
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
    fetchStats();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const toggleSearchVisibility = () => {
    setIsSearchVisible(true);
  };

  const handleBack = () => {
    setIsSearchVisible(false);
    setSearchQuery("");
  };

  // Helper function to get product info from review (supports both orderItem and product)
  const getReviewProductInfo = (review: Review) => {
    // Priority 1: Check direct product field (populated from BE)
    if (review.product && typeof review.product === "object") {
      const product = review.product;
      // Get variant info from orderItem if available
      let variantInfo = {
        variant: null as string | null,
        variantCode: null as string | null,
        size: null as string | null,
      };
      if (typeof review.orderItem === "object" && review.orderItem) {
        const orderItem = review.orderItem as ReviewOrderItem;
        variantInfo = {
          variant: orderItem.variant?.color?.name || null,
          variantCode: orderItem.variant?.color?.code || null,
          size: orderItem.size?.value?.toString() || null,
        };
      }
      return {
        name: product.name || "Sản phẩm không tồn tại",
        image: product.images?.[0]?.url || null,
        ...variantInfo,
      };
    }

    // Priority 2: Check if orderItem is populated (object) with product
    if (typeof review.orderItem === "object" && review.orderItem?.product) {
      const orderItem = review.orderItem as ReviewOrderItem;
      return {
        name: orderItem.product?.name || "Sản phẩm không tồn tại",
        image: orderItem.product?.images?.[0]?.url || null,
        variant: orderItem.variant?.color?.name || null,
        variantCode: orderItem.variant?.color?.code || null,
        size: orderItem.size?.value?.toString() || null,
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

  return (
    <div className="p-6 w-full font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-mono-800 tracking-tight leading-snug">
          Quản lý Đánh giá
        </h2>
        {!isSearchVisible ? (
          <button
            onClick={toggleSearchVisibility}
            className="flex items-center gap-2 border border-mono-300 bg-white hover:bg-mono-100 text-mono-700 px-5 py-2 rounded-3xl shadow transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-mono-400 active:bg-mono-200"
          >
            <IoIosSearch className="text-xl text-mono-500" />
            <span className="font-medium">Tìm kiếm</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2 w-full max-w-md">
            <IoIosSearch
              onClick={handleBack}
              className="text-mono-400 cursor-pointer text-xl"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Tìm theo tên sản phẩm, người dùng..."
              className="w-full px-4 py-2 border border-mono-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-mono-600"
            />
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-mono-50 to-mono-100 rounded-xl p-6 shadow-sm border border-mono-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-mono-600 mb-1">
                Tổng đánh giá
              </h3>
              <p className="text-3xl font-bold text-mono-900">{totalCount}</p>
            </div>
            <FaStar className="text-yellow-500 text-3xl" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-mono-100 to-mono-200 rounded-xl p-6 shadow-sm border border-mono-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-mono-600 mb-1">
                Đã phản hồi
              </h3>
              <p className="text-3xl font-bold text-mono-900">{repliedCount}</p>
            </div>
            <FaReply className="text-mono-500 text-3xl" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 shadow-sm border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-yellow-700 mb-1">
                5 sao
              </h3>
              <p className="text-3xl font-bold text-yellow-800">
                {fiveStarCount}
              </p>
            </div>
            <div className="flex">{renderStars(5)}</div>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex items-center justify-end border-b mb-4">
        <div className="flex items-center gap-3 pb-2">
          {/* Rating Filter */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-mono-400" />
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mono-500"
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
            onChange={(e) => {
              setHasReplyFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mono-500"
          >
            <option value="all">Tất cả phản hồi</option>
            <option value="true">Đã phản hồi</option>
            <option value="false">Chưa phản hồi</option>
          </select>

          {/* Sort */}
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mono-500"
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
      <div className="overflow-x-auto shadow rounded-lg">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-mono-800 mx-auto"></div>
            <p className="mt-4 text-mono-500">Đang tải...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center">
            <FaRegStar className="mx-auto text-4xl text-mono-300 mb-3" />
            <p className="text-mono-500">Không có đánh giá nào</p>
          </div>
        ) : (
          <table className="min-w-full bg-white rounded-md overflow-hidden border">
            <thead className="bg-mono-50 text-mono-700 text-sm font-semibold uppercase">
              <tr>
                <th className="py-3 px-4 text-left border-b">Sản phẩm</th>
                <th className="py-3 px-4 text-left border-b">Người đánh giá</th>
                <th className="py-3 px-4 text-left border-b">Đánh giá</th>
                <th className="py-3 px-4 text-left border-b">Nội dung</th>
                <th className="py-3 px-4 text-left border-b">Likes</th>
                <th className="py-3 px-4 text-left border-b">Ngày tạo</th>
                <th className="py-3 px-4 text-center border-b">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => {
                const productInfo = getReviewProductInfo(review);
                return (
                  <tr key={review._id} className="hover:bg-mono-50 border-t">
                    <td className="py-2 px-4 border-b">
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
                          <span className="text-mono-800 font-medium truncate max-w-[150px] text-sm">
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
                    <td className="py-2 px-4 border-b text-sm">
                      <span className="text-mono-700">
                        {review.user?.name || "Ẩn danh"}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      {renderStars(review.rating)}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <p
                        className="text-mono-600 truncate max-w-[200px] text-sm"
                        title={review.content}
                      >
                        {review.content}
                      </p>
                      {review.reply && (
                        <span className="text-xs text-mono-600 flex items-center gap-1 mt-1">
                          <FaReply size={10} /> Đã phản hồi
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b text-sm">
                      <span className="text-mono-700">
                        {review.numberOfLikes || 0}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b text-mono-500 text-sm">
                      {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-2 px-4 border-b text-center text-sm">
                      <div className="flex flex-wrap gap-1.5 justify-center min-w-[140px]">
                        {/* Xem chi tiết */}
                        <button
                          onClick={() => handleViewDetail(review)}
                          className="px-3 py-1.5 bg-mono-50 hover:bg-mono-100 text-mono-800 text-xs font-medium rounded-lg border border-mono-200 transition-colors flex items-center gap-1.5"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          Xem
                        </button>

                        {/* Phản hồi / Sửa phản hồi / Xóa phản hồi */}
                        {!review.reply ? (
                          <button
                            onClick={() => handleOpenReply(review)}
                            className="px-3 py-1.5 bg-mono-50 hover:bg-mono-100 text-mono-700 text-xs font-medium rounded-lg border border-mono-200 transition-colors flex items-center gap-1.5"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                              />
                            </svg>
                            Trả lời
                          </button>
                        ) : (
                          <>
                            {/* Sửa phản hồi */}
                            <button
                              onClick={() => handleOpenReply(review)}
                              className="px-3 py-1.5 bg-mono-50 hover:bg-mono-100 text-mono-700 text-xs font-medium rounded-lg border border-mono-200 transition-colors flex items-center gap-1.5"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Sửa
                            </button>
                            {/* Xóa phản hồi */}
                            <button
                              onClick={() => handleDeleteReply(review._id)}
                              className="px-3 py-1.5 bg-mono-200 hover:bg-mono-300 text-mono-900 text-xs font-medium rounded-lg border border-mono-300 transition-colors flex items-center gap-1.5"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Xóa
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination - Outside table like ColorPage */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-mono-600">
          Trang {currentPage} / {totalPages} • Tổng: {totalReviews} đánh giá
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              currentPage === 1
                ? "bg-mono-300 text-mono-500 cursor-not-allowed"
                : "bg-mono-200 text-mono-700 hover:bg-mono-300"
            }`}
          >
            Trước
          </button>

          {/* Page Numbers */}
          {(() => {
            const pages = [];
            const showPages = 5;
            let startPage = Math.max(
              1,
              currentPage - Math.floor(showPages / 2)
            );
            const endPage = Math.min(totalPages, startPage + showPages - 1);

            if (endPage - startPage < showPages - 1) {
              startPage = Math.max(1, endPage - showPages + 1);
            }

            if (startPage > 1) {
              pages.push(
                <button
                  key={1}
                  onClick={() => setCurrentPage(1)}
                  className="px-3 py-2 rounded-lg font-medium bg-mono-200 text-mono-700 hover:bg-mono-300 transition-all"
                >
                  1
                </button>
              );
              if (startPage > 2) {
                pages.push(
                  <span key="ellipsis1" className="px-2 text-mono-500">
                    ...
                  </span>
                );
              }
            }

            for (let i = startPage; i <= endPage; i++) {
              pages.push(
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`px-3 py-2 rounded-lg font-medium transition-all ${
                    i === currentPage
                      ? "bg-mono-black text-white"
                      : "bg-mono-200 text-mono-700 hover:bg-mono-300"
                  }`}
                >
                  {i}
                </button>
              );
            }

            if (endPage < totalPages) {
              if (endPage < totalPages - 1) {
                pages.push(
                  <span key="ellipsis2" className="px-2 text-mono-500">
                    ...
                  </span>
                );
              }
              pages.push(
                <button
                  key={totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-3 py-2 rounded-lg font-medium bg-mono-200 text-mono-700 hover:bg-mono-300 transition-all"
                >
                  {totalPages}
                </button>
              );
            }

            return pages;
          })()}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              currentPage === totalPages
                ? "bg-mono-300 text-mono-500 cursor-not-allowed"
                : "bg-mono-200 text-mono-700 hover:bg-mono-300"
            }`}
          >
            Tiếp
          </button>
        </div>
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
