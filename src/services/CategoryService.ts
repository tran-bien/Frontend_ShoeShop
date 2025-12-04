import { axiosInstanceAuth } from "../utils/axiosIntance";
import type { Category, CategoryQueryParams } from "../types/category";
import { ApiResponse } from "../types/api";

// Admin Category Service
export const adminCategoryService = {
  // Láº¥y táº¥t cáº£ danh má»¥c
  getAll: (
    params?: CategoryQueryParams
  ): Promise<{ data: ApiResponse<Category[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/categories", { params }),

  // Láº¥y danh má»¥c Ä‘Ã£ xÃ³a
  getDeleted: (
    params?: CategoryQueryParams
  ): Promise<{ data: ApiResponse<Category[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/categories/deleted", { params }),

  // Láº¥y chi tiáº¿t danh má»¥c theo ID
  getById: (id: string): Promise<{ data: ApiResponse<Category> }> =>
    axiosInstanceAuth.get(`/api/v1/admin/categories/${id}`),

  // Táº¡o má»›i danh má»¥c
  create: (data: {
    name: string;
    description?: string;
    parent?: string;
    image?: { url: string; public_id: string };
    isActive?: boolean;
  }): Promise<{ data: ApiResponse<Category> }> =>
    axiosInstanceAuth.post("/api/v1/admin/categories", data),

  // Cáº­p nháº­t danh má»¥c
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

  // XÃ³a má»m danh má»¥c
  delete: (id: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/categories/${id}`),

  // KhÃ´i phá»¥c danh má»¥c Ä‘Ã£ xÃ³a
  restore: (
    id: string,
    cascade: boolean = true
  ): Promise<{ data: ApiResponse<Category> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/categories/${id}/restore`, {
      cascade,
    }),

  // Cáº­p nháº­t tráº¡ng thÃ¡i active cá»§a danh má»¥c
  updateStatus: (
    id: string,
    data: { isActive: boolean; cascade?: boolean }
  ): Promise<{ data: ApiResponse<Category> }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/categories/${id}/status`, data),
};

export default adminCategoryService;
