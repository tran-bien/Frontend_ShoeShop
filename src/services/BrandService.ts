import { axiosInstanceAuth } from "../utils/axiosIntance";
import type { Brand, BrandQueryParams } from "../types/brand";
import { ApiResponse } from "../types/api";

// Admin Brand Service
export const adminBrandService = {
  // Láº¥y táº¥t cáº£ thÆ°Æ¡ng hiá»‡u
  getAll: (
    params?: BrandQueryParams
  ): Promise<{ data: ApiResponse<Brand[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/brands", { params }),

  // Láº¥y thÆ°Æ¡ng hiá»‡u Ä‘Ã£ xÃ³a má»m
  getDeleted: (
    params?: BrandQueryParams
  ): Promise<{ data: ApiResponse<Brand[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/brands/deleted", { params }),

  // Láº¥y chi tiáº¿t thÆ°Æ¡ng hiá»‡u theo ID
  getById: (id: string): Promise<{ data: ApiResponse<Brand> }> =>
    axiosInstanceAuth.get(`/api/v1/admin/brands/${id}`),

  // Táº¡o má»›i thÆ°Æ¡ng hiá»‡u
  create: (data: {
    name: string;
    description?: string;
    isActive?: boolean;
  }): Promise<{ data: ApiResponse<Brand> }> =>
    axiosInstanceAuth.post("/api/v1/admin/brands", data),

  // Cáº­p nháº­t thÆ°Æ¡ng hiá»‡u
  update: (
    id: string,
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
    }
  ): Promise<{ data: ApiResponse<Brand> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/brands/${id}`, data),

  // XÃ³a má»m thÆ°Æ¡ng hiá»‡u
  delete: (id: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/brands/${id}`),

  // KhÃ´i phá»¥c thÆ°Æ¡ng hiá»‡u Ä‘Ã£ xÃ³a má»m
  restore: (id: string): Promise<{ data: ApiResponse<Brand> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/brands/${id}/restore`),

  // Cáº­p nháº­t tráº¡ng thÃ¡i active cá»§a thÆ°Æ¡ng hiá»‡u
  updateStatus: (
    id: string,
    data: { isActive: boolean; cascade?: boolean }
  ): Promise<{ data: ApiResponse<Brand> }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/brands/${id}/status`, data),
};

export default adminBrandService;
