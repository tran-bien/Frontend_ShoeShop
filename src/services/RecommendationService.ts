import { axiosInstanceAuth } from "../utils/axiosIntance";
import type {
  ViewHistoryQueryParams,
  RecommendationQueryParams,
  ViewHistoryResponse,
  RecommendationsResponse,
} from "../types/recommendation";

// =======================
// RECOMMENDATION SERVICE - Chỉ có một thuật toán PERSONALIZED
// =======================

export const userRecommendationService = {
  // Lấy gợi ý cá nhân hóa (cần đăng nhập)
  getPersonalizedRecommendations: (
    params: RecommendationQueryParams = {}
  ): Promise<{ data: RecommendationsResponse }> =>
    axiosInstanceAuth.get("/api/v1/users/recommendations", { params }),

  // Lấy lịch sử xem sản phẩm
  getViewHistory: (
    params: ViewHistoryQueryParams = {}
  ): Promise<{ data: ViewHistoryResponse }> =>
    axiosInstanceAuth.get("/api/v1/users/view-history", { params }),

  // Xóa toàn bộ lịch sử xem
  clearViewHistory: (): Promise<{
    data: { success: boolean; message: string };
  }> => axiosInstanceAuth.delete("/api/v1/users/view-history"),

  // Track product view
  trackProductView: (
    productId: string
  ): Promise<{ data: { success: boolean; message: string } }> =>
    axiosInstanceAuth.post("/api/v1/users/view-history", { productId }),
};

// Alias cho backward compatibility
export const publicRecommendationService = {
  getRecommendations: userRecommendationService.getPersonalizedRecommendations,
  trackProductView: userRecommendationService.trackProductView,
};

export default userRecommendationService;
