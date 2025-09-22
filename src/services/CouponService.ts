import { axiosInstanceAuth, axiosInstance } from "../utils/axiosIntance";
import { Coupon, CouponQuery, PublicCouponsResponse } from "../types/coupon";
import { ApiResponse } from "../types/api";

// Public coupon service - không cần đăng nhập
export const publicCouponService = {
  // Lấy danh sách coupon công khai đang hoạt động
  getPublicCoupons: (
    params: CouponQuery = {}
  ): Promise<{ data: PublicCouponsResponse }> =>
    axiosInstance.get("/api/v1/coupons/public", { params }),
};

// User coupon service - cần đăng nhập
export const userCouponService = {
  // Lấy danh sách coupon đã thu thập của người dùng
  getUserCoupons: (
    params: CouponQuery = {}
  ): Promise<{ data: ApiResponse<Coupon[]> }> =>
    axiosInstanceAuth.get("/api/v1/users/coupons", { params }),

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

// Admin coupon service - cần quyền admin
export const adminCouponService = {
  // Lấy danh sách tất cả coupon (có phân trang và filter)
  getAllCoupons: (
    params: CouponQuery = {}
  ): Promise<{ data: ApiResponse<Coupon[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/coupons", { params }),

  // Lấy chi tiết coupon theo ID
  getCouponById: (id: string): Promise<{ data: ApiResponse<Coupon> }> =>
    axiosInstanceAuth.get(`/api/v1/admin/coupons/${id}`),

  // Tạo coupon mới
  createCoupon: (
    data: Omit<Coupon, "_id" | "createdAt" | "updatedAt" | "currentUses">
  ): Promise<{ data: ApiResponse<Coupon> }> =>
    axiosInstanceAuth.post("/api/v1/admin/coupons", data),

  // Cập nhật coupon
  updateCoupon: (
    id: string,
    data: Partial<Coupon>
  ): Promise<{ data: ApiResponse<Coupon> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/coupons/${id}`, data),

  // Xóa coupon
  deleteCoupon: (id: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/coupons/${id}`),

  // Cập nhật trạng thái coupon
  updateCouponStatus: (
    id: string,
    status: "active" | "inactive" | "archived"
  ): Promise<{ data: ApiResponse<Coupon> }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/coupons/${id}/status`, { status }),
};

// Backward compatibility
export const couponApi = {
  // Public API
  getPublicCoupons: publicCouponService.getPublicCoupons,

  // User API
  getUserCoupons: userCouponService.getUserCoupons,
  collectCoupon: userCouponService.collectCoupon,
  verifyCoupon: userCouponService.verifyCoupon,

  // Admin API
  adminGetCoupons: adminCouponService.getAllCoupons,
  adminGetCouponById: adminCouponService.getCouponById,
  adminCreateCoupon: adminCouponService.createCoupon,
  adminUpdateCoupon: adminCouponService.updateCoupon,
  adminDeleteCoupon: adminCouponService.deleteCoupon,
  adminUpdateCouponStatus: adminCouponService.updateCouponStatus,
};

export default userCouponService;
