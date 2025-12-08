import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaTruck,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaBox,
  FaCheckCircle,
} from "react-icons/fa";

const ShipperLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user info from localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    // Xóa tất cả tokens và user data
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    {
      path: "/shipper/dashboard",
      icon: <FaTachometerAlt size={20} />,
      label: "Dashboard",
    },
    {
      path: "/shipper/orders",
      icon: <FaBox size={20} />,
      label: "Đơn hàng của tôi",
    },
    {
      path: "/shipper/completed",
      icon: <FaCheckCircle size={20} />,
      label: "Đã giao",
    },
    {
      path: "/shipper/profile",
      icon: <FaUser size={20} />,
      label: "Hồ sơ",
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-mono-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-mono-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-between border-b border-mono-700">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <FaTruck size={32} />
              <span className="font-bold text-xl">Shipper Panel</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-mono-800 rounded-lg"
          >
            {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-6 py-3 mx-3 mb-2 rounded-lg transition-all ${
                isActive(item.path)
                  ? "bg-white text-mono-black shadow-lg"
                  : "hover:bg-mono-800"
              }`}
            >
              <span>{item.icon}</span>
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-mono-700">
          {user && sidebarOpen && (
            <div className="px-6 py-4">
              <p className="text-sm text-mono-200">Xin chào,</p>
              <p className="font-bold truncate">{user.name}</p>
              <p className="text-xs text-mono-200 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-6 py-3 mx-3 mb-3 rounded-lg hover:bg-mono-900 transition-all w-[calc(100%-1.5rem)]"
          >
            <FaSignOutAlt size={20} />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-mono-800">
              {menuItems.find((item) => isActive(item.path))?.label ||
                "Shipper Dashboard"}
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-mono-600">
                  {new Date().toLocaleDateString("vi-VN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-mono-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ShipperLayout;
