import { axiosInstanceAuth, axiosInstance } from "../utils/axiosIntance";
import type { Tag, TagQueryParams } from "../types/tag";
import { ApiResponse } from "../types/api";

// Admin Tag Service
export const adminTagService = {
  // Lấy tất cả tags (Admin/Staff)
  getAll: (params?: TagQueryParams): Promise<{ data: ApiResponse<Tag[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/tags", { params }),

  // Lấy tags active (Admin sử dụng để lọc cho dropdown)
  getActiveTags: (
    params?: TagQueryParams
  ): Promise<{ data: ApiResponse<Tag[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/tags", {
      params: { ...params, isActive: true },
    }),

  // Lấy tags đã xóa mềm (Admin/Staff)
  getDeleted: (
    params?: TagQueryParams
  ): Promise<{ data: ApiResponse<Tag[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/tags/deleted", { params }),

  // Lấy chi tiết tag theo ID (Admin/Staff)
  getById: (id: string): Promise<{ data: ApiResponse<Tag> }> =>
    axiosInstanceAuth.get(`/api/v1/admin/tags/${id}`),

  // Tạo mới tag (Admin/Staff)
  create: (data: {
    name: string;
    type: "MATERIAL" | "USECASE" | "CUSTOM";
    description?: string;
    isActive?: boolean;
  }): Promise<{ data: ApiResponse<Tag> }> =>
    axiosInstanceAuth.post("/api/v1/admin/tags", data),

  // Cập nhật tag (Admin/Staff)
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

  // Xóa mềm tag (Admin/Staff)
  delete: (id: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/tags/${id}`),

  // Khôi phục tag đã xóa mềm (Admin/Staff)
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
  // Lấy tất cả tags active (Public)
  getActiveTags: (
    params?: TagQueryParams
  ): Promise<{ data: ApiResponse<Tag[]> }> =>
    axiosInstance.get("/api/v1/tags", { params }),

  // Lấy tags theo type (Public - MATERIAL/USECASE/CUSTOM)
  getByType: (
    type: string,
    params?: TagQueryParams
  ): Promise<{ data: ApiResponse<Tag[]> }> =>
    axiosInstance.get(`/api/v1/tags/type/${type}`, { params }),

  // Lấy tag detail (Public - chỉ active)
  getPublicById: (id: string): Promise<{ data: ApiResponse<Tag> }> =>
    axiosInstance.get(`/api/v1/tags/${id}`),
};

export default adminTagService;
