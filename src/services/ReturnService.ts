import { axiosInstanceAuth } from "../utils/axiosIntance";
import type {
  ReturnRequest,
  CreateReturnRequestData,
  ReturnRequestQueryParams,
} from "../types/return";
import { ApiResponse } from "../types/api";

// Define response types
interface GetReturnRequestsResponse {
  items: ReturnRequest[];
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
  completedRequests: number;
  rejectedRequests: number;
  returnRequests?: number;
  exchangeRequests?: number;
}

// Customer Return Service
export const customerReturnService = {
  // Tạo yêu cầu đổi/trả hàng
  createReturnRequest: (
    data: CreateReturnRequestData
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.post("/api/v1/returns", data),

  // Lấy danh sách yêu cầu đổi/trả hàng
  getReturnRequests: (
    params?: ReturnRequestQueryParams
  ): Promise<{ data: ApiResponse<GetReturnRequestsResponse> }> =>
    axiosInstanceAuth.get("/api/v1/returns", { params }),

  // Lấy chi tiết yêu cầu đổi/trả hàng
  getReturnRequestDetail: (
    id: string
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.get(`/api/v1/returns/${id}`),

  // Hủy yêu cầu đổi/trả hàng
  cancelReturnRequest: (id: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/returns/${id}`),
};

// Admin Return Service
export const adminReturnService = {
  // Lấy danh sách tất cả yêu cầu đổi/trả hàng (Admin)
  getAllReturnRequests: (
    params?: ReturnRequestQueryParams
  ): Promise<{ data: ApiResponse<GetReturnRequestsResponse> }> =>
    axiosInstanceAuth.get("/api/v1/returns", { params }),

  // Lấy thống kê đổi trả (Admin)
  getReturnStats: (): Promise<{ data: ApiResponse<ReturnStatsResponse> }> =>
    axiosInstanceAuth.get("/api/v1/returns/stats/summary"),

  // Phê duyệt yêu cầu đổi/trả hàng
  approveReturnRequest: (
    id: string,
    data?: { note?: string }
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.patch(`/api/v1/returns/${id}/approve`, data),

  // Từ chối yêu cầu đổi/trả hàng
  rejectReturnRequest: (
    id: string,
    data: { reason: string }
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.patch(`/api/v1/returns/${id}/reject`, data),

  // Xử lý trả hàng
  processReturn: (
    id: string,
    data?: { note?: string }
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.post(`/api/v1/returns/${id}/process-return`, data),

  // Xử lý đổi hàng
  processExchange: (
    id: string,
    data?: { note?: string }
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.post(`/api/v1/returns/${id}/process-exchange`, data),

  // Hoàn thành xử lý
  completeReturn: (
    id: string,
    data?: { note?: string }
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.patch(`/api/v1/returns/${id}/complete`, data),
};

// Backward compatibility - Combined legacy API
export const returnService = {
  // Customer methods
  createReturnRequest: customerReturnService.createReturnRequest,
  getReturnRequests: customerReturnService.getReturnRequests,
  getReturnRequestDetail: customerReturnService.getReturnRequestDetail,
  cancelReturnRequest: customerReturnService.cancelReturnRequest,

  // Admin methods
  getReturnStats: adminReturnService.getReturnStats,
  approveReturnRequest: adminReturnService.approveReturnRequest,
  rejectReturnRequest: adminReturnService.rejectReturnRequest,
  processReturn: adminReturnService.processReturn,
  processExchange: adminReturnService.processExchange,
  completeReturn: adminReturnService.completeReturn,
};

export default returnService;
