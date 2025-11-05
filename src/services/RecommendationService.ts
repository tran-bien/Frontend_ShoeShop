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
  getRecommendations: (
    params: RecommendationQueryParams = {}
  ): Promise<{ data: RecommendationsResponse }> =>
    axiosInstance.get("/api/v1/recommendations", { params }),

  // Lấy sản phẩm tương tự
  getSimilarProducts: (
    productId: string,
    limit: number = 8
  ): Promise<{ data: RecommendationsResponse }> =>
    axiosInstance.get(`/api/v1/recommendations/similar/${productId}`, {
      params: { limit },
    }),

  // Track product view (không cần đăng nhập - sử dụng session)
  trackProductView: (
    productId: string
  ): Promise<{ data: { success: boolean; message: string } }> =>
    axiosInstance.post("/api/v1/view-history/track", { productId }),
};

// =======================
// USER RECOMMENDATION SERVICE
// =======================

export const userRecommendationService = {
  // Lấy gợi ý cá nhân hóa (cần đăng nhập)
  getPersonalizedRecommendations: (
    params: RecommendationQueryParams = {}
  ): Promise<{ data: RecommendationsResponse }> =>
    axiosInstanceAuth.get("/api/v1/recommendations/personalized", { params }),

  // Lấy lịch sử xem sản phẩm
  getViewHistory: (
    params: ViewHistoryQueryParams = {}
  ): Promise<{ data: ViewHistoryResponse }> =>
    axiosInstanceAuth.get("/api/v1/view-history", { params }),

  // Xóa lịch sử xem
  clearViewHistory: (): Promise<{
    data: { success: boolean; message: string };
  }> => axiosInstanceAuth.delete("/api/v1/view-history"),

  // Xóa một sản phẩm khỏi lịch sử
  removeFromViewHistory: (
    productId: string
  ): Promise<{ data: { success: boolean; message: string } }> =>
    axiosInstanceAuth.delete(`/api/v1/view-history/${productId}`),

  // Lấy thông tin hành vi người dùng
  getUserBehavior: (): Promise<{ data: UserBehaviorResponse }> =>
    axiosInstanceAuth.get("/api/v1/user-behavior"),
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
