/**
 * Shipper Types
 * Äá»‹nh nghÄ©a cÃ¡c interface liÃªn quan Ä‘áº¿n Shipper (ngÆ°á»i giao hÃ ng)
 */

// =======================
// SHIPPER LOCATION TYPES
// =======================

export interface ShipperLocation {
  latitude: number;
  longitude: number;
  address?: string;
  updatedAt?: string;
}

// =======================
// SHIPPER STATS TYPES
// =======================

export interface ShipperDeliveryStats {
  total: number; // Backend field name
  successful: number; // Backend field name
  failed: number; // Backend field name
  // Legacy support
  totalDeliveries?: number;
  successfulDeliveries?: number;
  failedDeliveries?: number;
  successRate?: number;
}

export interface ShipperInfo {
  isAvailable: boolean;
  activeOrders: number;
  maxOrders: number;
  currentLocation?: ShipperLocation;
  deliveryStats: ShipperDeliveryStats;
}

// =======================
// MAIN SHIPPER INTERFACE
// =======================

export interface Shipper {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  shipper: ShipperInfo;
  createdAt?: string;
  updatedAt?: string;
}

// =======================
// DELIVERY ATTEMPT TYPES
// =======================

export type DeliveryAttemptStatus =
  | "out_for_delivery"
  | "delivery_failed"
  | "delivered";

export interface DeliveryAttempt {
  attemptNumber: number;
  timestamp: string;
  status: DeliveryAttemptStatus;
  location?: ShipperLocation;
  images?: string[];
  note?: string;
}

// =======================
// SHIPPER REQUEST TYPES
// =======================

export interface AssignOrderData {
  shipperId: string;
}

export interface UpdateDeliveryStatusData {
  status: DeliveryAttemptStatus;
  note?: string;
  images?: string[];
  location?: ShipperLocation;
}

export interface UpdateLocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface UpdateAvailabilityData {
  isAvailable: boolean;
}

// =======================
// SHIPPER QUERY PARAMS
// =======================

export interface ShipperQueryParams {
  available?: boolean;
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

// =======================
// SHIPPER RESPONSE TYPES
// =======================

export interface ShippersResponse {
  success: boolean;
  message?: string;
  shippers: Shipper[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ShipperDetailResponse {
  success: boolean;
  message?: string;
  shipper: Shipper;
}

export interface ShipperStatsResponse {
  success: boolean;
  message?: string;
  stats: ShipperDeliveryStats & {
    activeOrders: number;
    completedToday: number;
    completedThisWeek: number;
    completedThisMonth: number;
  };
}
