import { axiosInstanceAuth } from "../utils/axiosIntance";

const API_PREFIX = "http://localhost:5005/api/v1/admin/categories";

export const categoryApi = {
  // Lấy tất cả danh mục
  getAll: (params?: any) => axiosInstanceAuth.get(`${API_PREFIX}`, { params }),

  // Lấy danh mục đã xóa
  getDeleted: (params?: any) =>
    axiosInstanceAuth.get(`${API_PREFIX}/deleted`, { params }),

  // Lấy chi tiết danh mục theo ID
  getById: (id: string) => axiosInstanceAuth.get(`${API_PREFIX}/${id}`),

  // Tạo mới danh mục
  create: (data: any) => axiosInstanceAuth.post(`${API_PREFIX}`, data),

  // Cập nhật danh mục
  update: (id: string, data: any) =>
    axiosInstanceAuth.put(`${API_PREFIX}/${id}`, data),

  // Xóa mềm danh mục
  delete: (id: string) => axiosInstanceAuth.delete(`${API_PREFIX}/${id}`),

  // Khôi phục danh mục đã xóa
  restore: (id: string, cascade = true) =>
    axiosInstanceAuth.put(`${API_PREFIX}/${id}/restore`, { cascade }),

  // Cập nhật trạng thái active của danh mục
  updateStatus: (id: string, data: { isActive: boolean; cascade?: boolean }) =>
    axiosInstanceAuth.patch(`${API_PREFIX}/${id}/status`, data),
};
