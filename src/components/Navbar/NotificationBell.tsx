import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BellIcon } from "@heroicons/react/24/outline";
import { userNotificationService } from "../../services/NotificationService";
import type { Notification } from "../../types/notification";

export const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const { data } = await userNotificationService.getUnreadCount();
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  // Mark as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await userNotificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchUnreadCount();

    // Poll every 60 seconds
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const loadNotifications = async () => {
        setLoading(true);
        try {
          const { data } = await userNotificationService.getNotifications({
            limit: 5,
          });
          setNotifications(data.data.notifications);
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
          setNotifications([]);
        } finally {
          setLoading(false);
        }
      };
      loadNotifications();
    } else {
      // Reset khi đóng dropdown
      setNotifications([]);
      setLoading(false);
    }
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-mono-700 hover:text-mono-black hover:bg-mono-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-mono-black rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-96 bg-white border border-mono-200 rounded-xl shadow-luxury z-20 animate-slide-down">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-mono-200">
              <h3 className="text-lg font-semibold text-mono-black">
                Thông báo
              </h3>
              <Link
                to="/notifications"
                className="text-sm text-mono-600 hover:text-mono-black hover:underline"
                onClick={() => setIsOpen(false)}
              >
                Xem tất cả
              </Link>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-mono-300 border-t-mono-black rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BellIcon className="w-12 h-12 text-mono-300 mb-3" />
                  <p className="text-sm text-mono-500">
                    Không có thông báo mới
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-mono-100">
                  {notifications.map((notification) => (
                    <button
                      key={notification._id}
                      onClick={() => {
                        if (!notification.isRead) {
                          handleMarkAsRead(notification._id);
                        }
                        if (notification.actionUrl) {
                          window.location.href = notification.actionUrl;
                        }
                        setIsOpen(false);
                      }}
                      className={`w-full px-6 py-4 text-left hover:bg-mono-50 transition-colors ${
                        !notification.isRead ? "bg-mono-50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Indicator */}
                        {!notification.isRead && (
                          <div className="w-2 h-2 mt-2 bg-mono-black rounded-full flex-shrink-0" />
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-mono-black mb-1">
                            {notification.title}
                          </p>
                          <p className="text-xs text-mono-600 line-clamp-2 mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-mono-400">
                            {new Date(notification.createdAt).toLocaleString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-6 py-3 border-t border-mono-200">
                <button
                  onClick={async () => {
                    try {
                      await userNotificationService.markAllAsRead();
                      setNotifications((prev) =>
                        prev.map((n) => ({ ...n, isRead: true }))
                      );
                      setUnreadCount(0);
                    } catch (error) {
                      console.error("Failed to mark all as read:", error);
                    }
                  }}
                  className="text-sm text-mono-600 hover:text-mono-black hover:underline"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
