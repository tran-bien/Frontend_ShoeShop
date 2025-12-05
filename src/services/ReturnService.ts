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

// Define eligibility check response type
interface CheckEligibilityResponse {
  eligible: boolean;
  reason?: string;
  daysRemaining?: number;
  maxQuantity?: number;
}

// Customer Return Service
export const customerReturnService = {
  // Kiểm tra sản phẩm có thể đổi/trả không
  checkEligibility: (params: {
    orderId: string;
    variantId: string;
    sizeId: string;
  }): Promise<{ data: ApiResponse<CheckEligibilityResponse> }> =>
    axiosInstanceAuth.get("/api/v1/users/returns/check-eligibility", {
      params,
    }),

  // Tạo yêu cầu đổi/trả hàng
  createReturnRequest: (
    data: CreateReturnRequestData
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.post("/api/v1/users/returns", data),

  // Lấy danh sách yêu cầu đổi/trả hàng
  getReturnRequests: (
    params?: ReturnRequestQueryParams
  ): Promise<{ data: ApiResponse<GetReturnRequestsResponse> }> =>
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
  ): Promise<{ data: ApiResponse<GetReturnRequestsResponse> }> =>
    axiosInstanceAuth.get("/api/v1/admin/returns", { params }),

  // Lấy chi tiết yêu cầu đổi/trả hàng (Admin)
  getReturnRequestById: (
    id: string
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.get(`/api/v1/admin/returns/${id}`),

  // Lấy thống kê đổi trả (Admin)
  getReturnStats: (): Promise<{ data: ApiResponse<ReturnStatsResponse> }> =>
    axiosInstanceAuth.get("/api/v1/admin/returns/stats/summary"),

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

  // REMOVED: completeReturn endpoint không tồn tại ở backend
  // Backend tự động chuyển sang 'completed' sau khi processReturn hoặc processExchange thành công
  // Nếu cần endpoint này, phải thêm vào backend trước
};

export default {
  customer: customerReturnService,
  admin: adminReturnService,
};
