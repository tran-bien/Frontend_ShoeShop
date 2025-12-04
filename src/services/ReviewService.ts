import { axiosInstanceAuth, axiosInstance } from "../utils/axiosIntance";
import type {
  Review,
  CreateReviewData,
  UpdateReviewData,
  ReviewQueryParams,
  ReviewableProduct,
} from "../types/review";
import { ApiResponse } from "../types/api";

// Re-export types for convenience
export type { Review, ReviewableProduct, UpdateReviewData, ReviewQueryParams };

// Review Service - các chức năng quản lý đánh giá sản phẩm
export const reviewApi = {
  // Lấy danh sách đánh giá của người dùng hiện tại
  getMyReviews: (
    params: ReviewQueryParams = {}
  ): Promise<{ data: ApiResponse<Review[]> }> =>
    axiosInstanceAuth.get("/api/v1/users/reviews/my-reviews", { params }),

  // Lấy đánh giá theo productId (public)
  getReviewsByProduct: (
    productId: string,
    params: ReviewQueryParams = {}
  ): Promise<{ data: ApiResponse<Review[]> }> =>
    axiosInstance.get(`/api/v1/reviews/products/${productId}`, { params }),

  // Lấy chi tiết đánh giá theo ID
  getReviewDetail: (reviewId: string): Promise<{ data: ApiResponse<Review> }> =>
    axiosInstance.get(`/api/v1/reviews/${reviewId}`),

  // Tạo mới đánh giá
  createReview: (
    data: CreateReviewData
  ): Promise<{ data: ApiResponse<Review> }> => {
    // Enhanced debugging từ version cũ
    console.log("Sending review data:", JSON.stringify(data, null, 2));
    return axiosInstanceAuth
      .post("/api/v1/users/reviews", data)
      .then((response) => {
        console.log("Review created successfully:", response.data);
        return response;
      })
      .catch((error) => {
        // Enhanced error handling từ cả hai versions
        console.error(
          "Failed to create review:",
          error.response?.data || error.message
        );
        if (error.response) {
          if (error.response.status === 400) {
            throw new Error(
              error.response.data.message ||
                "Không thể đánh giá sản phẩm này. Vui lòng thử lại sau."
            );
          }
        }
        throw error;
      });
  },

  // Cập nhật đánh giá theo reviewId
  updateReview: (
    reviewId: string,
    data: UpdateReviewData
  ): Promise<{ data: ApiResponse<Review> }> =>
    axiosInstanceAuth.put(`/api/v1/users/reviews/${reviewId}`, data),

  // Xóa đánh giá
  deleteReview: (reviewId: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/users/reviews/${reviewId}`),

  // Thích đánh giá
  likeReview: (
    reviewId: string
  ): Promise<{ data: ApiResponse<{ numberOfLikes: number }> }> =>
    axiosInstanceAuth.post(`/api/v1/users/reviews/${reviewId}/like`),

  // Lấy danh sách sản phẩm có thể đánh giá (từ đơn hàng đã giao thành công)
  getReviewableProducts: (): Promise<{
    data: ApiResponse<ReviewableProduct[]>;
  }> => axiosInstanceAuth.get("/api/v1/users/reviews/reviewable-products"),
};

// Admin Review Service - Quản lý đánh giá cho admin/staff
export const adminReviewApi = {
  // Trả lời đánh giá
  replyToReview: (
    reviewId: string,
    replyContent: string
  ): Promise<{ data: ApiResponse<Review> }> =>
    axiosInstanceAuth.post(`/api/v1/admin/reviews/${reviewId}/reply`, {
      replyContent,
    }),

  // Cập nhật trả lời
  updateReply: (
    reviewId: string,
    replyContent: string
  ): Promise<{ data: ApiResponse<Review> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/reviews/${reviewId}/reply`, {
      replyContent,
    }),

  // Xóa trả lời
  deleteReply: (reviewId: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/reviews/${reviewId}/reply`),
};

export default reviewApi;
