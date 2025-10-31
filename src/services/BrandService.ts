import { axiosInstanceAuth } from "../utils/axiosIntance";
import type { Brand, BrandQueryParams } from "../types/brand";
import { ApiResponse } from "../types/api";

// Admin Brand Service
export const adminBrandService = {
  // Lấy tất cả thương hiệu
  getAll: (
    params?: BrandQueryParams
  ): Promise<{ data: ApiResponse<Brand[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/brands", { params }),

  // Lấy thương hiệu đã xóa mềm
  getDeleted: (
    params?: BrandQueryParams
  ): Promise<{ data: ApiResponse<Brand[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/brands/deleted", { params }),

  // Lấy chi tiết thương hiệu theo ID
  getById: (id: string): Promise<{ data: ApiResponse<Brand> }> =>
    axiosInstanceAuth.get(`/api/v1/admin/brands/${id}`),

  // Tạo mới thương hiệu
  create: (data: {
    name: string;
    description?: string;
    isActive?: boolean;
  }): Promise<{ data: ApiResponse<Brand> }> =>
    axiosInstanceAuth.post("/api/v1/admin/brands", data),

  // Cập nhật thương hiệu
  update: (
    id: string,
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
    }
  ): Promise<{ data: ApiResponse<Brand> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/brands/${id}`, data),

  // Xóa mềm thương hiệu
  delete: (id: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/brands/${id}`),

  // Khôi phục thương hiệu đã xóa mềm
  restore: (id: string): Promise<{ data: ApiResponse<Brand> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/brands/${id}/restore`),

  // Cập nhật trạng thái active của thương hiệu
  updateStatus: (
    id: string,
    data: { isActive: boolean; cascade?: boolean }
  ): Promise<{ data: ApiResponse<Brand> }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/brands/${id}/status`, data),
};

// Backward compatibility
export const brandApi = { ...adminBrandService };
