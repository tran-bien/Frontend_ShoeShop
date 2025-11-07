import { axiosInstanceAuth, axiosInstance } from "../utils/axiosIntance";
import type {
  Order,
  CreateOrderData,
  CancelOrderData,
  OrderQueryParams,
  OrdersResponse,
  CreateOrderResponse,
  OrderDetailResponse,
  CancelOrderResponse,
  CancelRequest,
  CancelRequestsResponse,
  ProcessCancelRequestResponse,
  VnpayCallbackParams,
  VnpayResponse,
  UpdateOrderStatusResponse,
} from "../types/order";

// Re-export types for convenience
export type {
  Order,
  OrderQueryParams,
  CreateOrderData,
  CancelOrderData,
  CreateOrderResponse,
  OrderDetailResponse,
  CancelRequest,
  VnpayCallbackParams,
};

// =======================
// USER ORDER SERVICE
// =======================

export const userOrderService = {
  // Lấy danh sách đơn hàng của người dùng với phân trang và filter
  getOrders: (
    params: OrderQueryParams = {}
  ): Promise<{ data: OrdersResponse }> =>
    axiosInstanceAuth.get("/api/v1/users/orders", { params }),

  // Tạo đơn hàng mới
  createOrder: (
    data: CreateOrderData
  ): Promise<{ data: CreateOrderResponse }> =>
    axiosInstanceAuth.post("/api/v1/users/orders", data),

  // Lấy chi tiết đơn hàng
  getOrderById: (orderId: string): Promise<{ data: OrderDetailResponse }> =>
    axiosInstanceAuth.get(`/api/v1/users/orders/${orderId}`),

  // Gửi yêu cầu hủy đơn hàng
  cancelOrder: (
    orderId: string,
    data: CancelOrderData
  ): Promise<{ data: CancelOrderResponse }> =>
    axiosInstanceAuth.post(`/api/v1/users/orders/${orderId}/cancel`, data),

  // Lấy danh sách yêu cầu hủy đơn hàng của user
  getUserCancelRequests: (params?: {
    page?: number;
    limit?: number;
    status?: "pending" | "approved" | "rejected";
  }): Promise<{ data: CancelRequestsResponse }> =>
    axiosInstanceAuth.get("/api/v1/users/orders/user-cancel-requests", {
      params,
    }),

  // Thanh toán lại đơn hàng
  repayOrder: (orderId: string): Promise<{ data: CreateOrderResponse }> =>
    axiosInstanceAuth.post(`/api/v1/users/orders/${orderId}/repay`),
};

// =======================
// ADMIN ORDER SERVICE
// =======================

export const adminOrderService = {
  // Lấy danh sách tất cả đơn hàng (admin)
  getAllOrders: (
    params: OrderQueryParams = {}
  ): Promise<{ data: OrdersResponse }> =>
    axiosInstanceAuth.get("/api/v1/admin/orders", { params }),

  // Lấy chi tiết đơn hàng (admin)
  getOrderDetail: (orderId: string): Promise<{ data: OrderDetailResponse }> =>
    axiosInstanceAuth.get(`/api/v1/admin/orders/${orderId}`),

  // Cập nhật trạng thái đơn hàng
  updateOrderStatus: (
    orderId: string,
    data: {
      status: "confirmed" | "shipping" | "delivered";
      note?: string;
    }
  ): Promise<{ data: UpdateOrderStatusResponse }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/orders/${orderId}/status`, data),

  // Lấy danh sách yêu cầu hủy đơn hàng
  getCancelRequests: (params?: {
    page?: number;
    limit?: number;
    status?: "pending" | "approved" | "rejected";
  }): Promise<{ data: CancelRequestsResponse }> =>
    axiosInstanceAuth.get("/api/v1/admin/orders/cancel-requests", { params }),

  // Xử lý yêu cầu hủy đơn hàng
  processCancelRequest: (
    requestId: string,
    data: {
      status: "approved" | "rejected";
      adminResponse?: string;
    }
  ): Promise<{ data: ProcessCancelRequestResponse }> =>
    axiosInstanceAuth.patch(
      `/api/v1/admin/orders/cancel-requests/${requestId}`,
      data
    ),
};

// =======================
// PAYMENT SERVICE (VNPAY)
// =======================

export const paymentService = {
  // Xử lý callback từ VNPAY
  vnpayCallback: (
    params: VnpayCallbackParams
  ): Promise<{ data: VnpayResponse }> =>
    axiosInstance.get("/api/v1/users/orders/vnpay/callback", { params }),

  // Xử lý IPN từ VNPAY
  vnpayIpn: (data: VnpayCallbackParams): Promise<{ data: VnpayResponse }> =>
    axiosInstance.post("/api/v1/users/orders/vnpay/ipn", data),

  // Test callback từ VNPAY
  testVnpayCallback: (): Promise<{ data: VnpayResponse }> =>
    axiosInstance.get("/api/v1/users/orders/vnpay/test-callback"),
};

// =======================
// Backward compatibility
// =======================

export const orderApi = {
  // User API
  getOrders: userOrderService.getOrders,
  createOrder: userOrderService.createOrder,
  getOrderById: userOrderService.getOrderById,
  cancelOrder: userOrderService.cancelOrder,
  getUserCancelRequests: userOrderService.getUserCancelRequests,
  repayOrder: userOrderService.repayOrder,

  // Admin API
  adminGetOrders: adminOrderService.getAllOrders,
  adminGetOrderById: adminOrderService.getOrderDetail,
  adminUpdateOrderStatus: adminOrderService.updateOrderStatus,
  adminGetCancelRequests: adminOrderService.getCancelRequests,
  adminProcessCancelRequest: adminOrderService.processCancelRequest,

  // Payment API
  vnpayCallback: paymentService.vnpayCallback,
  vnpayIpn: paymentService.vnpayIpn,
  testVnpayCallback: paymentService.testVnpayCallback,
};

export default userOrderService;
