import { axiosInstanceAuth } from "../utils/axiosIntance";

const API_PREFIX = "/api/v1/admin/materials";

export const materialApi = {
  // Lấy tất cả materials
  getAll: (params?: any) => axiosInstanceAuth.get(`${API_PREFIX}`, { params }),

  // Lấy materials đã xóa mềm
  getDeleted: (params?: any) =>
    axiosInstanceAuth.get(`${API_PREFIX}/deleted`, { params }),

  // Lấy chi tiết material theo ID
  getById: (id: string) => axiosInstanceAuth.get(`${API_PREFIX}/${id}`),

  // Tạo mới material
  create: (data: any) => axiosInstanceAuth.post(`${API_PREFIX}`, data),

  // Cập nhật material
  update: (id: string, data: any) =>
    axiosInstanceAuth.put(`${API_PREFIX}/${id}`, data),

  // Xóa mềm material
  delete: (id: string) => axiosInstanceAuth.delete(`${API_PREFIX}/${id}`),

  // Khôi phục material đã xóa mềm
  restore: (id: string) => axiosInstanceAuth.put(`${API_PREFIX}/${id}/restore`),

  // Toggle status
  toggleStatus: (id: string, data: { isActive: boolean }) =>
    axiosInstanceAuth.patch(`${API_PREFIX}/${id}/status`, data),
};

export default materialApi;
