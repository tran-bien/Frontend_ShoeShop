import React, { useState } from "react";
import { Button, Card, Typography, Space, Divider } from "antd";
import {
  DesktopOutlined,
  SecurityScanOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import UserSessions from "../../../components/User/UserSessions";
import Sidebar from "../../../components/User/Sidebar";

const { Title, Text } = Typography;

const UserSessionsPage: React.FC = () => {
  const [visible, setVisible] = useState(false);

  const handleOpen = () => {
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-md">
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="large"
              >
                {/* Header Section */}
                <div>
                  <Title
                    level={2}
                    style={{
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <SecurityScanOutlined style={{ color: "#1890ff" }} />
                    Bảo mật tài khoản
                  </Title>
                  <Text type="secondary">
                    Quản lý và giám sát các phiên đăng nhập của bạn trên tất cả
                    thiết bị
                  </Text>
                </div>

                <Divider />

                {/* Session Management Section */}
                <div>
                  <Title
                    level={4}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <DesktopOutlined />
                    Quản lý phiên đăng nhập
                  </Title>

                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size="middle"
                  >
                    <div
                      style={{
                        background: "#f6ffed",
                        border: "1px solid #b7eb8f",
                        borderRadius: "6px",
                        padding: "16px",
                      }}
                    >
                      <Space>
                        <InfoCircleOutlined style={{ color: "#52c41a" }} />
                        <div>
                          <Text strong>Thông tin bảo mật</Text>
                          <br />
                          <Text type="secondary">
                            Bạn có thể xem và quản lý tất cả các thiết bị đang
                            đăng nhập vào tài khoản của mình. Nếu phát hiện hoạt
                            động đáng ngờ, hãy đăng xuất khỏi các phiên không
                            xác định ngay lập tức.
                          </Text>
                        </div>
                      </Space>
                    </div>

                    <Space>
                      <Button
                        type="primary"
                        size="large"
                        icon={<DesktopOutlined />}
                        onClick={handleOpen}
                      >
                        Xem tất cả phiên đăng nhập
                      </Button>
                    </Space>
                  </Space>
                </div>

                {/* Security Tips Section */}
                <div>
                  <Title level={4}>Mẹo bảo mật</Title>
                  <div
                    style={{
                      background: "#fff7e6",
                      border: "1px solid #ffd591",
                      borderRadius: "6px",
                      padding: "16px",
                    }}
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Text strong>Để bảo vệ tài khoản của bạn:</Text>
                      <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                        <li>
                          <Text>Thường xuyên kiểm tra các phiên đăng nhập</Text>
                        </li>
                        <li>
                          <Text>Đăng xuất khỏi các thiết bị không sử dụng</Text>
                        </li>
                        <li>
                          <Text>Không đăng nhập trên máy tính công cộng</Text>
                        </li>
                        <li>
                          <Text>Sử dụng mật khẩu mạnh và duy nhất</Text>
                        </li>
                      </ul>
                    </Space>
                  </div>
                </div>
              </Space>
            </Card>

            {/* UserSessions Modal */}
            <UserSessions visible={visible} onClose={handleClose} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSessionsPage;
