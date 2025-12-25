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
  FaUndo,
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
      toast.success("Ðăng xuất thành công");
      navigate("/");
    } catch {
      navigate("/");
    }
  };

  // Menu items cho sidebar
  const menuItems: Array<{
    path: string;
    icon: React.ReactNode;
    label: string;
    matchPaths?: string[];
  }> = [
    {
      path: "/user-information",
      icon: <FaUser className="text-lg" />,
      label: "Thông tin tài khoản",
    },
    {
      path: "/user-change-password",
      icon: <FaKey className="text-lg" />,
      label: "Đổi mật khẩu",
    },
    {
      path: "/user-manage-order",
      icon: <FaClipboardList className="text-lg" />,
      label: "Quản lý đơn hàng",
    },
    {
      path: "/user-cancel-requests",
      icon: <FaTimesCircle className="text-lg" />,
      label: "Yêu cầu hủy đơn",
    },
    // {
    //   path: "/returns/create",
    //   icon: <FaUndo className="text-lg" />,
    //   label: "Yêu cầu trả hàng",
    //   matchPaths: ["/returns/create", "/returns/"],
    // },
    {
      path: "/user-reviews",
      icon: <FaStar className="text-lg" />,
      label: "Đánh giá của tôi",
    },
    {
      path: "/like-page",
      icon: <FaHeart className="text-lg" />,
      label: "Sản phẩm yêu thích",
    },
    {
      path: "/loyalty/dashboard",
      icon: <FaGift className="text-lg" />,
      label: "Điểm thưởng",
    },
    {
      path: "/my-coupons",
      icon: <FaClipboardList className="text-lg" />,
      label: "Mã giảm giá của tôi",
    },
    {
      path: "/view-history",
      icon: <FaHistory className="text-lg" />,
      label: "Lịch sử xem",
    },
    {
      path: "/user-sessions",
      icon: <FaLaptopCode className="text-lg" />,
      label: "Phiên đăng nhập",
    },
    {
      path: "/recommendations",
      icon: <FaLightbulb className="text-lg" />,
      label: "Gợi ý cho bạn",
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
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || "User"
              )}&background=171717&color=fff`
            }
            alt="Avatar"
            className="w-20 h-20 rounded-full border-4 border-mono-100 object-cover shadow-md"
          />
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-mono-500 border-2 border-white rounded-full"></div>
        </div>
        <h3 className="mt-4 text-lg font-bold text-mono-900">
          {user?.name || "Tài khoản"}
        </h3>
        <p className="text-sm text-mono-500 truncate max-w-full">
          {user?.email}
        </p>
      </div>

      {/* Navigation Menu */}
      <nav>
        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            // Check if current path matches item path or any of the matchPaths
            const isActive =
              location.pathname === item.path ||
              (item.matchPaths &&
                item.matchPaths.some((p) => location.pathname.startsWith(p)));
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
          <span className="font-medium text-sm">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
