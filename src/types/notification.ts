/**
 * Notification Types
 * Định nghĩa các interface liên quan đến Thông báo
 */

// =======================
// NOTIFICATION TYPES
// =======================

export type NotificationType =
  | "order"
  | "loyalty"
  | "promotion"
  | "system"
  | "return"
  | "review";

export type NotificationPriority = "low" | "medium" | "high";

export interface Notification {
  _id: string;
  user: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    orderId?: string;
    orderCode?: string;
    productId?: string;
    couponCode?: string;
    points?: number;
    returnRequestId?: string;
    [key: string]: unknown;
  };
  isRead: boolean;
  priority: NotificationPriority;
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
}

// =======================
// NOTIFICATION QUERY PARAMS
// =======================

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  type?: NotificationType;
  isRead?: boolean;
  priority?: NotificationPriority;
}

// =======================
// NOTIFICATION PREFERENCES
// =======================

export interface NotificationPreferences {
  email: {
    orderUpdates: boolean;
    promotions: boolean;
    loyaltyUpdates: boolean;
    newsletter: boolean;
  };
  push: {
    orderUpdates: boolean;
    promotions: boolean;
    loyaltyUpdates: boolean;
  };
  inApp: {
    orderUpdates: boolean;
    promotions: boolean;
    loyaltyUpdates: boolean;
    systemMessages: boolean;
  };
}

// =======================
// NOTIFICATION RESPONSES
// =======================

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: {
    notifications: Notification[];
    unreadCount: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface NotificationDetailResponse {
  success: boolean;
  message: string;
  data: Notification;
}

export interface MarkAsReadResponse {
  success: boolean;
  message: string;
  data: {
    notification?: Notification;
    unreadCount: number;
  };
}

export interface NotificationPreferencesResponse {
  success: boolean;
  message: string;
  data: NotificationPreferences;
}
