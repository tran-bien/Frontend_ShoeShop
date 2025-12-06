import { axiosInstanceAuth } from "../utils/axiosIntance";
import type {
  LoyaltyTransactionQueryParams,
  LoyaltyTierQueryParams,
  CreateLoyaltyTierData,
  UpdateLoyaltyTierData,
  // AdjustPointsData, // Removed: BE chưa implement
  LoyaltyInfoResponse,
  LoyaltyTransactionsResponse,
  LoyaltyTiersResponse,
  LoyaltyTierDetailResponse,
  // AdjustPointsResponse, // Removed: BE chưa implement
} from "../types/loyalty";

// =======================
// USER LOYALTY SERVICE
// =======================

export const userLoyaltyService = {
  // Lấy thông tin điểm và hạng thành viên hiện tại
  getLoyaltyInfo: (): Promise<{ data: LoyaltyInfoResponse }> =>
    axiosInstanceAuth.get("/api/v1/users/loyalty/stats"),

  // Lấy lịch sử giao dịch điểm
  getTransactions: (
    params: LoyaltyTransactionQueryParams = {}
  ): Promise<{ data: LoyaltyTransactionsResponse }> =>
    axiosInstanceAuth.get("/api/v1/users/loyalty/transactions", { params }),
};

// =======================
// ADMIN LOYALTY SERVICE
// =======================

export const adminLoyaltyService = {
  // Lấy danh sách tất cả hạng thành viên
  getAllTiers: (
    params: LoyaltyTierQueryParams = {}
  ): Promise<{ data: LoyaltyTiersResponse }> =>
    axiosInstanceAuth.get("/api/v1/admin/loyalty-tiers", { params }),

  // Lấy chi tiết hạng thành viên
  getTierById: (tierId: string): Promise<{ data: LoyaltyTierDetailResponse }> =>
    axiosInstanceAuth.get(`/api/v1/admin/loyalty-tiers/${tierId}`),

  // Tạo hạng thành viên mới
  createTier: (
    data: CreateLoyaltyTierData
  ): Promise<{ data: LoyaltyTierDetailResponse }> =>
    axiosInstanceAuth.post("/api/v1/admin/loyalty-tiers", data),

  // Cập nhật hạng thành viên
  updateTier: (
    tierId: string,
    data: UpdateLoyaltyTierData
  ): Promise<{ data: LoyaltyTierDetailResponse }> =>
    axiosInstanceAuth.put(`/api/v1/admin/loyalty-tiers/${tierId}`, data),

  // Xóa hạng thành viên
  deleteTier: (
    tierId: string
  ): Promise<{ data: { success: boolean; message: string } }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/loyalty-tiers/${tierId}`),

  // NOTE: Các API sau đã bị xóa vì BE chưa implement:
  // - adjustUserPoints: điều chỉnh điểm cho user
  // - getUserTransactions: lấy lịch sử giao dịch của một user
  // Nếu cần tính năng này, phải bổ sung routes vào BE trước
};

export default userLoyaltyService;
