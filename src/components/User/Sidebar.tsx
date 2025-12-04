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
  FaGift,
  FaHistory,
  FaLightbulb,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../../services/AuthService";
import Cookie from "js-cookie";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem("accessToken");
      Cookie.remove("token");
      toast.success("Ðang xuất thành công");
      navigate("/");
    } catch {
      navigate("/");
    }
  };

  // Menu items cho sidebar
  const menuItems = [
    {
      path: "/user-information",
      icon: <FaUser className="text-lg" />,
      label: "Thông tin tài khoẩn",
    },
    {
      path: "/user-manage-order",
      icon: <FaClipboardList className="text-lg" />,
      label: "Quận lý don hàng",
    },
    {
      path: "/user-cancel-requests",
      icon: <FaTimesCircle className="text-lg" />,
      label: "Yêu c?u hủy don",
    },
    {
      path: "/user-reviews",
      icon: <FaStar className="text-lg" />,
      label: "Ðánh giá của tôi",
    },
    {
      path: "/like-page",
      icon: <FaHeart className="text-lg" />,
      label: "Sản phẩm yêu thích",
    },
    {
      path: "/loyalty/dashboard",
      icon: <FaGift className="text-lg" />,
      label: "Ði?m thuẩng",
    },
    {
      path: "/view-history",
      icon: <FaHistory className="text-lg" />,
      label: "Lọch số xem",
    },
    {
      path: "/recommendations",
      icon: <FaLightbulb className="text-lg" />,
      label: "Gửi ý cho bẩn",
    },
    {
      path: "/user-change-password",
      icon: <FaKey className="text-lg" />,
      label: "Ð?i mật khẩu",
    },
    {
      path: "/user-sessions",
      icon: <FaLaptopCode className="text-lg" />,
      label: "Phiên đang nhập",
    },
  ];

  return (
    <div className="w-72 bg-white shadow-lg rounded-2xl p-6 self-start sticky top-24 border border-mono-100">
      {/* User Avatar & Info */}
      <div className="flex flex-col items-center mb-8 pt-2">
        <div className="relative">
          <img
            src={
              user?.avatar?.url ||
              `https://ui-avatars.com/api/ẩname=${encodeURIComponent(
                user?.name || "User"
              )}&background=171717&color=fff`
            }
            alt="Avatar"
            className="w-20 h-20 rounded-full border-4 border-mono-100 object-cover shadow-md"
          />
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-mono-500 border-2 border-white rounded-full"></div>
        </div>
        <h3 className="mt-4 text-lg font-bold text-mono-900">
          {user?.name || "Tài khoẩn"}
        </h3>
        <p className="text-sm text-mono-500 truncate max-w-full">
          {user?.email}
        </p>
      </div>

      {/* Navigation Menu */}
      <nav>
        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <button
                  className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-mono-black text-white shadow-md"
                      : "text-mono-600 hover:bg-mono-50 hover:text-mono-900"
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <span
                    className={`mr-3 transition-transform group-hover:scale-110 ${
                      isActive ? "text-white" : "text-mono-500"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="mt-6 pt-6 border-t border-mono-100">
        <button
          className="flex items-center w-full px-4 py-3 rounded-xl text-mono-600 hover:bg-mono-100 hover:text-mono-700 transition-all duration-200 group"
          onClick={handleLogout}
        >
          <span className="mr-3 text-mono-500 group-hover:text-mono-500 transition-transform group-hover:scale-110">
            <FaSignOutAlt className="text-lg" />
          </span>
          <span className="font-medium text-sm">Ðang xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;



