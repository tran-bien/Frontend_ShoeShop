import { axiosInstanceAuth } from "../utils/axiosIntance";

const API_PREFIX = "/api/v1/admin/use-cases";

export const useCaseApi = {
  // Lấy tất cả use cases
  getAll: (params?: any) => axiosInstanceAuth.get(`${API_PREFIX}`, { params }),

  // Lấy use cases đã xóa mềm
  getDeleted: (params?: any) =>
    axiosInstanceAuth.get(`${API_PREFIX}/deleted`, { params }),

  // Lấy chi tiết use case theo ID
  getById: (id: string) => axiosInstanceAuth.get(`${API_PREFIX}/${id}`),

  // Tạo mới use case
  create: (data: any) => axiosInstanceAuth.post(`${API_PREFIX}`, data),

  // Cập nhật use case
  update: (id: string, data: any) =>
    axiosInstanceAuth.put(`${API_PREFIX}/${id}`, data),

  // Xóa mềm use case
  delete: (id: string) => axiosInstanceAuth.delete(`${API_PREFIX}/${id}`),

  // Khôi phục use case đã xóa mềm
  restore: (id: string) => axiosInstanceAuth.put(`${API_PREFIX}/${id}/restore`),

  // Toggle status
  toggleStatus: (id: string, data: { isActive: boolean }) =>
    axiosInstanceAuth.patch(`${API_PREFIX}/${id}/status`, data),
};

export default useCaseApi;
