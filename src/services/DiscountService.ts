import { axiosInstanceAuth } from "../utils/axiosIntance";
import type { Coupon, CouponQuery } from "../types/coupon";
import type { ApiResponse } from "../types/api";

// Re-export types for convenience
export type { Coupon, CouponQuery };

// =======================
// RESPONSE TYPES
// =======================

export interface AdminCouponsResponse {
  success: boolean;
  message: string;
  data: {
    coupons: Coupon[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface AdminCouponDetailResponse {
  success: boolean;
  message: string;
  data: Coupon;
}

export interface CreateCouponData {
  code: string;
  description: string;
  type: "percent" | "fixed";
  value: number;
  maxDiscount?: number;
  minOrderValue: number;
  startDate: string;
  endDate: string;
  maxUses?: number;
  status?: "active" | "inactive";
  isPublic: boolean;
}

export type UpdateCouponData = Partial<CreateCouponData>;

export interface UpdateCouponStatusData {
  status: "active" | "inactive" | "expired" | "archived";
}

// =======================
// ADMIN DISCOUNT SERVICE
// =======================

export const adminDiscountService = {
  // Lấy danh sách coupon (admin)
  getAllCoupons: (
    params?: CouponQuery
  ): Promise<{ data: AdminCouponsResponse }> =>
    axiosInstanceAuth.get("/api/v1/admin/coupons", { params }),

  // Lấy chi tiết coupon (admin)
  getCouponById: (
    couponId: string
  ): Promise<{ data: AdminCouponDetailResponse }> =>
    axiosInstanceAuth.get(`/api/v1/admin/coupons/${couponId}`),

  // Tạo coupon mới (admin)
  createCoupon: (
    data: CreateCouponData
  ): Promise<{ data: ApiResponse<Coupon> }> =>
    axiosInstanceAuth.post("/api/v1/admin/coupons", data),

  // Cập nhật coupon (admin)
  updateCoupon: (
    couponId: string,
    data: UpdateCouponData
  ): Promise<{ data: ApiResponse<Coupon> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/coupons/${couponId}`, data),

  // Xóa coupon (admin)
  deleteCoupon: (couponId: string): Promise<{ data: ApiResponse<null> }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/coupons/${couponId}`),

  // Cập nhật trạng thái coupon (admin)
  updateCouponStatus: (
    couponId: string,
    data: UpdateCouponStatusData
  ): Promise<{ data: ApiResponse<Coupon> }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/coupons/${couponId}/status`, data),
};

// Giữ lại cho tương thích ngược
export const discountApi = {
  getAllAdminCoupons: adminDiscountService.getAllCoupons,
  getAdminCouponById: adminDiscountService.getCouponById,
  createAdminCoupon: adminDiscountService.createCoupon,
  updateAdminCoupon: adminDiscountService.updateCoupon,
  deleteAdminCoupon: adminDiscountService.deleteCoupon,
  updateAdminCouponStatus: adminDiscountService.updateCouponStatus,
};

export default adminDiscountService;
