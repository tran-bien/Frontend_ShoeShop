import { axiosInstanceAuth } from "../utils/axiosIntance";

export const reviewApi = {
  // Lấy danh sách đánh giá của người dùng
  getMyReviews: (params = {}) =>
    axiosInstanceAuth.get("/api/v1/users/reviews/my-reviews", { params }),

  // Lấy đánh giá theo productId
  getReviewsByProduct: (productId: string, params = {}) =>
    axiosInstanceAuth.get(`/api/v1/products/${productId}/reviews`, { params }),

  // Tạo mới đánh giá
  createReview: (data: {
    orderId: string;
    orderItemId: string;
    rating: number;
    content: string;
  }) => {
    // Thêm log để debug
    console.log("Sending review data:", JSON.stringify(data, null, 2));
    return axiosInstanceAuth
      .post("/api/v1/users/reviews", data)
      .then((response) => {
        console.log("Review created successfully:", response.data);
        return response;
      })
      .catch((error) => {
        console.error(
          "Failed to create review:",
          error.response?.data || error.message
        );
        throw error;
      });
  },

  // Cập nhật đánh giá
  updateReview: (reviewId: string, data: { rating: number; content: string }) =>
    axiosInstanceAuth.put(`/api/v1/users/reviews/${reviewId}`, data),

  // Xóa đánh giá
  deleteReview: (reviewId: string) =>
    axiosInstanceAuth.delete(`/api/v1/users/reviews/${reviewId}`),

  // Thích đánh giá
  likeReview: (reviewId: string) =>
    axiosInstanceAuth.post(`/api/v1/users/reviews/${reviewId}/like`),

  // Lấy danh sách sản phẩm có thể đánh giá
  getReviewableProducts: () =>
    axiosInstanceAuth.get("/api/v1/users/reviews/reviewable-products"),
};

export default reviewApi;
