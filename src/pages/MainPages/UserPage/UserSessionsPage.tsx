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
    <div className="flex flex-col min-h-screen bg-mono-100">
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
                    B?o m?t tài khoẩn
                  </Title>
                  <Text type="secondary">
                    Quận lý và giám sát các phiên đang nhập của bẩn trên tất cả
                    thi?t b?
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
                    Quận lý phiên đang nhập
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
                          <Text strong>Thông tin b?o m?t</Text>
                          <br />
                          <Text type="secondary">
                            Bẩn có thọ xem và quận lý tất cả các thi?t bỏ đang
                            đang nhập vào tài khoẩn của mình. N?u phát hiện ho?t
                            đếng dáng ng?, hãy đang xuất kh?i các phiên không
                            xác đếnh ngay lệp t?c.
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
                        Xem tất cả phiên đang nhập
                      </Button>
                    </Space>
                  </Space>
                </div>

                {/* Security Tips Section */}
                <div>
                  <Title level={4}>M?o b?o m?t</Title>
                  <div
                    style={{
                      background: "#fff7e6",
                      border: "1px solid #ffd591",
                      borderRadius: "6px",
                      padding: "16px",
                    }}
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Text strong>Ð? b?o v? tài khoẩn của bẩn:</Text>
                      <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                        <li>
                          <Text>Thuẩng xuyên ki?m tra các phiên đang nhập</Text>
                        </li>
                        <li>
                          <Text>Ðang xuất kh?i các thi?t bỏ không sử dụng</Text>
                        </li>
                        <li>
                          <Text>Không đang nhập trên máy tính công cẩng</Text>
                        </li>
                        <li>
                          <Text>Sử dụng mật khẩu mẩnh và duy nh?t</Text>
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

