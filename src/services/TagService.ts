import { axiosInstanceAuth, axiosInstance } from "../utils/axiosIntance";

const API_PREFIX = "/api/v1/admin/tags";
const PUBLIC_API_PREFIX = "/api/v1/tags";

export const tagApi = {
  // ========== ADMIN ENDPOINTS (Auth required) ==========

  // Lấy tất cả tags (Admin/Staff)
  getAll: (params?: any) => axiosInstanceAuth.get(`${API_PREFIX}`, { params }),

  // Lấy tags đã xóa mềm (Admin/Staff)
  getDeleted: (params?: any) =>
    axiosInstanceAuth.get(`${API_PREFIX}/deleted`, { params }),

  // Lấy chi tiết tag theo ID (Admin/Staff)
  getById: (id: string) => axiosInstanceAuth.get(`${API_PREFIX}/${id}`),

  // Tạo mới tag (Admin/Staff)
  create: (data: any) => axiosInstanceAuth.post(`${API_PREFIX}`, data),

  // Cập nhật tag (Admin/Staff)
  update: (id: string, data: any) =>
    axiosInstanceAuth.put(`${API_PREFIX}/${id}`, data),

  // Xóa mềm tag (Admin/Staff)
  delete: (id: string) => axiosInstanceAuth.delete(`${API_PREFIX}/${id}`),

  // Khôi phục tag đã xóa mềm (Admin/Staff)
  restore: (id: string) =>
    axiosInstanceAuth.patch(`${API_PREFIX}/${id}/restore`),

  // Toggle status (Admin/Staff)
  toggleStatus: (id: string, data: { isActive: boolean }) =>
    axiosInstanceAuth.patch(`${API_PREFIX}/${id}/status`, data),

  // ========== PUBLIC ENDPOINTS (No auth) ==========

  // Lấy tất cả tags active (Public)
  getActiveTags: (params?: any) =>
    axiosInstance.get(`${PUBLIC_API_PREFIX}`, { params }),

  // Lấy tags theo type (Public - MATERIAL/USECASE/CUSTOM)
  getByType: (type: string, params?: any) =>
    axiosInstance.get(`${PUBLIC_API_PREFIX}/type/${type}`, { params }),

  // Lấy tag detail (Public - chỉ active)
  getPublicById: (id: string) =>
    axiosInstance.get(`${PUBLIC_API_PREFIX}/${id}`),
};

export default tagApi;
