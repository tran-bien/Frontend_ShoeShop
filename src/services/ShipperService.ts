import { axiosInstanceAuth } from "../utils/axiosIntance";
import type {
  ShipperInfo,
  AssignOrderData,
  UpdateDeliveryStatusData,
  UpdateLocationData,
  ShipperStatsResponse,
  Shipper,
} from "../types/shipper";
import { ApiResponse } from "../types/api";
import type { Order } from "../types/order";

// Response type for getShippers
interface GetShippersResponse {
  shippers: Shipper[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Admin Shipper Service
export const adminShipperService = {
  // Láº¥y danh sÃ¡ch shipper
  getShippers: (params?: {
    available?: boolean;
  }): Promise<{ data: ApiResponse<GetShippersResponse> }> =>
    axiosInstanceAuth.get("/api/v1/admin/shippers", { params }),

  // PhÃ¢n cÃ´ng Ä‘Æ¡n hÃ ng cho shipper
  assignOrderToShipper: (
    orderId: string,
    data: AssignOrderData
  ): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.post(`/api/v1/admin/shippers/assign/${orderId}`, data),

  // Láº¥y thá»‘ng kÃª cá»§a shipper
  getShipperStats: (
    shipperId: string
  ): Promise<{ data: ShipperStatsResponse }> =>
    axiosInstanceAuth.get(`/api/v1/admin/shippers/${shipperId}/stats`),

  // Láº¥y chi tiáº¿t shipper
  getShipperDetail: (
    shipperId: string
  ): Promise<{ data: ApiResponse<ShipperInfo> }> =>
    axiosInstanceAuth.get(`/api/v1/admin/shippers/${shipperId}`),
};

// Shipper Service (for shipper role)
export const shipperService = {
  // Láº¥y danh sÃ¡ch Ä‘Æ¡n hÃ ng cá»§a shipper
  getMyOrders: (params?: {
    status?: string;
  }): Promise<{ data: ApiResponse<Order[]> }> =>
    axiosInstanceAuth.get("/api/v1/shipper/my-orders", { params }),

  // Cáº­p nháº­t tráº¡ng thÃ¡i giao hÃ ng
  updateDeliveryStatus: (
    orderId: string,
    data: UpdateDeliveryStatusData
  ): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.patch(`/api/v1/shipper/delivery-status/${orderId}`, data),

  // Cáº­p nháº­t vá»‹ trÃ­
  updateLocation: (data: UpdateLocationData): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.patch("/api/v1/shipper/location", data),

  // Cáº­p nháº­t tráº¡ng thÃ¡i sáºµn sÃ ng
  updateAvailability: (isAvailable: boolean): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.patch("/api/v1/shipper/availability", { isAvailable }),
};

export default {
  admin: adminShipperService,
  shipper: shipperService,
};
