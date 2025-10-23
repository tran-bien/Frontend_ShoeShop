import { axiosInstanceAuth } from "../utils/axiosIntance";

export const variantApi = {
  // Lấy danh sách tất cả variant
  getAllVariants: (params?: Record<string, string | number | boolean>) =>
    axiosInstanceAuth.get("/api/v1/admin/variants", { params }),

  // Lấy danh sách variant đã xóa
  getDeletedVariants: (params?: Record<string, string | number | boolean>) =>
    axiosInstanceAuth.get("/api/v1/admin/variants/deleted", { params }),

  // Thêm variant mới
  createVariant: (data: any) =>
    axiosInstanceAuth.post("/api/v1/admin/variants", data),

  // Cập nhật variant
  updateVariant: (variantId: string, data: any) =>
    axiosInstanceAuth.put(`/api/v1/admin/variants/${variantId}`, data),

  // Xóa mềm variant
  deleteVariant: (variantId: string) =>
    axiosInstanceAuth.delete(`/api/v1/admin/variants/${variantId}`),

  // Khôi phục variant đã xóa
  restoreVariant: (variantId: string) =>
    axiosInstanceAuth.post(`/api/v1/admin/variants/${variantId}/restore`),
  // Chỉnh sửa trạng thái isActive
  updateStatus: (variantId: string, isActive: boolean) =>
    axiosInstanceAuth.patch(`/api/v1/admin/variants/${variantId}/status`, {
      isActive,
    }),
  // Lấy variant theo ID
  getVariantById: (variantId: string) =>
    axiosInstanceAuth.get(`/api/v1/admin/variants/${variantId}`),
};
