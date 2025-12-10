import { axiosInstanceAuth } from "../utils/axiosIntance";
import type {
  ViewHistoryQueryParams,
  ViewHistoryResponse,
  TrackViewResponse,
} from "../types/viewHistory";

// Helper để tạo/lấy session ID cho guest users
const getGuestSessionId = (): string => {
  const STORAGE_KEY = "guest_session_id";
  let sessionId = localStorage.getItem(STORAGE_KEY);
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 15)}`;
    localStorage.setItem(STORAGE_KEY, sessionId);
  }
  return sessionId;
};

// =======================
// PUBLIC VIEW HISTORY SERVICE
// =======================

export const publicViewHistoryService = {
  // Track view (works for both guest and logged-in users)
  // Uses axiosInstanceAuth to send token if user is logged in
  trackView: (productId: string): Promise<{ data: TrackViewResponse }> =>
    axiosInstanceAuth.post("/api/v1/users/view-history", {
      productId,
      sessionId: getGuestSessionId(),
    }),
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

export default publicViewHistoryService;
