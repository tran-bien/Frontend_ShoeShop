import { axiosInstanceAuth } from "../utils/axiosIntance";

const API_PREFIX = "/api/v1/admin/brands";

export const brandApi = {
  // Lấy tất cả thương hiệu
  getAll: (params?: any) => axiosInstanceAuth.get(`${API_PREFIX}`, { params }),
  // Lấy thương hiệu đã xóa mềm
  getDeleted: (params?: any) =>
    axiosInstanceAuth.get(`${API_PREFIX}/deleted`, { params }),
  // Lấy chi tiết thương hiệu theo ID
  getById: (id: string) => axiosInstanceAuth.get(`${API_PREFIX}/${id}`),
  // Tạo mới thương hiệu
  create: (data: any) => axiosInstanceAuth.post(`${API_PREFIX}`, data),
  // Cập nhật thương hiệu
  update: (id: string, data: any) =>
    axiosInstanceAuth.put(`${API_PREFIX}/${id}`, data),
  // Xóa mềm thương hiệu
  delete: (id: string) => axiosInstanceAuth.delete(`${API_PREFIX}/${id}`),
  // Khôi phục thương hiệu đã xóa mềm
  restore: (id: string) => axiosInstanceAuth.put(`${API_PREFIX}/${id}/restore`),
  // Cập nhật trạng thái active của thương hiệu
  updateStatus: (id: string, data: { isActive: boolean; cascade?: boolean }) =>
    axiosInstanceAuth.patch(`${API_PREFIX}/${id}/status`, data),
};
