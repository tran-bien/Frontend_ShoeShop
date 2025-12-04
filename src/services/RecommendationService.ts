import { axiosInstance, axiosInstanceAuth } from "../utils/axiosIntance";
import type {
  ViewHistoryQueryParams,
  RecommendationQueryParams,
  ViewHistoryResponse,
  RecommendationsResponse,
  // UserBehaviorResponse, // Removed: BE không có endpoint này
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
    _productId: string,
    limit: number = 8
  ): Promise<{ data: RecommendationsResponse }> =>
    axiosInstanceAuth.get(`/api/v1/users/recommendations`, {
      params: { algorithm: "CONTENT_BASED", limit },
    }),

  // Track product view (không cần đăng nhập - sử dụng session)
  trackProductView: (
    productId: string
  ): Promise<{ data: { success: boolean; message: string } }> =>
    axiosInstance.post("/api/v1/users/view-history", { productId }),
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

  // Xóa toàn bộ lịch sử xem
  clearViewHistory: (): Promise<{
    data: { success: boolean; message: string };
  }> => axiosInstanceAuth.delete("/api/v1/users/view-history"),

  // NOTE: Các API sau đã bị xóa vì BE không có endpoint:
  // - removeFromViewHistory: xóa một sản phẩm khỏi lịch sử (BE chỉ hỗ trợ xóa toàn bộ)
  // - getUserBehavior: lấy thông tin hành vi người dùng
};

export default publicRecommendationService;
