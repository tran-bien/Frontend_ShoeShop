import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  LogOut,
  RefreshCw,
  X,
  AlertTriangle,
  Loader2,
  Globe,
  Clock,
  Shield,
} from "lucide-react";
import { toast } from "react-hot-toast";
import authService from "../../services/AuthService";
import { SessionInfo } from "../../types/auth";
import { useAuth } from "../../hooks/useAuth";

interface UserSessionsProps {
  visible: boolean;
  onClose: () => void;
}

const UserSessions: React.FC<UserSessionsProps> = ({ visible, onClose }) => {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "single" | "others" | "all";
    sessionId?: string;
  } | null>(null);
  const { logout } = useAuth();

  useEffect(() => {
    if (visible) {
      fetchSessions();
    }
  }, [visible]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await authService.getSessions();
      console.log("Sessions response:", response.data);
      if (response.data.success) {
        setSessions(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Không thể tải danh sách phiên đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent?.toLowerCase() || "";
    if (
      ua.includes("mobile") ||
      ua.includes("android") ||
      ua.includes("iphone")
    ) {
      return <Smartphone className="w-5 h-5 text-green-600" />;
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
      return <Tablet className="w-5 h-5 text-blue-600" />;
    } else if (
      ua.includes("mac") ||
      ua.includes("windows") ||
      ua.includes("linux")
    ) {
      return <Laptop className="w-5 h-5 text-purple-600" />;
    }
    return <Monitor className="w-5 h-5 text-gray-600" />;
  };

  const getBrowserInfo = (userAgent: string) => {
    const ua = userAgent?.toLowerCase() || "";
    let browser = "Unknown";

    if (ua.includes("chrome") && !ua.includes("edge")) browser = "Chrome";
    else if (ua.includes("firefox")) browser = "Firefox";
    else if (ua.includes("safari") && !ua.includes("chrome"))
      browser = "Safari";
    else if (ua.includes("edge")) browser = "Edge";
    else if (ua.includes("opera")) browser = "Opera";

    return browser;
  };

  const getOSInfo = (userAgent: string) => {
    const ua = userAgent?.toLowerCase() || "";

    if (ua.includes("windows")) return "Windows";
    if (ua.includes("mac")) return "macOS";
    if (ua.includes("linux")) return "Linux";
    if (ua.includes("android")) return "Android";
    if (ua.includes("iphone") || ua.includes("ipad")) return "iOS";

    return "Unknown";
  };

  const handleLogoutSession = async (sessionId: string) => {
    try {
      setActionLoading(sessionId);
      await authService.logoutSession(sessionId);
      toast.success("Đã đăng xuất phiên thành công");
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      setConfirmAction(null);
    } catch {
      toast.error("Không thể đăng xuất phiên này");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogoutAllOthers = async () => {
    try {
      setActionLoading("others");
      await authService.logoutAllOtherSessions();
      toast.success("Đã đăng xuất tất cả phiên khác");
      fetchSessions();
      setConfirmAction(null);
    } catch {
      toast.error("Không thể đăng xuất các phiên khác");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogoutAll = async () => {
    try {
      setActionLoading("all");
      await authService.logoutAll();
      toast.success("Đã đăng xuất tất cả phiên");
      logout();
      onClose();
    } catch {
      toast.error("Không thể đăng xuất tất cả phiên");
    } finally {
      setActionLoading(null);
    }
  };

  const formatLastActive = (dateString: string | Date) => {
    if (!dateString) return "Không xác định";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "Vừa xong";
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Quản lý phiên đăng nhập
                    </h2>
                    <p className="text-sm text-gray-500">
                      {sessions.length} phiên đang hoạt động
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    <p className="mt-4 text-gray-500">
                      Đang tải phiên đăng nhập...
                    </p>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Monitor className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">
                      Không có phiên đăng nhập nào
                    </p>
                    <p className="text-sm">
                      Có thể do lỗi kết nối hoặc phiên đã hết hạn
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session, index) => (
                      <motion.div
                        key={session._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`border rounded-xl p-4 transition-all ${
                          session.isActive
                            ? "border-green-200 bg-green-50/50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          {/* Device Info */}
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              {getDeviceIcon(session.userAgent)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-medium text-gray-900">
                                  {getBrowserInfo(session.userAgent)} trên{" "}
                                  {getOSInfo(session.userAgent)}
                                </h4>
                                {session.isActive && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    Phiên hiện tại
                                  </span>
                                )}
                              </div>

                              <div className="mt-2 space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Globe className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">
                                    IP: {session.ip || "Không xác định"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Clock className="w-4 h-4 flex-shrink-0" />
                                  <span>
                                    Hoạt động:{" "}
                                    {formatLastActive(session.lastActive)}
                                  </span>
                                </div>
                                {session.device && (
                                  <div className="text-xs text-gray-400">
                                    {typeof session.device.os === "string"
                                      ? session.device.os
                                      : session.device.os?.name || ""}{" "}
                                    -{" "}
                                    {typeof session.device.browser === "string"
                                      ? session.device.browser
                                      : session.device.browser?.name || ""}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          {!session.isActive && (
                            <button
                              onClick={() =>
                                setConfirmAction({
                                  type: "single",
                                  sessionId: session._id,
                                })
                              }
                              disabled={actionLoading === session._id}
                              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {actionLoading === session._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <LogOut className="w-4 h-4" />
                              )}
                              <span className="hidden sm:inline">
                                Đăng xuất
                              </span>
                            </button>
                          )}
                        </div>

                        {/* Expiry Info */}
                        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                          Hết hạn:{" "}
                          {session.expiresAt
                            ? new Date(session.expiresAt).toLocaleString(
                                "vi-VN"
                              )
                            : "Không xác định"}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={fetchSessions}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Làm mới
                </button>
                <div className="flex items-center gap-2">
                  {sessions.length > 1 && (
                    <button
                      onClick={() => setConfirmAction({ type: "others" })}
                      disabled={actionLoading === "others"}
                      className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === "others" && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      Đăng xuất phiên khác
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmAction({ type: "all" })}
                    disabled={actionLoading === "all"}
                    className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === "all" && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    Đăng xuất tất cả
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Confirmation Dialog */}
          <AnimatePresence>
            {confirmAction && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center z-[60] p-4"
              >
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setConfirmAction(null)}
                />
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  className="relative bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {confirmAction.type === "single"
                        ? "Đăng xuất phiên này?"
                        : confirmAction.type === "others"
                        ? "Đăng xuất tất cả phiên khác?"
                        : "Đăng xuất tất cả phiên?"}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    {confirmAction.type === "single"
                      ? "Phiên này sẽ bị đăng xuất ngay lập tức."
                      : confirmAction.type === "others"
                      ? "Tất cả các phiên khác sẽ bị đăng xuất. Bạn sẽ giữ lại phiên hiện tại."
                      : "Bạn sẽ bị đăng xuất khỏi tất cả thiết bị, bao gồm cả phiên hiện tại."}
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setConfirmAction(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirmAction.type === "single" &&
                          confirmAction.sessionId
                        ) {
                          handleLogoutSession(confirmAction.sessionId);
                        } else if (confirmAction.type === "others") {
                          handleLogoutAllOthers();
                        } else {
                          handleLogoutAll();
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Xác nhận
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default UserSessions;
