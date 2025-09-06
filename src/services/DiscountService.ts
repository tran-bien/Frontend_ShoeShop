import { axiosInstanceAuth } from "../utils/axiosIntance";

export const discountApi = {
  // Lấy danh sách coupon (admin)
  getAllAdminCoupons: (params?: {
    page?: number;
    limit?: number;
    code?: string;
    type?: string;
    status?: string;
    isPublic?: boolean | string;
  }) =>
    axiosInstanceAuth.get("http://localhost:5005/api/v1/admin/coupons", {
      params,
    }),

  // Lấy chi tiết coupon (admin)
  getAdminCouponById: (couponId: string) =>
    axiosInstanceAuth.get(
      `http://localhost:5005/api/v1/admin/coupons/${couponId}`
    ),

  // Tạo coupon mới (admin)
  createAdminCoupon: (data: any) =>
    axiosInstanceAuth.post("http://localhost:5005/api/v1/admin/coupons", data),

  // Cập nhật coupon (admin)
  updateAdminCoupon: (couponId: string, data: any) =>
    axiosInstanceAuth.put(
      `http://localhost:5005/api/v1/admin/coupons/${couponId}`,
      data
    ),

  // Xóa coupon (admin)
  deleteAdminCoupon: (couponId: string) =>
    axiosInstanceAuth.delete(
      `http://localhost:5005/api/v1/admin/coupons/${couponId}`
    ),

  // Cập nhật trạng thái coupon (admin)
  updateAdminCouponStatus: (couponId: string, status: string) =>
    axiosInstanceAuth.patch(
      `http://localhost:5005/api/v1/admin/coupons/${couponId}/status`,
      { status }
    ),
};
