import { axiosInstanceAuth } from "../utils/axiosIntance";
import type { Color, ColorQueryParams } from "../types/color";
import { ApiResponse } from "../types/api";

// Admin Color Service
export const adminColorService = {
  // Lấy tất cả màu sắc
  getAll: (
    params?: ColorQueryParams
  ): Promise<{ data: ApiResponse<Color[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/colors", { params }),

  // Lấy màu sắc đã xóa
  getDeleted: (
    params?: ColorQueryParams
  ): Promise<{ data: ApiResponse<Color[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/colors/deleted", { params }),

  // Lấy chi tiết màu sắc theo ID
  getById: (id: string): Promise<{ data: ApiResponse<Color> }> =>
    axiosInstanceAuth.get(`/api/v1/admin/colors/${id}`),

  // Tạo mới màu sắc
  create: (data: {
    name: string;
    type?: "solid" | "half";
    hexCode?: string;
    code?: string;
    colors?: string[];
  }): Promise<{ data: ApiResponse<Color> }> =>
    axiosInstanceAuth.post("/api/v1/admin/colors", data),

  // Cập nhật màu sắc
  update: (
    id: string,
    data: {
      name?: string;
      type?: "solid" | "half";
      hexCode?: string;
      code?: string;
      colors?: string[];
    }
  ): Promise<{ data: ApiResponse<Color> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/colors/${id}`, data),

  // Xóa mềm màu sắc
  delete: (id: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/colors/${id}`),

  // Khôi phục màu sắc đã xóa
  restore: (id: string): Promise<{ data: ApiResponse<Color> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/colors/${id}/restore`),
};

// Backward compatibility
export const colorApi = { ...adminColorService };
