/**
 * Return Request Types
 * Định nghĩa các interface liên quan đến Yêu cầu trả hàng/hoàn tiền
 * (Đã loại bỏ logic đổi hàng - chỉ có trả hàng/hoàn tiền toàn bộ đơn)
 */

// =======================
// RETURN REQUEST STATUS & TYPES
// =======================

export type ReturnRequestStatus =
  | "pending" // Chờ duyệt
  | "approved" // Đã duyệt, chờ shipper lấy hàng
  | "shipping" // Shipper đang lấy hàng
  | "received" // Đã nhận hàng trả
  | "refunded" // Đã hoàn tiền (bank_transfer)
  | "completed" // Hoàn tất
  | "rejected" // Từ chối
  | "cancel_pending" // Chờ admin duyệt hủy
  | "canceled"; // Khách hủy (đã được admin duyệt)

export type RefundMethod = "cash" | "bank_transfer";

export type ReturnReason =
  | "wrong_size"
  | "wrong_product"
  | "defective"
  | "not_as_described"
  | "changed_mind"
  | "other";

// =======================
// BANK INFO TYPES
// =======================

export interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

// =======================
// CREATE RETURN REQUEST DATA
// =======================

export interface CreateReturnRequestData {
  orderId: string;
  reason: ReturnReason;
  reasonDetail?: string;
  refundMethod: RefundMethod;
  bankInfo?: BankInfo;
  pickupAddressId?: string; // ID địa chỉ lấy hàng từ sổ địa chỉ user
}

// =======================
// REFUND COLLECTED BY SHIPPER
// =======================

export interface RefundCollectedByShipper {
  collected: boolean;
  amount?: number;
  collectedAt?: string;
  shipperId?: string;
  note?: string;
}

// =======================
// MAIN RETURN REQUEST INTERFACE
// =======================

export interface ReturnRequest {
  _id: string;
  code?: string;
  order: {
    _id: string;
    code: string;
    orderItems?: Array<{
      variant: {
        _id: string;
        product?: {
          _id: string;
          name: string;
          images?: Array<{ url: string; public_id: string }>;
          slug?: string;
        };
        color?: { _id: string; name: string; code: string };
      };
      size: {
        _id: string;
        value: string | number;
      };
      productName: string;
      quantity: number;
      price: number;
      image?: string;
    }>;
    totalAfterDiscountAndShipping?: number;
    shippingAddress?: {
      fullName: string;
      phone: string;
      address: string;
      addressLine?: string;
      ward?: string;
      district?: string;
      province?: string;
    };
    user?: {
      _id: string;
      name: string;
      email: string;
    };
  };
  customer: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: {
      url: string;
      public_id: string;
    };
  };
  reason: ReturnReason;
  reasonDetail?: string;
  refundMethod: RefundMethod;
  refundAmount: number;
  returnShippingFee: number;
  bankInfo?: BankInfo;
  status: ReturnRequestStatus;

  // Assigned shipper
  assignedShipper?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  assignedAt?: string;
  assignedBy?: {
    _id: string;
    name: string;
  };

  // Approval/Rejection
  approvedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  approvedAt?: string;
  rejectedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  rejectedAt?: string;
  rejectionReason?: string;
  adminNote?: string;
  staffNotes?: string;

  // Pickup address - Địa chỉ lấy hàng trả
  pickupAddress?: {
    name: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    detail: string;
  };

  // Received by shipper
  receivedBy?: {
    _id: string;
    name: string;
  };
  receivedAt?: string;
  receivedNote?: string;

  // Refund collected (for cash refund)
  refundCollectedByShipper?: RefundCollectedByShipper;

  // Completion
  completedBy?: {
    _id: string;
    name: string;
  };
  completedAt?: string;

  // Cancellation
  cancelledAt?: string;
  cancellationReason?: string;

  // Cancel request (khách đổi ý không muốn trả hàng nữa)
  cancelReason?: string;
  cancelRequestedAt?: string;
  cancelApprovedBy?: {
    _id: string;
    name: string;
  };
  cancelApprovedAt?: string;

  createdAt: string;
  updatedAt: string;
}

// =======================
// RETURN REQUEST QUERY PARAMS
// =======================

export interface ReturnRequestQueryParams {
  page?: number;
  limit?: number;
  status?: ReturnRequestStatus;
  search?: string;
  sort?: string;
  fromDate?: string;
  toDate?: string;
}

// =======================
// RETURN REQUEST STATS
// =======================

export interface ReturnRequestStats {
  pending: number;
  approved: number;
  shipping: number;
  received: number;
  refunded: number;
  completed: number;
  rejected: number;
  cancel_pending: number; // Chờ admin duyệt hủy
  canceled: number;
  total: number;
}

// =======================
// RETURN REQUEST RESPONSE TYPES
// =======================

export interface ReturnRequestsResponse {
  success: boolean;
  message: string;
  data?: ReturnRequest[];
  returnRequests?: ReturnRequest[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats?: ReturnRequestStats;
}

export interface ReturnRequestDetailResponse {
  success: boolean;
  message: string;
  data?: ReturnRequest;
  returnRequest?: ReturnRequest;
}
