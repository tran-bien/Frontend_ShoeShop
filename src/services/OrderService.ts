import { axiosInstanceAuth } from "../utils/axiosIntance";

export const orderApi = {
  createOrder: (data: {
    addressId: string;
    paymentMethod: string;
    note?: string;
    couponCode?: string;
  }) => axiosInstanceAuth.post("http://localhost:5005/api/v1/orders", data),

  getOrders: (params: { page?: number; limit?: number; status?: string }) =>
    axiosInstanceAuth.get("http://localhost:5005/api/v1/orders", { params }),

  // Lấy danh sách đơn hàng (admin)
  getAllAdminOrders: (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) =>
    axiosInstanceAuth.get("http://localhost:5005/api/v1/admin/orders", {
      params,
    }),

  // Lấy chi tiết đơn hàng (admin)
  getAdminOrderById: (orderId: string) =>
    axiosInstanceAuth.get(
      `http://localhost:5005/api/v1/admin/orders/${orderId}`
    ),

  // Lấy danh sách yêu cầu hủy đơn (admin)
  getCancelRequests: (params?: { page?: number; limit?: number }) =>
    axiosInstanceAuth.get(
      "http://localhost:5005/api/v1/admin/orders/cancel-requests",
      { params }
    ),

  // Duyệt hoặc xử lý yêu cầu hủy đơn (admin)
  handleCancelRequest: (cancelRequestId: string, data: any) =>
    axiosInstanceAuth.patch(
      `http://localhost:5005/api/v1/admin/orders/cancel-requests/${cancelRequestId}`,
      data
    ),

  // Cập nhật trạng thái đơn hàng (admin)
  updateOrderStatus: (orderId: string, data: { status: string }) =>
    axiosInstanceAuth.patch(
      `http://localhost:5005/api/v1/admin/orders/${orderId}/status`,
      data
    ),

  // Lấy danh sách yêu cầu hủy đơn hàng của user
  getUserCancelRequests: (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) =>
    axiosInstanceAuth.get(
      "http://localhost:5005/api/v1/orders/user-cancel-requests",
      { params }
    ),

  // Gửi yêu cầu hủy đơn hàng
  cancelOrder: (orderId: string, data: { reason: string }) =>
    axiosInstanceAuth.post(
      `http://localhost:5005/api/v1/orders/${orderId}/cancel`,
      data
    ),
};
