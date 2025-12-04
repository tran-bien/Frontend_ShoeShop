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
      message.success("ÄÃ£ Ä‘Äƒng xuáº¥t phiÃªn thÃ nh cÃ´ng");
      fetchSessions();
    } catch (error) {
      message.error("KhÃ´ng thá»ƒ Ä‘Äƒng xuáº¥t phiÃªn nÃ y");
    }
  };

  const handleLogoutAllOthers = async () => {
    try {
      await authService.logoutAllOtherSessions();
      message.success("ÄÃ£ Ä‘Äƒng xuáº¥t táº¥t cáº£ phiÃªn khÃ¡c");
      fetchSessions();
    } catch (error) {
      message.error("KhÃ´ng thá»ƒ Ä‘Äƒng xuáº¥t cÃ¡c phiÃªn khÃ¡c");
    }
  };

  const handleLogoutAll = async () => {
    try {
      await authService.logoutAll();
      message.success("ÄÃ£ Ä‘Äƒng xuáº¥t táº¥t cáº£ phiÃªn");
      logout(); // ÄÄƒng xuáº¥t user hiá»‡n táº¡i
      onClose();
    } catch (_) {
      message.error("KhÃ´ng thá»ƒ Ä‘Äƒng xuáº¥t táº¥t cáº£ phiÃªn");
    }
  };

  const formatLastActive = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "Vá»«a xong";
    if (diffMinutes < 60) return `${diffMinutes} phÃºt trÆ°á»›c`;
    if (diffHours < 24) return `${diffHours} giá» trÆ°á»›c`;
    return `${diffDays} ngÃ y trÆ°á»›c`;
  };

  return (
    <Modal
      title={
        <Space>
          <DesktopOutlined />
          <span>Quáº£n lÃ½ phiÃªn Ä‘Äƒng nháº­p</span>
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
            title="ÄÄƒng xuáº¥t táº¥t cáº£ phiÃªn khÃ¡c?"
            description="Báº¡n sáº½ Ä‘Æ°á»£c giá»¯ láº¡i phiÃªn hiá»‡n táº¡i"
            onConfirm={handleLogoutAllOthers}
            okText="Äá»“ng Ã½"
            cancelText="Há»§y"
          >
            <Button type="primary" icon={<LogoutOutlined />}>
              ÄÄƒng xuáº¥t phiÃªn khÃ¡c
            </Button>
          </Popconfirm>
          <Popconfirm
            title="ÄÄƒng xuáº¥t táº¥t cáº£ phiÃªn?"
            description="Báº¡n sáº½ bá»‹ Ä‘Äƒng xuáº¥t khá»i táº¥t cáº£ thiáº¿t bá»‹"
            onConfirm={handleLogoutAll}
            okText="Äá»“ng Ã½"
            cancelText="Há»§y"
          >
            <Button danger icon={<DeleteOutlined />}>
              ÄÄƒng xuáº¥t táº¥t cáº£
            </Button>
          </Popconfirm>
          <Button onClick={onClose}>ÄÃ³ng</Button>
        </Space>
      }
    >
      <div style={{ maxHeight: "500px", overflowY: "auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            Äang táº£i...
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
                      ÄÄƒng xuáº¥t
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
                      <Tag color="green">Äang hoáº¡t Ä‘á»™ng</Tag>
                    ) : (
                      <Tag color="red">KhÃ´ng hoáº¡t Ä‘á»™ng</Tag>
                    )}
                  </Space>

                  <Space direction="vertical" size="small">
                    <Text type="secondary">
                      <strong>IP:</strong> {session.ip}
                    </Text>
                    <Text type="secondary">
                      <strong>Hoáº¡t Ä‘á»™ng láº§n cuá»‘i:</strong>{" "}
                      {formatLastActive(session.lastActive)}
                    </Text>
                    <Text type="secondary">
                      <strong>Háº¿t háº¡n:</strong>{" "}
                      {new Date(session.expiresAt).toLocaleString("vi-VN")}
                    </Text>
                  </Space>

                  {session.device && (
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      <strong>Thiáº¿t bá»‹:</strong>{" "}
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
                <Text type="secondary">KhÃ´ng cÃ³ phiÃªn Ä‘Äƒng nháº­p nÃ o</Text>
              </div>
            )}
          </Space>
        )}
      </div>
    </Modal>
  );
};

export default UserSessions;

