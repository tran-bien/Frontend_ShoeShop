import { axiosInstanceAuth, axiosInstance } from "../utils/axiosIntance";

export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: {
      url: string;
      public_id: string;
    };
  };
  product: {
    _id: string;
    name: string;
    slug: string;
    images?: Array<{
      url: string;
      public_id: string;
    }>;
  };
  orderItem: string;
  rating: number;
  content: string;
  numberOfLikes: number;
  isActive: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  orderId: string;
  orderItemId: string;
  rating: number;
  content: string;
}

export interface UpdateReviewData {
  rating?: number;
  content?: string;
}

export interface ReviewQuery {
  page?: number;
  limit?: number;
  rating?: number;
  sort?: string;
}

// Interface cho sản phẩm có thể đánh giá
export interface ReviewableProduct {
  orderItemId: string;
  orderId: string;
  orderCode: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    images?: Array<{
      url: string;
      public_id: string;
      isMain?: boolean;
    }>;
  };
  variant: {
    _id: string;
    color: {
      _id: string;
      name: string;
      code: string;
    };
    price: number;
  };
  size: {
    _id: string;
    value: number;
    description?: string;
  };
  price: number;
  quantity: number;
  image?: string;
  deliveredAt: string;
  reviewExpiresAt?: string;
  daysLeftToReview: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  product?: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    rating: number;
    numReviews: number;
    image: string | null;
  };
  reviewStats?: {
    totalReviews: number;
    avgRating: number;
    ratingDistribution: {
      [key: number]: { count: number; percentage: number };
    };
  };
}

export const reviewApi = {
  // Lấy danh sách đánh giá của người dùng hiện tại
  getMyReviews: (
    params: ReviewQuery = {}
  ): Promise<{ data: ApiResponse<Review[]> }> =>
    axiosInstanceAuth.get("/api/v1/users/reviews/my-reviews", { params }),

  // Lấy đánh giá theo productId (public)
  getReviewsByProduct: (
    productId: string,
    params: ReviewQuery = {}
  ): Promise<{ data: ApiResponse<Review[]> }> =>
    axiosInstance.get(`/api/v1/products/${productId}/reviews`, { params }),

  // Lấy chi tiết đánh giá theo ID
  getReviewDetail: (reviewId: string): Promise<{ data: ApiResponse<Review> }> =>
    axiosInstance.get(`/api/v1/reviews/${reviewId}`),

  // Tạo mới đánh giá
  createReview: (
    data: CreateReviewData
  ): Promise<{ data: ApiResponse<Review> }> =>
    axiosInstanceAuth.post("/api/v1/users/reviews", data).catch((error) => {
      // Enhanced error handling
      if (error.response) {
        console.error("Review submission error:", error.response.data);
        if (error.response.status === 400) {
          throw new Error(
            error.response.data.message ||
              "Không thể đánh giá sản phẩm này. Vui lòng thử lại sau."
          );
        }
      }
      throw error;
    }),

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

export default reviewApi;
