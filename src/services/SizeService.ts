import { axiosInstanceAuth } from "../utils/axiosIntance";
import type { Size, SizeQueryParams } from "../types/size";
import { ApiResponse } from "../types/api";

// Admin Size Service
export const adminSizeService = {
  // Lấy tất cả kích cỡ
  getAll: (params?: SizeQueryParams): Promise<{ data: ApiResponse<Size[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/sizes", { params }),

  // Lấy kích cỡ đã xóa
  getDeleted: (
    params?: SizeQueryParams
  ): Promise<{ data: ApiResponse<Size[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/sizes/deleted", { params }),

  // Lấy chi tiết kích cỡ theo ID
  getById: (id: string): Promise<{ data: ApiResponse<Size> }> =>
    axiosInstanceAuth.get(`/api/v1/admin/sizes/${id}`),

  // Tạo mới kích cỡ
  create: (data: {
    value: string;
    region: string;
  }): Promise<{ data: ApiResponse<Size> }> =>
    axiosInstanceAuth.post("/api/v1/admin/sizes", data),

  // Cập nhật kích cỡ
  update: (
    id: string,
    data: {
      value?: string;
      region?: string;
    }
  ): Promise<{ data: ApiResponse<Size> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/sizes/${id}`, data),

  // Xóa mềm kích cỡ
  delete: (id: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/sizes/${id}`),

  // Khôi phục kích cỡ đã xóa
  restore: (id: string): Promise<{ data: ApiResponse<Size> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/sizes/${id}/restore`),
};

// Backward compatibility
export const sizeApi = { ...adminSizeService };
