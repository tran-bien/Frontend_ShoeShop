import { axiosInstance, axiosInstanceAuth } from "../utils/axiosIntance";
import type {
  ViewHistoryQueryParams,
  RecommendationQueryParams,
  ViewHistoryResponse,
  RecommendationsResponse,
  UserBehaviorResponse,
} from "../types/recommendation";

// =======================
// PUBLIC RECOMMENDATION SERVICE
// =======================

export const publicRecommendationService = {
  // Lấy sản phẩm gợi ý (không cần đăng nhập)
  // Note: Public recommendations endpoint không tồn tại trong backend
  // Sử dụng user recommendations thay thế
  getRecommendations: (
    params: RecommendationQueryParams = {}
  ): Promise<{ data: RecommendationsResponse }> =>
    axiosInstanceAuth.get("/api/v1/users/recommendations", { params }),

  // Lấy sản phẩm tương tự
  // Note: Similar products endpoint không tồn tại riêng
  // Sử dụng recommendations với algorithm=CONTENT_BASED
  getSimilarProducts: (
    productId: string,
    limit: number = 8
  ): Promise<{ data: RecommendationsResponse }> =>
    axiosInstanceAuth.get(`/api/v1/users/recommendations`, {
      params: { algorithm: "CONTENT_BASED", limit },
    }),

  // Track product view (không cần đăng nhập - sử dụng session)
  trackProductView: (
    productId: string
  ): Promise<{ data: { success: boolean; message: string } }> =>
    axiosInstance.post("/api/v1/users/view-history/track", { productId }),
};

// =======================
// USER RECOMMENDATION SERVICE
// =======================

export const userRecommendationService = {
  // Lấy gợi ý cá nhân hóa (cần đăng nhập)
  // Backend endpoint: GET /api/v1/users/recommendations?algorithm={HYBRID|COLLABORATIVE|CONTENT_BASED|TRENDING}
  getPersonalizedRecommendations: (
    params: RecommendationQueryParams = {}
  ): Promise<{ data: RecommendationsResponse }> =>
    axiosInstanceAuth.get("/api/v1/users/recommendations", {
      params,
    }),

  // Lấy lịch sử xem sản phẩm
  getViewHistory: (
    params: ViewHistoryQueryParams = {}
  ): Promise<{ data: ViewHistoryResponse }> =>
    axiosInstanceAuth.get("/api/v1/users/view-history", { params }),

  // Xóa lịch sử xem
  clearViewHistory: (): Promise<{
    data: { success: boolean; message: string };
  }> => axiosInstanceAuth.delete("/api/v1/users/view-history"),

  // Xóa một sản phẩm khỏi lịch sử
  removeFromViewHistory: (
    productId: string
  ): Promise<{ data: { success: boolean; message: string } }> =>
    axiosInstanceAuth.delete(`/api/v1/users/view-history/${productId}`),

  // Lấy thông tin hành vi người dùng
  getUserBehavior: (): Promise<{ data: UserBehaviorResponse }> =>
    axiosInstanceAuth.get("/api/v1/users/user-behavior"),
};

// =======================
// Backward compatibility
// =======================

export const recommendationApi = {
  // Public APIs
  getRecommendations: publicRecommendationService.getRecommendations,
  getSimilarProducts: publicRecommendationService.getSimilarProducts,
  trackProductView: publicRecommendationService.trackProductView,

  // User APIs
  getPersonalized: userRecommendationService.getPersonalizedRecommendations,
  getViewHistory: userRecommendationService.getViewHistory,
  clearViewHistory: userRecommendationService.clearViewHistory,
  removeFromViewHistory: userRecommendationService.removeFromViewHistory,
  getUserBehavior: userRecommendationService.getUserBehavior,
};

export default publicRecommendationService;
