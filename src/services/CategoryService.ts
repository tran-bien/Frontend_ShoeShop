import { axiosInstanceAuth } from "../utils/axiosIntance";
import type { Category, CategoryQueryParams } from "../types/category";
import { ApiResponse } from "../types/api";

// Admin Category Service
export const adminCategoryService = {
  // Lấy tất cả danh mục
  getAll: (
    params?: CategoryQueryParams
  ): Promise<{ data: ApiResponse<Category[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/categories", { params }),

  // Lấy danh mục đã xóa
  getDeleted: (
    params?: CategoryQueryParams
  ): Promise<{ data: ApiResponse<Category[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/categories/deleted", { params }),

  // Lấy chi tiết danh mục theo ID
  getById: (id: string): Promise<{ data: ApiResponse<Category> }> =>
    axiosInstanceAuth.get(`/api/v1/admin/categories/${id}`),

  // Tạo mới danh mục
  create: (data: {
    name: string;
    description?: string;
    parent?: string;
    image?: { url: string; public_id: string };
    isActive?: boolean;
  }): Promise<{ data: ApiResponse<Category> }> =>
    axiosInstanceAuth.post("/api/v1/admin/categories", data),

  // Cập nhật danh mục
  update: (
    id: string,
    data: {
      name?: string;
      description?: string;
      parent?: string;
      image?: { url: string; public_id: string };
      isActive?: boolean;
    }
  ): Promise<{ data: ApiResponse<Category> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/categories/${id}`, data),

  // Xóa mềm danh mục
  delete: (id: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/categories/${id}`),

  // Khôi phục danh mục đã xóa
  restore: (
    id: string,
    cascade: boolean = true
  ): Promise<{ data: ApiResponse<Category> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/categories/${id}/restore`, {
      cascade,
    }),

  // Cập nhật trạng thái active của danh mục
  updateStatus: (
    id: string,
    data: { isActive: boolean; cascade?: boolean }
  ): Promise<{ data: ApiResponse<Category> }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/categories/${id}/status`, data),
};

export default adminCategoryService;
