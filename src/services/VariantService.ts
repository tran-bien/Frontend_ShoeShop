import { axiosInstanceAuth } from "../utils/axiosIntance";
import type { Variant, VariantQueryParams } from "../types/variant";
import { ApiResponse } from "../types/api";

// Admin Variant Service
export const adminVariantService = {
  // Lấy danh sách tất cả variant
  getAllVariants: (
    params?: VariantQueryParams
  ): Promise<{ data: ApiResponse<Variant[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/variants", { params }),

  // Lấy danh sách variant đã xóa
  getDeletedVariants: (
    params?: VariantQueryParams
  ): Promise<{ data: ApiResponse<Variant[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/variants/deleted", { params }),

  // Lấy variant theo ID
  getVariantById: (
    variantId: string
  ): Promise<{ data: ApiResponse<Variant> }> =>
    axiosInstanceAuth.get(`/api/v1/admin/variants/${variantId}`),

  // Thêm variant mới
  createVariant: (data: {
    product: string;
    color: string;
    images: Array<{ url: string; public_id: string }>;
    sizes: Array<{ size: string; price: number; quantity: number }>;
    isActive?: boolean;
  }): Promise<{ data: ApiResponse<Variant> }> =>
    axiosInstanceAuth.post("/api/v1/admin/variants", data),

  // Cập nhật variant
  updateVariant: (
    variantId: string,
    data: {
      color?: string;
      images?: Array<{ url: string; public_id: string }>;
      sizes?: Array<{ size: string; price: number; quantity: number }>;
      isActive?: boolean;
    }
  ): Promise<{ data: ApiResponse<Variant> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/variants/${variantId}`, data),

  // Xóa mềm variant
  deleteVariant: (variantId: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/variants/${variantId}`),

  // Khôi phục variant đã xóa
  restoreVariant: (
    variantId: string
  ): Promise<{ data: ApiResponse<Variant> }> =>
    axiosInstanceAuth.post(`/api/v1/admin/variants/${variantId}/restore`),

  // Chỉnh sửa trạng thái isActive
  updateStatus: (
    variantId: string,
    isActive: boolean
  ): Promise<{ data: ApiResponse<Variant> }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/variants/${variantId}/status`, {
      isActive,
    }),
};

export default adminVariantService;
