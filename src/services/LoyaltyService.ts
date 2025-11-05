import { axiosInstanceAuth } from "../utils/axiosIntance";
import type {
  LoyaltyTransactionQueryParams,
  LoyaltyTierQueryParams,
  CreateLoyaltyTierData,
  UpdateLoyaltyTierData,
  AdjustPointsData,
  LoyaltyInfoResponse,
  LoyaltyTransactionsResponse,
  LoyaltyTiersResponse,
  LoyaltyTierDetailResponse,
  AdjustPointsResponse,
} from "../types/loyalty";

// =======================
// USER LOYALTY SERVICE
// =======================

export const userLoyaltyService = {
  // Lấy thông tin điểm và hạng thành viên hiện tại
  getLoyaltyInfo: (): Promise<{ data: LoyaltyInfoResponse }> =>
    axiosInstanceAuth.get("/api/v1/loyalty"),

  // Lấy lịch sử giao dịch điểm
  getTransactions: (
    params: LoyaltyTransactionQueryParams = {}
  ): Promise<{ data: LoyaltyTransactionsResponse }> =>
    axiosInstanceAuth.get("/api/v1/loyalty/transactions", { params }),

  // Lấy danh sách các hạng thành viên
  getTiers: (
    params: LoyaltyTierQueryParams = {}
  ): Promise<{ data: LoyaltyTiersResponse }> =>
    axiosInstanceAuth.get("/api/v1/loyalty/tiers", { params }),
};

// =======================
// ADMIN LOYALTY SERVICE
// =======================

export const adminLoyaltyService = {
  // Lấy danh sách tất cả hạng thành viên
  getAllTiers: (
    params: LoyaltyTierQueryParams = {}
  ): Promise<{ data: LoyaltyTiersResponse }> =>
    axiosInstanceAuth.get("/api/v1/admin/loyalty/tiers", { params }),

  // Lấy chi tiết hạng thành viên
  getTierById: (tierId: string): Promise<{ data: LoyaltyTierDetailResponse }> =>
    axiosInstanceAuth.get(`/api/v1/admin/loyalty/tiers/${tierId}`),

  // Tạo hạng thành viên mới
  createTier: (
    data: CreateLoyaltyTierData
  ): Promise<{ data: LoyaltyTierDetailResponse }> =>
    axiosInstanceAuth.post("/api/v1/admin/loyalty/tiers", data),

  // Cập nhật hạng thành viên
  updateTier: (
    tierId: string,
    data: UpdateLoyaltyTierData
  ): Promise<{ data: LoyaltyTierDetailResponse }> =>
    axiosInstanceAuth.put(`/api/v1/admin/loyalty/tiers/${tierId}`, data),

  // Xóa hạng thành viên
  deleteTier: (
    tierId: string
  ): Promise<{ data: { success: boolean; message: string } }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/loyalty/tiers/${tierId}`),

  // Điều chỉnh điểm cho user
  adjustUserPoints: (
    data: AdjustPointsData
  ): Promise<{ data: AdjustPointsResponse }> =>
    axiosInstanceAuth.post("/api/v1/admin/loyalty/adjust-points", data),

  // Lấy lịch sử giao dịch của một user
  getUserTransactions: (
    userId: string,
    params: LoyaltyTransactionQueryParams = {}
  ): Promise<{ data: LoyaltyTransactionsResponse }> =>
    axiosInstanceAuth.get(
      `/api/v1/admin/loyalty/users/${userId}/transactions`,
      {
        params,
      }
    ),
};

// =======================
// Backward compatibility
// =======================

export const loyaltyApi = {
  // User APIs
  getLoyaltyInfo: userLoyaltyService.getLoyaltyInfo,
  getTransactions: userLoyaltyService.getTransactions,
  getTiers: userLoyaltyService.getTiers,

  // Admin APIs
  adminGetAllTiers: adminLoyaltyService.getAllTiers,
  adminGetTierById: adminLoyaltyService.getTierById,
  adminCreateTier: adminLoyaltyService.createTier,
  adminUpdateTier: adminLoyaltyService.updateTier,
  adminDeleteTier: adminLoyaltyService.deleteTier,
  adminAdjustPoints: adminLoyaltyService.adjustUserPoints,
  adminGetUserTransactions: adminLoyaltyService.getUserTransactions,
};

export default userLoyaltyService;
