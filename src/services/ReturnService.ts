import { axiosInstanceAuth } from "../utils/axiosIntance";
import type {
  ReturnRequest,
  CreateReturnRequestData,
  ReturnRequestQueryParams,
} from "../types/return";
import { ApiResponse } from "../types/api";

// Customer Return Service
export const customerReturnService = {
  // Tạo yêu cầu đổi/trả hàng
  createReturnRequest: (
    data: CreateReturnRequestData
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.post("/api/v1/users/returns", data),

  // Lấy danh sách yêu cầu đổi/trả hàng
  getReturnRequests: (
    params?: ReturnRequestQueryParams
  ): Promise<{ data: ApiResponse<ReturnRequest[]> }> =>
    axiosInstanceAuth.get("/api/v1/users/returns", { params }),

  // Lấy chi tiết yêu cầu đổi/trả hàng
  getReturnRequestDetail: (
    id: string
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.get(`/api/v1/users/returns/${id}`),

  // Hủy yêu cầu đổi/trả hàng
  cancelReturnRequest: (id: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/users/returns/${id}`),
};

// Admin Return Service
export const adminReturnService = {
  // Lấy danh sách tất cả yêu cầu đổi/trả hàng (Admin)
  getAllReturnRequests: (
    params?: ReturnRequestQueryParams
  ): Promise<{ data: ApiResponse<ReturnRequest[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/returns", { params }),

  // Phê duyệt yêu cầu đổi/trả hàng
  approveReturnRequest: (
    id: string,
    data?: { note?: string }
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/returns/${id}/approve`, data),

  // Từ chối yêu cầu đổi/trả hàng
  rejectReturnRequest: (
    id: string,
    data: { reason: string }
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/returns/${id}/reject`, data),

  // Xử lý trả hàng
  processReturn: (
    id: string,
    data?: { note?: string }
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.post(`/api/v1/admin/returns/${id}/process-return`, data),

  // Xử lý đổi hàng
  processExchange: (
    id: string,
    data?: { note?: string }
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.post(
      `/api/v1/admin/returns/${id}/process-exchange`,
      data
    ),

  // Hoàn thành xử lý
  completeReturn: (
    id: string,
    data?: { note?: string }
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/returns/${id}/complete`, data),
};

// Backward compatibility - Combined legacy API
export const returnService = {
  // Customer methods
  createReturnRequest: customerReturnService.createReturnRequest,
  getReturnRequests: customerReturnService.getReturnRequests,
  getReturnRequestDetail: customerReturnService.getReturnRequestDetail,
  cancelReturnRequest: customerReturnService.cancelReturnRequest,

  // Admin methods
  approveReturnRequest: adminReturnService.approveReturnRequest,
  rejectReturnRequest: adminReturnService.rejectReturnRequest,
  processReturn: adminReturnService.processReturn,
  processExchange: adminReturnService.processExchange,
  completeReturn: adminReturnService.completeReturn,
};

export default returnService;
