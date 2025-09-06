import React from "react";
import {
  FaUser,
  FaClipboardList,
  FaHeart,
  FaSignOutAlt,
  FaStar,
  FaTimesCircle,
  FaKey,
  FaLaptopCode,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { authenticateApi } from "../../services/AuthenticationService";
import Cookie from "js-cookie";
import toast from "react-hot-toast";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await authenticateApi.logout();
      localStorage.removeItem("accessToken");
      Cookie.remove("token");
      toast.success("Đăng xuất thành công");
      navigate("/");
    } catch {
      navigate("/");
    }
  };

  // Menu items cho sidebar
  const menuItems = [
    {
      path: "/user-information",
      icon: <FaUser className="text-xl" />,
      label: "Thông tin tài khoản",
    },
    {
      path: "/user-manage-order",
      icon: <FaClipboardList className="text-xl" />,
      label: "Quản lý đơn hàng",
    },
    {
      path: "/user-cancel-requests",
      icon: <FaTimesCircle className="text-xl" />,
      label: "Yêu cầu hủy đơn",
    },
    {
      path: "/user-reviews",
      icon: <FaStar className="text-xl" />,
      label: "Đánh giá của tôi",
    },
    {
      path: "/like-page",
      icon: <FaHeart className="text-xl" />,
      label: "Sản phẩm yêu thích",
    },
    {
      path: "/user-change-password",
      icon: <FaKey className="text-xl" />,
      label: "Đổi mật khẩu",
    },
    {
      path: "/user-sessions",
      icon: <FaLaptopCode className="text-xl" />, // Có thể thay đổi icon nếu cần
      label: "Phiên đăng nhập",
    },
    {
      path: "/logout",
      icon: <FaSignOutAlt className="text-xl" />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  return (
    <div className="w-64 bg-white shadow-lg rounded-lg p-5 self-start sticky top-24">
      <div className="flex flex-col items-center mb-6 pt-3">
        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-3">
          <FaUser className="text-4xl text-blue-500" />
        </div>
        <h3 className="text-lg font-bold">Tài khoản của tôi</h3>
      </div>

      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <button
                className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 ${
                  location.pathname === item.path
                    ? "bg-blue-500 text-white font-medium shadow-md"
                    : "text-gray-700 hover:bg-blue-50"
                }`}
                onClick={item.onClick || (() => navigate(item.path))}
              >
                <div className="mr-3">{item.icon}</div>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
