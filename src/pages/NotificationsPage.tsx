import { useState, useEffect, useCallback } from "react";
import { userNotificationService } from "../services/NotificationService";
import type {
  Notification,
  NotificationQueryParams,
} from "../types/notification";
import { BellIcon, CheckIcon, TrashIcon } from "@heroicons/react/24/outline";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<NotificationQueryParams>({
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userNotificationService.getNotifications(params);
      // BE trả về cấu trúc phẳng: { success, notifications, unreadCount, pagination }
      setNotifications(data.notifications);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await userNotificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await userNotificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  // Delete notification
  const handleDelete = async (notificationId: string) => {
    try {
      await userNotificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  // Filter change
  const handleFilterChange = (filter: "all" | "unread") => {
    setActiveFilter(filter);
    setParams((prev) => ({
      ...prev,
      page: 1,
      isRead: filter === "unread" ? false : undefined,
    }));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-mono-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white border border-mono-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-mono-black">Thông báo</h1>
              <p className="text-sm text-mono-600 mt-1">
                {unreadCount > 0
                  ? `Bạn có ${unreadCount} thông báo chưa đọc`
                  : "Tất cả thông báo đã được đọc"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-mono-700 hover:text-mono-black hover:bg-mono-100 rounded-lg transition-colors"
              >
                <CheckIcon className="w-4 h-4" />
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange("all")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeFilter === "all"
                  ? "bg-mono-black text-white"
                  : "bg-mono-100 text-mono-700 hover:bg-mono-200"
              }`}
            >
              Tất cả ({pagination.total})
            </button>
            <button
              onClick={() => handleFilterChange("unread")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeFilter === "unread"
                  ? "bg-mono-black text-white"
                  : "bg-mono-100 text-mono-700 hover:bg-mono-200"
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="bg-white border border-mono-200 rounded-xl p-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-3 border-mono-200 border-t-mono-black rounded-full animate-spin mb-4" />
              <p className="text-mono-600">Đang tải thông báo...</p>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white border border-mono-200 rounded-xl p-12 text-center">
            <BellIcon className="w-16 h-16 text-mono-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-mono-900 mb-2">
              Không có thông báo
            </h3>
            <p className="text-sm text-mono-600">
              {activeFilter === "unread"
                ? "Bạn không có thông báo chưa đọc"
                : "Chưa có thông báo nào"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white border border-mono-200 rounded-xl p-6 transition-all hover:shadow-medium ${
                  !notification.isRead ? "border-l-4 border-l-mono-black" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div className="w-2 h-2 mt-2 bg-mono-black rounded-full flex-shrink-0" />
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-base font-semibold text-mono-black">
                        {notification.title}
                      </h3>
                      <span className="text-xs text-mono-500 whitespace-nowrap">
                        {new Date(notification.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>

                    <p className="text-sm text-mono-700 mb-3">
                      {notification.message}
                    </p>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="text-sm text-mono-600 hover:text-mono-black hover:underline"
                        >
                          Đánh dấu đã đọc
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="ml-auto text-mono-500 hover:text-mono-black transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() =>
                setParams((prev) => ({ ...prev, page: prev.page! - 1 }))
              }
              disabled={pagination.page <= 1}
              className="px-4 py-2 text-sm font-medium text-mono-700 bg-white border border-mono-200 rounded-lg hover:bg-mono-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Trước
            </button>

            <span className="text-sm text-mono-700 px-4">
              Trang {pagination.page} / {pagination.totalPages}
            </span>

            <button
              onClick={() =>
                setParams((prev) => ({ ...prev, page: prev.page! + 1 }))
              }
              disabled={pagination.page >= pagination.totalPages}
              className="px-4 py-2 text-sm font-medium text-mono-700 bg-white border border-mono-200 rounded-lg hover:bg-mono-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
