/**
 * Shipper Types
 * Định nghĩa các interface liên quan đến Shipper (người giao hàng)
 * SYNCED WITH BE: Backend_ShoeShop_KLTN/src/models/user/schema.js
 */

// =======================
// SHIPPER STATS TYPES
// =======================

/**
 * Thống kê giao hàng của shipper
 * Matches BE: User.shipper.deliveryStats
 */
export interface ShipperDeliveryStats {
  total: number; // Tổng số đơn đã giao
  successful: number; // Số đơn giao thành công
  failed: number; // Số đơn giao thất bại
}

/**
 * Thông tin shipper (nested trong User)
 * Matches BE: User.shipper
 */
export interface ShipperInfo {
  isAvailable: boolean; // Trạng thái sẵn sàng nhận đơn
  activeOrders: number; // Số đơn đang giao
  maxOrders: number; // Số đơn tối đa có thể nhận (default: 20)
  deliveryStats: ShipperDeliveryStats;
}

// =======================
// MAIN SHIPPER INTERFACE
// =======================

/**
 * Shipper = User with role "shipper"
 * Matches BE: User model with select("name email phone shipper avatar createdAt")
 */
export interface Shipper {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: {
    url?: string;
    public_id?: string;
  };
  shipper: ShipperInfo;
  createdAt?: string;
  updatedAt?: string;
}

// =======================
// DELIVERY ATTEMPT TYPES
// =======================

/**
 * Trạng thái delivery attempt
 * Matches BE: Order.deliveryAttempts[].status
 */
export type DeliveryAttemptStatus =
  | "out_for_delivery"
  | "success"
  | "failed"
  | "delivery_failed"
  | "delivered";

/**
 * Lần giao hàng
 * Matches BE: Order.deliveryAttempts[]
 */
export interface DeliveryAttempt {
  time: string; // Thời điểm giao
  status: DeliveryAttemptStatus;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  images?: string[];
  note?: string;
  shipper?: string; // Shipper ID
}

// =======================
// SHIPPER REQUEST TYPES
// =======================

export interface AssignOrderData {
  shipperId: string;
}

export interface UpdateDeliveryStatusData {
  status: "out_for_delivery" | "delivered" | "delivery_failed";
  note?: string;
  images?: string[];
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
}

export interface UpdateAvailabilityData {
  isAvailable: boolean;
}

// =======================
// SHIPPER QUERY PARAMS
// =======================

export interface ShipperQueryParams {
  available?: boolean | string; // Filter by availability ("true"/"false")
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// =======================
// SHIPPER RESPONSE TYPES
// =======================

export interface ShippersResponse {
  success: boolean;
  message?: string;
  data: {
    shippers: Shipper[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ShipperDetailResponse {
  success: boolean;
  message?: string;
  data: Shipper;
}

/**
 * Thống kê shipper
 * Matches BE: shipperService.getShipperStats()
 */
export interface ShipperStatsResponse {
  success: boolean;
  message?: string;
  data: {
    shipper: {
      name: string;
      email: string;
      phone: string;
      isAvailable: boolean;
      maxOrders: number;
    };
    stats: {
      totalOrders: number;
      completedOrders: number;
      failedOrders: number;
      activeOrders: number;
      successRate: string | number;
    };
  };
}
