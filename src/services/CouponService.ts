import { axiosInstance, axiosInstanceAuth } from "../utils/axiosIntance";
import type {
  Coupon,
  CouponQuery,
  PublicCouponsResponse,
  AdminCouponsResponse,
  AdminCouponDetailResponse,
  CreateCouponData,
  UpdateCouponData,
  UpdateCouponStatusData,
} from "../types/coupon";
import { ApiResponse } from "../types/api";

// Re-export types for convenience
export type {
  Coupon,
  CouponQuery,
  PublicCouponsResponse,
  AdminCouponsResponse,
  AdminCouponDetailResponse,
  CreateCouponData,
  UpdateCouponData,
  UpdateCouponStatusData,
};

// =======================
// PUBLIC COUPON SERVICE
// =======================

export const publicCouponService = {
  // Lấy danh sách coupon công khai đang hoạt động
  getPublicCoupons: (
    params: CouponQuery = {}
  ): Promise<{ data: PublicCouponsResponse }> =>
    axiosInstance.get("/api/v1/coupons/public", { params }),
};

// =======================
// USER COUPON SERVICE (authenticated)
// =======================

export const userCouponService = {
  // Lấy danh sách coupon công khai (user đã login)
  getAvailableCoupons: (
    params: CouponQuery = {}
  ): Promise<{ data: ApiResponse<Coupon[]> }> =>
    axiosInstanceAuth.get("/api/v1/users/coupons", { params }),

  // Lấy danh sách coupon đã thu thập của người dùng
  getCollectedCoupons: (
    params: CouponQuery = {}
  ): Promise<{ data: ApiResponse<Coupon[]> }> =>
    axiosInstanceAuth.get("/api/v1/users/coupons/collected", { params }),

  // Thu thập coupon
  collectCoupon: (couponId: string): Promise<{ data: ApiResponse<Coupon> }> =>
    axiosInstanceAuth.post(`/api/v1/users/coupons/${couponId}/collect`),

  // Xác thực mã giảm giá cho giỏ hàng
  verifyCoupon: (
    code: string,
    subTotal: number
  ): Promise<{
    data: ApiResponse<{
      isValid: boolean;
      coupon?: Coupon;
      discount?: number;
      message?: string;
    }>;
  }> => axiosInstanceAuth.post("/api/v1/coupons/verify", { code, subTotal }),
};

// =======================
// ADMIN COUPON SERVICE (authenticated)
// =======================

export const adminCouponService = {
  // Lấy danh sách tất cả coupon (có phân trang và filter)
  getAllCoupons: (
    params: CouponQuery = {}
  ): Promise<{ data: AdminCouponsResponse }> =>
    axiosInstanceAuth.get("/api/v1/admin/coupons", { params }),

  // Lấy chi tiết coupon theo ID
  getCouponById: (id: string): Promise<{ data: AdminCouponDetailResponse }> =>
    axiosInstanceAuth.get(`/api/v1/admin/coupons/${id}`),

  // Tạo coupon mới
  createCoupon: (
    data: CreateCouponData
  ): Promise<{ data: ApiResponse<Coupon> }> =>
    axiosInstanceAuth.post("/api/v1/admin/coupons", data),

  // Cập nhật coupon
  updateCoupon: (
    id: string,
    data: UpdateCouponData
  ): Promise<{ data: ApiResponse<Coupon> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/coupons/${id}`, data),

  // Xóa coupon
  deleteCoupon: (id: string): Promise<{ data: ApiResponse<null> }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/coupons/${id}`),

  // Cập nhật trạng thái coupon
  updateCouponStatus: (
    id: string,
    data: UpdateCouponStatusData
  ): Promise<{ data: ApiResponse<Coupon> }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/coupons/${id}/status`, data),
};

export default {
  public: publicCouponService,
  user: userCouponService,
  admin: adminCouponService,
};
