import { axiosInstanceAuth, axiosInstance } from "../utils/axiosIntance";
import type { Tag, TagQueryParams } from "../types/tag";
import { ApiResponse } from "../types/api";

// Admin Tag Service
export const adminTagService = {
  // Láº¥y táº¥t cáº£ tags (Admin/Staff)
  getAll: (params?: TagQueryParams): Promise<{ data: ApiResponse<Tag[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/tags", { params }),

  // Láº¥y tags active (Admin sá»­ dá»¥ng Ä‘á»ƒ lá»c cho dropdown)
  getActiveTags: (
    params?: TagQueryParams
  ): Promise<{ data: ApiResponse<Tag[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/tags", {
      params: { ...params, isActive: true },
    }),

  // Láº¥y tags Ä‘Ã£ xÃ³a má»m (Admin/Staff)
  getDeleted: (
    params?: TagQueryParams
  ): Promise<{ data: ApiResponse<Tag[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/tags/deleted", { params }),

  // Láº¥y chi tiáº¿t tag theo ID (Admin/Staff)
  getById: (id: string): Promise<{ data: ApiResponse<Tag> }> =>
    axiosInstanceAuth.get(`/api/v1/admin/tags/${id}`),

  // Táº¡o má»›i tag (Admin/Staff)
  create: (data: {
    name: string;
    type: "MATERIAL" | "USECASE" | "CUSTOM";
    description?: string;
    isActive?: boolean;
  }): Promise<{ data: ApiResponse<Tag> }> =>
    axiosInstanceAuth.post("/api/v1/admin/tags", data),

  // Cáº­p nháº­t tag (Admin/Staff)
  update: (
    id: string,
    data: {
      name?: string;
      type?: "MATERIAL" | "USECASE" | "CUSTOM";
      description?: string;
      isActive?: boolean;
    }
  ): Promise<{ data: ApiResponse<Tag> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/tags/${id}`, data),

  // XÃ³a má»m tag (Admin/Staff)
  delete: (id: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/tags/${id}`),

  // KhÃ´i phá»¥c tag Ä‘Ã£ xÃ³a má»m (Admin/Staff)
  restore: (id: string): Promise<{ data: ApiResponse<Tag> }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/tags/${id}/restore`),

  // Toggle status (Admin/Staff)
  toggleStatus: (
    id: string,
    data: { isActive: boolean }
  ): Promise<{ data: ApiResponse<Tag> }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/tags/${id}/status`, data),
};

// Public Tag Service
export const publicTagService = {
  // Láº¥y táº¥t cáº£ tags active (Public)
  getActiveTags: (
    params?: TagQueryParams
  ): Promise<{ data: ApiResponse<Tag[]> }> =>
    axiosInstance.get("/api/v1/tags", { params }),

  // Láº¥y tags theo type (Public - MATERIAL/USECASE/CUSTOM)
  getByType: (
    type: string,
    params?: TagQueryParams
  ): Promise<{ data: ApiResponse<Tag[]> }> =>
    axiosInstance.get(`/api/v1/tags/type/${type}`, { params }),

  // Láº¥y tag detail (Public - chá»‰ active)
  getPublicById: (id: string): Promise<{ data: ApiResponse<Tag> }> =>
    axiosInstance.get(`/api/v1/tags/${id}`),
};

export default adminTagService;
