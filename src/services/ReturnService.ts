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
  // Kiá»ƒm tra sáº£n pháº©m cÃ³ thá»ƒ Ä‘á»•i/tráº£ khÃ´ng
  checkEligibility: (params: {
    orderId: string;
    variantId: string;
    sizeId: string;
  }): Promise<{ data: ApiResponse<CheckEligibilityResponse> }> =>
    axiosInstanceAuth.get("/api/v1/users/returns/check-eligibility", {
      params,
    }),

  // Táº¡o yÃªu cáº§u Ä‘á»•i/tráº£ hÃ ng
  createReturnRequest: (
    data: CreateReturnRequestData
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.post("/api/v1/users/returns", data),

  // Láº¥y danh sÃ¡ch yÃªu cáº§u Ä‘á»•i/tráº£ hÃ ng
  getReturnRequests: (
    params?: ReturnRequestQueryParams
  ): Promise<{ data: ApiResponse<GetReturnRequestsResponse> }> =>
    axiosInstanceAuth.get("/api/v1/users/returns", { params }),

  // Láº¥y chi tiáº¿t yÃªu cáº§u Ä‘á»•i/tráº£ hÃ ng
  getReturnRequestDetail: (
    id: string
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.get(`/api/v1/users/returns/${id}`),

  // Há»§y yÃªu cáº§u Ä‘á»•i/tráº£ hÃ ng
  cancelReturnRequest: (id: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/users/returns/${id}`),
};

// Admin Return Service
export const adminReturnService = {
  // Láº¥y danh sÃ¡ch táº¥t cáº£ yÃªu cáº§u Ä‘á»•i/tráº£ hÃ ng (Admin)
  getAllReturnRequests: (
    params?: ReturnRequestQueryParams
  ): Promise<{ data: ApiResponse<GetReturnRequestsResponse> }> =>
    axiosInstanceAuth.get("/api/v1/admin/returns", { params }),

  // Láº¥y thá»‘ng kÃª Ä‘á»•i tráº£ (Admin)
  getReturnStats: (): Promise<{ data: ApiResponse<ReturnStatsResponse> }> =>
    axiosInstanceAuth.get("/api/v1/admin/returns/stats/summary"),

  // PhÃª duyá»‡t yÃªu cáº§u Ä‘á»•i/tráº£ hÃ ng
  approveReturnRequest: (
    id: string,
    data?: { note?: string }
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/returns/${id}/approve`, data),

  // Tá»« chá»‘i yÃªu cáº§u Ä‘á»•i/tráº£ hÃ ng
  rejectReturnRequest: (
    id: string,
    data: { reason: string }
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/returns/${id}/reject`, data),

  // Xá»­ lÃ½ tráº£ hÃ ng
  processReturn: (
    id: string,
    data?: { note?: string }
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.post(`/api/v1/admin/returns/${id}/process-return`, data),

  // Xá»­ lÃ½ Ä‘á»•i hÃ ng
  processExchange: (
    id: string,
    data?: { note?: string }
  ): Promise<{ data: ApiResponse<ReturnRequest> }> =>
    axiosInstanceAuth.post(
      `/api/v1/admin/returns/${id}/process-exchange`,
      data
    ),

  // REMOVED: completeReturn endpoint khÃ´ng tá»“n táº¡i á»Ÿ backend
  // Backend tá»± Ä‘á»™ng chuyá»ƒn sang 'completed' sau khi processReturn hoáº·c processExchange thÃ nh cÃ´ng
  // Náº¿u cáº§n endpoint nÃ y, pháº£i thÃªm vÃ o backend trÆ°á»›c
};

export default {
  customer: customerReturnService,
  admin: adminReturnService,
};
