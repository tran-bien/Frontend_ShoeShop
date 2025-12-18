import { axiosInstanceAuth } from "../utils/axiosIntance";
import type {
  ShipperInfo,
  AssignOrderData,
  UpdateDeliveryStatusData,
  // UpdateLocationData, // Removed: BE không hỗ trợ theo dõi vị trí shipper
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

  // NOTE: updateLocation đã bị xóa vì BE không hỗ trợ theo dõi vị trí shipper real-time
  // Vị trí shipper được ghi chú thủ công trong hệ thống

  // Cập nhật trạng thái sẵn sàng nhận đơn
  updateAvailability: (isAvailable: boolean): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.patch("/api/v1/shipper/availability", { isAvailable }),

  // Cập nhật thông tin cá nhân shipper (phone, name)
  updateProfile: (data: {
    phone?: string;
    name?: string;
  }): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.put("/api/v1/users/profile", data),
};

export default {
  admin: adminShipperService,
  shipper: shipperService,
};
