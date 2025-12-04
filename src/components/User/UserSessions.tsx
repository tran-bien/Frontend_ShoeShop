import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Card,
  Tag,
  Space,
  Typography,
  message,
  Popconfirm,
} from "antd";
import {
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
  LaptopOutlined,
  DeleteOutlined,
  LogoutOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import authService from "../../services/AuthService";
import { SessionInfo } from "../../types/auth";
import { useAuth } from "../../hooks/useAuth";

const { Text } = Typography;

interface UserSessionsProps {
  visible: boolean;
  onClose: () => void;
}

const UserSessions: React.FC<UserSessionsProps> = ({ visible, onClose }) => {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(false);
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
      if (response.data.success) {
        setSessions(response.data.data);
      }
    } catch (_) {
      message.error("KhÃ´ng thá»ƒ táº£i danh sÃ¡ch phiÃªn Ä‘Äƒng nháº­p");
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (
      ua.includes("mobile") ||
      ua.includes("android") ||
      ua.includes("iphone")
    ) {
      return <MobileOutlined style={{ color: "#52c41a" }} />;
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
      return <TabletOutlined style={{ color: "#1890ff" }} />;
    } else if (
      ua.includes("mac") ||
      ua.includes("windows") ||
      ua.includes("linux")
    ) {
      return <LaptopOutlined style={{ color: "#722ed1" }} />;
    }
    return <DesktopOutlined style={{ color: "#fa541c" }} />;
  };

  const getBrowserInfo = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    let browser = "Unknown";

    if (ua.includes("chrome")) browser = "Chrome";
    else if (ua.includes("firefox")) browser = "Firefox";
    else if (ua.includes("safari") && !ua.includes("chrome"))
      browser = "Safari";
    else if (ua.includes("edge")) browser = "Edge";
    else if (ua.includes("opera")) browser = "Opera";

    return browser;
  };

  const handleLogoutSession = async (sessionId: string) => {
    try {
      await authService.logoutSession(sessionId);
      message.success("Đã đăng xuất phiên thành công");
      fetchSessions();
    } catch (error) {
      message.error("Không thể đăng xuất phiên này");
    }
  };

  const handleLogoutAllOthers = async () => {
    try {
      await authService.logoutAllOtherSessions();
      message.success("Đã đăng xuất tất cả phiên khác");
      fetchSessions();
    } catch (error) {
      message.error("Không thể đăng xuất các phiên khác");
    }
  };

  const handleLogoutAll = async () => {
    try {
      await authService.logoutAll();
      message.success("Đã đăng xuất tất cả phiên");
      logout(); // Đăng xuất user hiện tại
      onClose();
    } catch (_) {
      message.error("Không thể đăng xuất tất cả phiên");
    }
  };

  const formatLastActive = (dateString: string | Date) => {
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

  return (
    <Modal
      title={
        <Space>
          <DesktopOutlined />
          <span>Quản lý phiên đăng nhập</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchSessions}
            loading={loading}
          >
            LÃ m má»›i
          </Button>
          <Popconfirm
            title="Đăng xuất tất cả phiên khác?"
            description="Bạn sẽ được giữ lại phiên hiện tại"
            onConfirm={handleLogoutAllOthers}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button type="primary" icon={<LogoutOutlined />}>
              Đăng xuất phiên khác
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Đăng xuất tất cả phiên?"
            description="Bạn sẽ bị đăng xuất khỏi tất cả thiết bị"
            onConfirm={handleLogoutAll}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />}>
              Đăng xuất tất cả
            </Button>
          </Popconfirm>
          <Button onClick={onClose}>Đóng</Button>
        </Space>
      }
    >
      <div style={{ maxHeight: "500px", overflowY: "auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            Đang tải...
          </div>
        ) : (
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            {sessions.map((session) => (
              <Card
                key={session._id}
                size="small"
                extra={
                  <Popconfirm
                    title="ÄÄƒng xuáº¥t phiÃªn nÃ y?"
                    onConfirm={() => handleLogoutSession(session._id)}
                    okText="Äá»“ng Ã½"
                    cancelText="Há»§y"
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                    >
                      Đăng xuất
                    </Button>
                  </Popconfirm>
                }
              >
                <Space
                  direction="vertical"
                  style={{ width: "100%" }}
                  size="small"
                >
                  <Space>
                    {getDeviceIcon(session.userAgent)}
                    <Text strong>{getBrowserInfo(session.userAgent)}</Text>
                    {session.isActive ? (
                      <Tag color="green">Đang hoạt động</Tag>
                    ) : (
                      <Tag color="red">Không hoạt động</Tag>
                    )}
                  </Space>

                  <Space direction="vertical" size="small">
                    <Text type="secondary">
                      <strong>IP:</strong> {session.ip}
                    </Text>
                    <Text type="secondary">
                      <strong>Hoạt động lần cuối:</strong>{" "}
                      {formatLastActive(session.lastActive)}
                    </Text>
                    <Text type="secondary">
                      <strong>Hết hạn:</strong>{" "}
                      {new Date(session.expiresAt).toLocaleString("vi-VN")}
                    </Text>
                  </Space>

                  {session.device && (
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      <strong>Thiết bị:</strong>{" "}
                      {typeof session.device.os === "string"
                        ? session.device.os
                        : session.device.os?.name || "Unknown"}{" "}
                      -{" "}
                      {typeof session.device.browser === "string"
                        ? session.device.browser
                        : session.device.browser?.name || "Unknown"}
                    </Text>
                  )}
                </Space>
              </Card>
            ))}

            {sessions.length === 0 && (
              <div style={{ textAlign: "center", padding: "50px" }}>
                <Text type="secondary">Không có phiên đăng nhập nào</Text>
              </div>
            )}
          </Space>
        )}
      </div>
    </Modal>
  );
};

export default UserSessions;

