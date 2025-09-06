import { axiosInstanceAuth } from "../utils/axiosIntance";

const API_PREFIX = "http://localhost:5005/api/v1/admin/products";

export const productApi = {
  // Lấy danh sách tất cả sản phẩm
  getAll: (params?: any) => axiosInstanceAuth.get(`${API_PREFIX}`, { params }),

  // Lấy danh sách sản phẩm đã xóa
  getDeleted: (params?: any) =>
    axiosInstanceAuth.get(`${API_PREFIX}/deleted`, { params }),

  // Lấy chi tiết sản phẩm theo ID
  getDetailById: (id: string) => axiosInstanceAuth.get(`${API_PREFIX}/${id}`),

  // Tạo sản phẩm mới
  create: (data: any) => axiosInstanceAuth.post(`${API_PREFIX}`, data),

  // Cập nhật thông tin sản phẩm
  update: (id: string, data: any) =>
    axiosInstanceAuth.put(`${API_PREFIX}/${id}`, data),

  // Xóa mềm sản phẩm
  delete: (id: string) => axiosInstanceAuth.delete(`${API_PREFIX}/${id}`),

  // Khôi phục sản phẩm đã xóa
  restore: (id: string) => axiosInstanceAuth.put(`${API_PREFIX}/${id}/restore`),

  // Cập nhật trạng thái active của sản phẩm
  updateStatus: (id: string, data: { isActive: boolean; cascade?: boolean }) =>
    axiosInstanceAuth.patch(
      `http://localhost:5005/api/v1/admin/products/${id}/status`,
      data
    ),

  // Cập nhật trạng thái tồn kho sản phẩm
  updateStockStatus: (id: string) =>
    axiosInstanceAuth.post(`${API_PREFIX}/${id}/update-stock-status`),

  // User

  // Lấy danh sách sản phẩm của user
  getAllProductUser: (params?: any) =>
    axiosInstanceAuth.get("http://localhost:5005/api/v1/products", { params }),
  // Lấy danh sách sản phẩm mới của user
  getAllProductNew: (params?: any) =>
    axiosInstanceAuth.get(
      "http://localhost:5005/api/v1/products/new-arrivals?limit=10",
      { params }
    ),
  // Lay chi tiet san pham theo id
  getProductById: (id: string) =>
    axiosInstanceAuth.get(`http://localhost:5005/api/v1/products/${id}`),

  getRelatedProducts: (productId: string) =>
    axiosInstanceAuth.get(
      `http://localhost:5005/api/v1/products/related/${productId}`
    ),
};
