import { axiosInstanceAuth } from "../utils/axiosIntance";
import type { Size, SizeQueryParams } from "../types/size";
import { ApiResponse } from "../types/api";

// Admin Size Service
export const adminSizeService = {
  // Láº¥y táº¥t cáº£ kÃ­ch cá»¡
  getAll: (params?: SizeQueryParams): Promise<{ data: ApiResponse<Size[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/sizes", { params }),

  // Láº¥y kÃ­ch cá»¡ Ä‘Ã£ xÃ³a
  getDeleted: (
    params?: SizeQueryParams
  ): Promise<{ data: ApiResponse<Size[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/sizes/deleted", { params }),

  // Láº¥y chi tiáº¿t kÃ­ch cá»¡ theo ID
  getById: (id: string): Promise<{ data: ApiResponse<Size> }> =>
    axiosInstanceAuth.get(`/api/v1/admin/sizes/${id}`),

  // Táº¡o má»›i kÃ­ch cá»¡
  create: (data: {
    value: string;
    region: string;
  }): Promise<{ data: ApiResponse<Size> }> =>
    axiosInstanceAuth.post("/api/v1/admin/sizes", data),

  // Cáº­p nháº­t kÃ­ch cá»¡
  update: (
    id: string,
    data: {
      value?: string;
      region?: string;
    }
  ): Promise<{ data: ApiResponse<Size> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/sizes/${id}`, data),

  // XÃ³a má»m kÃ­ch cá»¡
  delete: (id: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/sizes/${id}`),

  // KhÃ´i phá»¥c kÃ­ch cá»¡ Ä‘Ã£ xÃ³a
  restore: (id: string): Promise<{ data: ApiResponse<Size> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/sizes/${id}/restore`),
};

export default adminSizeService;
