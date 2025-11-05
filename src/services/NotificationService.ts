import { axiosInstanceAuth } from "../utils/axiosIntance";
import type {
  NotificationQueryParams,
  NotificationsResponse,
  NotificationDetailResponse,
  MarkAsReadResponse,
  NotificationPreferences,
  NotificationPreferencesResponse,
} from "../types/notification";

// =======================
// USER NOTIFICATION SERVICE
// =======================

export const userNotificationService = {
  // Lấy danh sách thông báo của user
  getNotifications: (
    params: NotificationQueryParams = {}
  ): Promise<{ data: NotificationsResponse }> =>
    axiosInstanceAuth.get("/api/v1/notifications", { params }),

  // Lấy chi tiết thông báo
  getNotificationById: (
    notificationId: string
  ): Promise<{ data: NotificationDetailResponse }> =>
    axiosInstanceAuth.get(`/api/v1/notifications/${notificationId}`),

  // Đánh dấu thông báo đã đọc
  markAsRead: (notificationId: string): Promise<{ data: MarkAsReadResponse }> =>
    axiosInstanceAuth.patch(`/api/v1/notifications/${notificationId}/read`),

  // Đánh dấu tất cả thông báo đã đọc
  markAllAsRead: (): Promise<{ data: MarkAsReadResponse }> =>
    axiosInstanceAuth.patch("/api/v1/notifications/read-all"),

  // Xóa thông báo
  deleteNotification: (
    notificationId: string
  ): Promise<{ data: { success: boolean; message: string } }> =>
    axiosInstanceAuth.delete(`/api/v1/notifications/${notificationId}`),

  // Lấy số lượng thông báo chưa đọc
  getUnreadCount: (): Promise<{
    data: { success: boolean; unreadCount: number };
  }> => axiosInstanceAuth.get("/api/v1/notifications/unread-count"),

  // Lấy cài đặt thông báo
  getPreferences: (): Promise<{ data: NotificationPreferencesResponse }> =>
    axiosInstanceAuth.get("/api/v1/notifications/preferences"),

  // Cập nhật cài đặt thông báo
  updatePreferences: (
    preferences: NotificationPreferences
  ): Promise<{ data: NotificationPreferencesResponse }> =>
    axiosInstanceAuth.put("/api/v1/notifications/preferences", preferences),
};

// =======================
// Backward compatibility
// =======================

export const notificationApi = {
  ...userNotificationService,
};

export default userNotificationService;
