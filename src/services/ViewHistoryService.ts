import { axiosInstance, axiosInstanceAuth } from "../utils/axiosIntance";
import type {
  ViewHistoryQueryParams,
  ViewHistoryResponse,
  TrackViewResponse,
} from "../types/viewHistory";

// =======================
// PUBLIC VIEW HISTORY SERVICE
// =======================

export const publicViewHistoryService = {
  // Track view (public - works for both guest and logged-in users)
  trackView: (productId: string): Promise<{ data: TrackViewResponse }> =>
    axiosInstance.post("/api/v1/users/view-history/track", { productId }),
};

// =======================
// USER VIEW HISTORY SERVICE
// =======================

export const userViewHistoryService = {
  // Get user's view history (requires auth)
  getViewHistory: (
    params: ViewHistoryQueryParams = {}
  ): Promise<{ data: ViewHistoryResponse }> =>
    axiosInstanceAuth.get("/api/v1/users/view-history", { params }),

  // Clear view history
  clearHistory: (): Promise<{ data: { success: boolean; message: string } }> =>
    axiosInstanceAuth.delete("/api/v1/users/view-history"),
};

// =======================
// Backward compatibility
// =======================

export const viewHistoryApi = {
  track: publicViewHistoryService.trackView,
  getHistory: userViewHistoryService.getViewHistory,
  clearHistory: userViewHistoryService.clearHistory,
};

export default publicViewHistoryService;
