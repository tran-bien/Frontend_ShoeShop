/**
 * Return Request Types
 * Äá»‹nh nghÄ©a cÃ¡c interface liÃªn quan Ä‘áº¿n YÃªu cáº§u Ä‘á»•i/tráº£ hÃ ng
 */

// =======================
// RETURN REQUEST ITEM TYPES
// =======================

export interface ReturnRequestItem {
  variant: string;
  size: string;
  quantity: number;
  reason: string;
  images?: string[];
  exchangeToVariant?: string; // Only for EXCHANGE
  exchangeToSize?: string; // Only for EXCHANGE
}

export interface ReturnRequestItemDetail {
  product: {
    _id: string;
    name: string;
    slug?: string;
    images?: Array<{
      url: string;
      public_id: string;
    }>;
  };
  variant: {
    _id: string;
    color?: {
      _id: string;
      name: string;
      code: string;
    };
    gender?: string;
  };
  size: {
    _id: string;
    value: string | number;
    description?: string;
  };
  quantity: number;
  priceAtPurchase: number;
  exchangeToVariant?: {
    _id: string;
    color?: {
      _id: string;
      name: string;
      code: string;
    };
  };
  exchangeToSize?: {
    _id: string;
    value: string | number;
  };
}

// =======================
// RETURN REQUEST TYPES
// =======================

export type ReturnRequestType = "RETURN" | "EXCHANGE";
export type ReturnRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "processing"
  | "completed"
  | "cancelled";
export type RefundMethod =
  | "original_payment"
  | "store_credit"
  | "bank_transfer";
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
  type: ReturnRequestType;
  items: ReturnRequestItem[];
  reason: string;
  refundMethod?: RefundMethod;
  bankInfo?: BankInfo;
}

// =======================
// MAIN RETURN REQUEST INTERFACE
// =======================

export interface ReturnRequest {
  _id: string;
  order: {
    _id: string;
    code: string;
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
  type: ReturnRequestType;
  items: ReturnRequestItemDetail[];
  reason: ReturnReason;
  reasonDetail?: string;
  images: string[];
  refundMethod?: RefundMethod;
  refundAmount?: number;
  bankInfo?: BankInfo;
  status: ReturnRequestStatus;
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
  processedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  processedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
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
  type?: ReturnRequestType;
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
  rejected: number;
  processing: number;
  completed: number;
  cancelled: number;
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
