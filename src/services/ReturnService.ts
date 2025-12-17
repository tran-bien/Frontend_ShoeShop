import { axiosInstanceAuth } from "../utils/axiosIntance";
import type {
  ReturnRequest,
  CreateReturnRequestData,
  ReturnRequestQueryParams,
} from "../types/return";
import { ApiResponse } from "../types/api";

/**
 * Return Service
 * Quản lý yêu cầu trả hàng/hoàn tiền
 * (Đã loại bỏ logic đổi hàng - chỉ có trả hàng/hoàn tiền toàn bộ đơn)
 */

// Define response types
interface GetReturnRequestsResponse {
  requests: ReturnRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ReturnStatsResponse {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests?: number;
  shippingRequests?: number;
  receivedRequests?: number;
  refundedRequests?: number;
  completedRequests: number;
  rejectedRequests: number;
}

// Customer Return Service
export const customerReturnService = {
  // Tạo yêu cầu trả hàng/hoàn tiền
  createReturnRequest: (
    data: CreateReturnRequestData
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.post("/api/v1/users/returns", data),

  // Lấy danh sách yêu cầu trả hàng
  getReturnRequests: (
    params?: ReturnRequestQueryParams
  ): Promise<{ data: ApiResponse<GetReturnRequestsResponse> }> =>
    axiosInstanceAuth.get("/api/v1/users/returns", { params }),

  // Lấy chi tiết yêu cầu trả hàng
  getReturnRequestDetail: (
    id: string
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.get(`/api/v1/users/returns/${id}`),

  // Yêu cầu hủy trả hàng (đổi ý) - chờ admin duyệt
  cancelReturnRequest: (
    id: string,
    data?: { reason?: string }
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.patch(`/api/v1/users/returns/${id}/cancel`, data),
};

// Admin Return Service
export const adminReturnService = {
  // Lấy danh sách tất cả yêu cầu trả hàng (Admin)
  getAllReturnRequests: (
    params?: ReturnRequestQueryParams
  ): Promise<{ data: ApiResponse<GetReturnRequestsResponse> }> =>
    axiosInstanceAuth.get("/api/v1/admin/returns", { params }),

  // Lấy chi tiết yêu cầu trả hàng (Admin)
  getReturnRequestById: (
    id: string
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.get(`/api/v1/admin/returns/${id}`),

  // Lấy thống kê trả hàng (Admin)
  getReturnStats: (): Promise<{ data: ApiResponse<ReturnStatsResponse> }> =>
    axiosInstanceAuth.get("/api/v1/admin/returns/stats/summary"),

  // Phê duyệt yêu cầu trả hàng
  approveReturnRequest: (
    id: string,
    data?: { note?: string }
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/returns/${id}/approve`, data),

  // Từ chối yêu cầu trả hàng
  rejectReturnRequest: (
    id: string,
    data: { reason: string }
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/returns/${id}/reject`, data),

  // Phân công shipper lấy hàng trả
  assignShipperForReturn: (
    id: string,
    data: { shipperId: string }
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/returns/${id}/assign-shipper`, data),

  // Xác nhận đã chuyển khoản hoàn tiền (bank_transfer)
  confirmBankTransfer: (
    id: string,
    data?: { note?: string }
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.patch(
      `/api/v1/admin/returns/${id}/confirm-transfer`,
      data
    ),

  // Duyệt/từ chối yêu cầu hủy trả hàng từ khách
  approveCancelReturn: (
    id: string,
    data: { approved: boolean; note?: string }
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/returns/${id}/approve-cancel`, data),
};

// Shipper Return Service
export const shipperReturnService = {
  // Lấy danh sách yêu cầu trả hàng được giao
  getShipperReturns: (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ data: ApiResponse<GetReturnRequestsResponse> }> =>
    axiosInstanceAuth.get("/api/v1/shipper/returns", { params }),

  // Lấy chi tiết yêu cầu trả hàng
  getReturnDetail: (
    id: string
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.get(`/api/v1/shipper/returns/${id}`),

  // Xác nhận đã nhận hàng trả từ khách
  confirmReceived: (
    id: string,
    data?: { note?: string }
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.patch(
      `/api/v1/shipper/returns/${id}/confirm-received`,
      data
    ),

  // Xác nhận đã giao tiền hoàn cho khách (cash refund)
  confirmRefundDelivered: (
    id: string,
    data?: { note?: string }
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.patch(
      `/api/v1/shipper/returns/${id}/confirm-refund-delivered`,
      data
    ),
};

export default {
  customer: customerReturnService,
  admin: adminReturnService,
  shipper: shipperReturnService,
};
