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
  // Lấy danh sách shipper
  getShippers: (params?: {
    available?: boolean;
  }): Promise<{ data: ApiResponse<GetShippersResponse> }> =>
    axiosInstanceAuth.get("/api/v1/admin/shippers", { params }),

  // Phân công đơn hàng cho shipper
  assignOrderToShipper: (
    orderId: string,
    data: AssignOrderData
  ): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.post(`/api/v1/admin/shippers/assign/${orderId}`, data),

  // Lấy thống kê của shipper
  getShipperStats: (
    shipperId: string
  ): Promise<{ data: ShipperStatsResponse }> =>
    axiosInstanceAuth.get(`/api/v1/admin/shippers/${shipperId}/stats`),

  // Lấy chi tiết shipper
  getShipperDetail: (
    shipperId: string
  ): Promise<{ data: ApiResponse<ShipperInfo> }> =>
    axiosInstanceAuth.get(`/api/v1/admin/shippers/${shipperId}`),
};

// Shipper Service (for shipper role)
export const shipperService = {
  // Lấy danh sách đơn hàng của shipper
  getMyOrders: (params?: {
    status?: string;
  }): Promise<{ data: ApiResponse<Order[]> }> =>
    axiosInstanceAuth.get("/api/v1/shipper/my-orders", { params }),

  // Cập nhật trạng thái giao hàng
  updateDeliveryStatus: (
    orderId: string,
    data: UpdateDeliveryStatusData
  ): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.patch(`/api/v1/shipper/delivery-status/${orderId}`, data),

  // Cập nhật vị trí
  updateLocation: (data: UpdateLocationData): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.patch("/api/v1/shipper/location", data),

  // Cập nhật trạng thái sẵn sàng
  updateAvailability: (isAvailable: boolean): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.patch("/api/v1/shipper/availability", { isAvailable }),
};

// Backward compatibility - Combined legacy API
const shipperServiceLegacy = {
  // Admin methods
  getShippers: adminShipperService.getShippers,
  assignOrderToShipper: adminShipperService.assignOrderToShipper,
  getShipperStats: adminShipperService.getShipperStats,
  getShipperDetail: adminShipperService.getShipperDetail,

  // Shipper methods
  getMyOrders: shipperService.getMyOrders,
  updateDeliveryStatus: shipperService.updateDeliveryStatus,
  updateLocation: shipperService.updateLocation,
  updateAvailability: shipperService.updateAvailability,
};

export default shipperServiceLegacy;
