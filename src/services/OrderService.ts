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
  // Láº¥y danh sÃ¡ch Ä‘Æ¡n hÃ ng cá»§a ngÆ°á»i dÃ¹ng vá»›i phÃ¢n trang vÃ  filter
  getOrders: (
    params: OrderQueryParams = {}
  ): Promise<{ data: OrdersResponse }> =>
    axiosInstanceAuth.get("/api/v1/users/orders", { params }),

  // Táº¡o Ä‘Æ¡n hÃ ng má»›i
  createOrder: (
    data: CreateOrderData
  ): Promise<{ data: CreateOrderResponse }> =>
    axiosInstanceAuth.post("/api/v1/users/orders", data),

  // Láº¥y chi tiáº¿t Ä‘Æ¡n hÃ ng
  getOrderById: (orderId: string): Promise<{ data: OrderDetailResponse }> =>
    axiosInstanceAuth.get(`/api/v1/users/orders/${orderId}`),

  // Gá»­i yÃªu cáº§u há»§y Ä‘Æ¡n hÃ ng
  cancelOrder: (
    orderId: string,
    data: CancelOrderData
  ): Promise<{ data: CancelOrderResponse }> =>
    axiosInstanceAuth.post(`/api/v1/users/orders/${orderId}/cancel`, data),

  // Láº¥y danh sÃ¡ch yÃªu cáº§u há»§y Ä‘Æ¡n hÃ ng cá»§a user
  getUserCancelRequests: (params?: {
    page?: number;
    limit?: number;
    status?: "pending" | "approved" | "rejected";
  }): Promise<{ data: CancelRequestsResponse }> =>
    axiosInstanceAuth.get("/api/v1/users/orders/user-cancel-requests", {
      params,
    }),

  // Thanh toÃ¡n láº¡i Ä‘Æ¡n hÃ ng
  repayOrder: (orderId: string): Promise<{ data: CreateOrderResponse }> =>
    axiosInstanceAuth.post(`/api/v1/users/orders/${orderId}/repay`),
};

// =======================
// ADMIN ORDER SERVICE
// =======================

export const adminOrderService = {
  // Láº¥y danh sÃ¡ch táº¥t cáº£ Ä‘Æ¡n hÃ ng (admin)
  getAllOrders: (
    params: OrderQueryParams = {}
  ): Promise<{ data: OrdersResponse }> =>
    axiosInstanceAuth.get("/api/v1/admin/orders", { params }),

  // Láº¥y chi tiáº¿t Ä‘Æ¡n hÃ ng (admin)
  getOrderDetail: (orderId: string): Promise<{ data: OrderDetailResponse }> =>
    axiosInstanceAuth.get(`/api/v1/admin/orders/${orderId}`),

  // Cáº­p nháº­t tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng
  updateOrderStatus: (
    orderId: string,
    data: {
      status: "confirmed" | "shipping" | "delivered";
      note?: string;
    }
  ): Promise<{ data: UpdateOrderStatusResponse }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/orders/${orderId}/status`, data),

  // Láº¥y danh sÃ¡ch yÃªu cáº§u há»§y Ä‘Æ¡n hÃ ng
  getCancelRequests: (params?: {
    page?: number;
    limit?: number;
    status?: "pending" | "approved" | "rejected";
  }): Promise<{ data: CancelRequestsResponse }> =>
    axiosInstanceAuth.get("/api/v1/admin/orders/cancel-requests", { params }),

  // Xá»­ lÃ½ yÃªu cáº§u há»§y Ä‘Æ¡n hÃ ng
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
  // Xá»­ lÃ½ callback tá»« VNPAY
  vnpayCallback: (
    params: VnpayCallbackParams
  ): Promise<{ data: VnpayResponse }> =>
    axiosInstance.get("/api/v1/users/orders/vnpay/callback", { params }),

  // Xá»­ lÃ½ IPN tá»« VNPAY
  vnpayIpn: (data: VnpayCallbackParams): Promise<{ data: VnpayResponse }> =>
    axiosInstance.post("/api/v1/users/orders/vnpay/ipn", data),

  // Test callback tá»« VNPAY
  testVnpayCallback: (): Promise<{ data: VnpayResponse }> =>
    axiosInstance.get("/api/v1/users/orders/vnpay/test-callback"),
};

export default userOrderService;
