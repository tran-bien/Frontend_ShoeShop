import { axiosInstanceAuth } from "../utils/axiosIntance";
import type { Color, ColorQueryParams } from "../types/color";
import { ApiResponse } from "../types/api";

// Admin Color Service
export const adminColorService = {
  // Láº¥y táº¥t cáº£ mÃ u sáº¯c
  getAll: (
    params?: ColorQueryParams
  ): Promise<{ data: ApiResponse<Color[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/colors", { params }),

  // Láº¥y mÃ u sáº¯c Ä‘Ã£ xÃ³a
  getDeleted: (
    params?: ColorQueryParams
  ): Promise<{ data: ApiResponse<Color[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/colors/deleted", { params }),

  // Láº¥y chi tiáº¿t mÃ u sáº¯c theo ID
  getById: (id: string): Promise<{ data: ApiResponse<Color> }> =>
    axiosInstanceAuth.get(`/api/v1/admin/colors/${id}`),

  // Táº¡o má»›i mÃ u sáº¯c
  create: (data: {
    name: string;
    type?: "solid" | "half";
    hexCode?: string;
    code?: string;
    colors?: string[];
  }): Promise<{ data: ApiResponse<Color> }> =>
    axiosInstanceAuth.post("/api/v1/admin/colors", data),

  // Cáº­p nháº­t mÃ u sáº¯c
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

  // XÃ³a má»m mÃ u sáº¯c
  delete: (id: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/colors/${id}`),

  // KhÃ´i phá»¥c mÃ u sáº¯c Ä‘Ã£ xÃ³a
  restore: (id: string): Promise<{ data: ApiResponse<Color> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/colors/${id}/restore`),
};

export default adminColorService;
