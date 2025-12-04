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
  // Láº¥y sáº£n pháº©m gá»£i Ã½ (khÃ´ng cáº§n Ä‘Äƒng nháº­p)
  // Note: Public recommendations endpoint khÃ´ng tá»“n táº¡i trong backend
  // Sá»­ dá»¥ng user recommendations thay tháº¿
  getRecommendations: (
    params: RecommendationQueryParams = {}
  ): Promise<{ data: RecommendationsResponse }> =>
    axiosInstanceAuth.get("/api/v1/users/recommendations", { params }),

  // Láº¥y sáº£n pháº©m tÆ°Æ¡ng tá»±
  // Note: Similar products endpoint khÃ´ng tá»“n táº¡i riÃªng
  // Sá»­ dá»¥ng recommendations vá»›i algorithm=CONTENT_BASED
  getSimilarProducts: (
    _productId: string,
    limit: number = 8
  ): Promise<{ data: RecommendationsResponse }> =>
    axiosInstanceAuth.get(`/api/v1/users/recommendations`, {
      params: { algorithm: "CONTENT_BASED", limit },
    }),

  // Track product view (khÃ´ng cáº§n Ä‘Äƒng nháº­p - sá»­ dá»¥ng session)
  trackProductView: (
    productId: string
  ): Promise<{ data: { success: boolean; message: string } }> =>
    axiosInstance.post("/api/v1/users/view-history/track", { productId }),
};

// =======================
// USER RECOMMENDATION SERVICE
// =======================

export const userRecommendationService = {
  // Láº¥y gá»£i Ã½ cÃ¡ nhÃ¢n hÃ³a (cáº§n Ä‘Äƒng nháº­p)
  // Backend endpoint: GET /api/v1/users/recommendationsửalgorithm={HYBRID|COLLABORATIVE|CONTENT_BASED|TRENDING}
  getPersonalizedRecommendations: (
    params: RecommendationQueryParams = {}
  ): Promise<{ data: RecommendationsResponse }> =>
    axiosInstanceAuth.get("/api/v1/users/recommendations", {
      params,
    }),

  // Láº¥y lá»‹ch sá»­ xem sáº£n pháº©m
  getViewHistory: (
    params: ViewHistoryQueryParams = {}
  ): Promise<{ data: ViewHistoryResponse }> =>
    axiosInstanceAuth.get("/api/v1/users/view-history", { params }),

  // XÃ³a lá»‹ch sá»­ xem
  clearViewHistory: (): Promise<{
    data: { success: boolean; message: string };
  }> => axiosInstanceAuth.delete("/api/v1/users/view-history"),

  // XÃ³a má»™t sáº£n pháº©m khá»i lá»‹ch sá»­
  removeFromViewHistory: (
    productId: string
  ): Promise<{ data: { success: boolean; message: string } }> =>
    axiosInstanceAuth.delete(`/api/v1/users/view-history/${productId}`),

  // Láº¥y thÃ´ng tin hÃ nh vi ngÆ°á»i dÃ¹ng
  getUserBehavior: (): Promise<{ data: UserBehaviorResponse }> =>
    axiosInstanceAuth.get("/api/v1/users/user-behavior"),
};

export default publicRecommendationService;
