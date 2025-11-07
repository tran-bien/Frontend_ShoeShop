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
    axiosInstanceAuth.get("/api/v1/users/notifications", { params }),

  // Lấy chi tiết thông báo
  getNotificationById: (
    notificationId: string
  ): Promise<{ data: NotificationDetailResponse }> =>
    axiosInstanceAuth.get(`/api/v1/users/notifications/${notificationId}`),

  // Đánh dấu thông báo đã đọc
  markAsRead: (notificationId: string): Promise<{ data: MarkAsReadResponse }> =>
    axiosInstanceAuth.patch(
      `/api/v1/users/notifications/${notificationId}/read`
    ),

  // Đánh dấu tất cả thông báo đã đọc
  markAllAsRead: (): Promise<{ data: MarkAsReadResponse }> =>
    axiosInstanceAuth.patch("/api/v1/users/notifications/read-all"),

  // Xóa thông báo
  deleteNotification: (
    notificationId: string
  ): Promise<{ data: { success: boolean; message: string } }> =>
    axiosInstanceAuth.delete(`/api/v1/users/notifications/${notificationId}`),

  // Lấy số lượng thông báo chưa đọc
  // Note: Backend doesn't have a separate endpoint for this.
  // Use getNotifications with limit=1 and check the unreadCount in response
  getUnreadCount: async (): Promise<{
    data: { success: boolean; unreadCount: number };
  }> => {
    const response = await axiosInstanceAuth.get(
      "/api/v1/users/notifications",
      {
        params: { limit: 1 },
      }
    );
    return {
      data: {
        success: response.data.success,
        unreadCount: response.data.unreadCount || 0,
      },
    };
  },

  // Lấy cài đặt thông báo
  getPreferences: (): Promise<{ data: NotificationPreferencesResponse }> =>
    axiosInstanceAuth.get("/api/v1/users/profile/preferences/notifications"),

  // Cập nhật cài đặt thông báo
  updatePreferences: (
    preferences: NotificationPreferences
  ): Promise<{ data: NotificationPreferencesResponse }> =>
    axiosInstanceAuth.put(
      "/api/v1/users/profile/preferences/notifications",
      preferences
    ),
};

// =======================
// Backward compatibility
// =======================

export const notificationApi = {
  ...userNotificationService,
};

export default userNotificationService;
