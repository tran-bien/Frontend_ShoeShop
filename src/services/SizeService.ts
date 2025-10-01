import { axiosInstanceAuth } from "../utils/axiosIntance";

const API_PREFIX = "/api/v1/admin/sizes";

export const sizeApi = {
  getAll: (params?: any) => axiosInstanceAuth.get(`${API_PREFIX}`, { params }),
  getDeleted: (params?: any) =>
    axiosInstanceAuth.get(`${API_PREFIX}/deleted`, { params }),
  getById: (id: string) => axiosInstanceAuth.get(`${API_PREFIX}/${id}`),
  create: (data: any) => axiosInstanceAuth.post(`${API_PREFIX}`, data),
  update: (id: string, data: any) =>
    axiosInstanceAuth.put(`${API_PREFIX}/${id}`, data),
  delete: (id: string) => axiosInstanceAuth.delete(`${API_PREFIX}/${id}`),
  restore: (id: string) => axiosInstanceAuth.put(`${API_PREFIX}/${id}/restore`),
};
