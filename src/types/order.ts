/**
 * Order Types
 * Định nghĩa các interface liên quan đến Đơn hàng
 */

// =======================
// ORDER ITEM TYPES
// =======================

export interface OrderItemVariant {
  _id: string;
  color: {
    _id: string;
    name: string;
    code: string;
    type?: string;
  };
  product: {
    _id: string;
    name: string;
    slug: string;
    images: Array<{
      url: string;
      public_id: string;
      isMain: boolean;
      displayOrder: number;
    }>;
  };
  price: number;
}

export interface OrderItemSize {
  _id: string;
  value: string | number;
  description?: string;
}

export interface OrderItem {
  _id: string;
  variant: OrderItemVariant;
  size: OrderItemSize;
  productName: string;
  quantity: number;
  price: number;
  image: string;
  hasBeenExchanged?: boolean;
  exchangeHistory?: Array<{
    returnRequestId: string;
    exchangedAt: string;
    fromVariant: string;
    fromSize: string;
    toVariant: string;
    toSize: string;
  }>;
}

// =======================
// ORDER ADDRESS TYPES
// =======================

export interface OrderShippingAddress {
  name: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
}

// =======================
// ORDER STATUS TYPES
// =======================

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipping"
  | "delivered"
  | "cancelled";
export type PaymentMethod = "COD" | "VNPAY";
export type PaymentStatus = "pending" | "paid" | "failed";

export interface OrderStatusHistory {
  status: OrderStatus;
  updatedAt: string;
  updatedBy?: string;
  note?: string;
}

export interface OrderPayment {
  method: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  paidAt?: string;
}

export interface OrderPaymentHistory {
  status: PaymentStatus;
  transactionId?: string;
  amount?: number;
  method?: PaymentMethod;
  updatedAt: string;
  responseData?: Record<string, unknown>;
}

// =======================
// ORDER COUPON TYPES
// =======================

export interface OrderCoupon {
  _id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  maxDiscount?: number;
}

export interface OrderCouponDetail {
  code: string;
  type: "percent" | "fixed";
  value: number;
  maxDiscount?: number;
}

// =======================
// MAIN ORDER INTERFACE
// =======================

export interface Order {
  _id: string;
  code: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: {
      url: string;
      public_id: string;
    };
  };
  orderItems: OrderItem[];
  shippingAddress: OrderShippingAddress;
  note: string;
  subTotal: number;
  status: OrderStatus;
  inventoryDeducted: boolean;
  statusHistory: OrderStatusHistory[];
  payment: OrderPayment;
  paymentHistory: OrderPaymentHistory[];
  coupon?: OrderCoupon;
  couponDetail?: OrderCouponDetail;
  shippingFee: number;
  discount: number;
  totalAfterDiscountAndShipping: number;
  cancelRequestId?: string;
  hasCancelRequest: boolean;
  cancelReason: string;
  cancelledAt?: string;
  deliveredAt?: string;
  confirmedAt?: string;
  shippingAt?: string;
  returnConfirmed?: boolean;
  returnConfirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// =======================
// ORDER CRUD DATA
// =======================

export interface CreateOrderData {
  addressId: string;
  paymentMethod: PaymentMethod;
  note?: string;
  couponCode?: string;
}

export interface CancelOrderData {
  reason: string;
  description?: string;
}

// =======================
// ORDER QUERY PARAMS
// =======================

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
  sort?: string;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  fromDate?: string;
  toDate?: string;
}

// =======================
// ORDER STATS TYPES
// =======================

export interface OrderStats {
  pending: number;
  confirmed: number;
  shipping: number;
  delivered: number;
  cancelled: number;
  total: number;
}

// =======================
// ORDER RESPONSE TYPES
// =======================

export interface OrdersResponse {
  success: boolean;
  message: string;
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: OrderStats;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  order: Order;
  paymentUrl?: string; // For VNPAY
}

export interface OrderDetailResponse {
  success: boolean;
  message: string;
  order: Order;
}

// =======================
// CANCEL REQUEST TYPES
// =======================

export type CancelRequestStatus = "pending" | "approved" | "rejected";

export interface CancelRequest {
  _id: string;
  order: {
    _id: string;
    code: string;
    status: string;
    totalAfterDiscountAndShipping: number;
    user: { name: string; email: string };
    payment: { method: string; paymentStatus: string };
  };
  user: {
    name: string;
    email: string;
    phone: string;
    avatar?: { url: string };
  };
  reason: string;
  status: CancelRequestStatus;
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface ProcessCancelRequestData {
  status: "approved" | "rejected";
  adminResponse?: string;
}

export interface CancelRequestsResponse {
  success: boolean;
  message?: string;
  data?: {
    cancelRequests: CancelRequest[];
  };
  cancelRequests?: CancelRequest[]; // Alternative structure
}
