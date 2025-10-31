import { axiosInstanceAuth } from "../utils/axiosIntance";
import type {
  ShipperInfo,
  AssignOrderData,
  UpdateDeliveryStatusData,
  UpdateLocationData,
  ShipperStatsResponse,
} from "../types/shipper";
import { ApiResponse } from "../types/api";

// Admin Shipper Service
export const adminShipperService = {
  // Lấy danh sách shipper
  getShippers: (params?: {
    available?: boolean;
  }): Promise<{ data: ApiResponse<ShipperInfo[]> }> =>
    axiosInstanceAuth.get("/api/v1/shipper/list", { params }),

  // Phân công đơn hàng cho shipper
  assignOrderToShipper: (
    orderId: string,
    data: AssignOrderData
  ): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.post(`/api/v1/shipper/assign/${orderId}`, data),

  // Lấy thống kê của shipper
  getShipperStats: (
    shipperId: string
  ): Promise<{ data: ShipperStatsResponse }> =>
    axiosInstanceAuth.get(`/api/v1/shipper/stats/${shipperId}`),

  // Lấy chi tiết shipper
  getShipperDetail: (
    shipperId: string
  ): Promise<{ data: ApiResponse<ShipperInfo> }> =>
    axiosInstanceAuth.get(`/api/v1/shipper/detail/${shipperId}`),
};

// Shipper Service (for shipper role)
export const shipperService = {
  // Lấy danh sách đơn hàng của shipper
  getMyOrders: (params?: { status?: string }): Promise<{ data: ApiResponse }> =>
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
