import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FiHome,
  FiTruck,
  FiPackage,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiRefreshCw,
} from "react-icons/fi";
import SupportChat from "../../components/Chat/SupportChat";

interface ShipperUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

const ShipperLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<ShipperUser | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    {
      path: "/shipper/dashboard",
      icon: <FiHome size={20} />,
      label: "Tổng quan",
    },
    {
      path: "/shipper/orders",
      icon: <FiPackage size={20} />,
      label: "Đơn hàng",
    },
    {
      path: "/shipper/returns",
      icon: <FiRefreshCw size={20} />,
      label: "Trả hàng",
    },
    {
      path: "/shipper/profile",
      icon: <FiUser size={20} />,
      label: "Hồ sơ",
    },
  ];

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const getPageTitle = () => {
    const currentItem = menuItems.find((item) => isActive(item.path));
    return currentItem?.label || "Shipper";
  };

  return (
    <div className="flex h-screen bg-mono-50">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex ${
          sidebarOpen ? "w-64" : "w-20"
        } bg-mono-900 text-white transition-all duration-300 flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-mono-800">
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <FiTruck size={22} />
                </div>
                <div>
                  <span className="font-bold text-lg block">Shipper</span>
                  <span className="text-xs text-mono-400">Giao hàng</span>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mx-auto">
                <FiTruck size={22} />
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 hover:bg-mono-800 rounded-lg transition-colors ${
                !sidebarOpen ? "hidden" : ""
              }`}
            >
              <FiChevronLeft size={18} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 mx-3 mb-1 rounded-xl transition-all ${
                isActive(item.path)
                  ? "bg-white text-mono-900 shadow-lg font-medium"
                  : "text-mono-300 hover:bg-mono-800 hover:text-white"
              } ${!sidebarOpen ? "justify-center px-3" : ""}`}
            >
              <span className={isActive(item.path) ? "text-mono-900" : ""}>
                {item.icon}
              </span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-mono-800 p-4">
          {user && sidebarOpen && (
            <div className="mb-4 px-2">
              <p className="text-xs text-mono-400">Xin chào,</p>
              <p className="font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-mono-400 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-mono-300 hover:bg-mono-800 hover:text-white transition-all ${
              !sidebarOpen ? "justify-center px-3" : ""
            }`}
          >
            <FiLogOut size={20} />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-mono-900 text-white flex flex-col">
            {/* Logo */}
            <div className="p-4 border-b border-mono-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <FiTruck size={22} />
                </div>
                <div>
                  <span className="font-bold text-lg block">Shipper</span>
                  <span className="text-xs text-mono-400">Giao hàng</span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-mono-800 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 mx-3 mb-1 rounded-xl transition-all ${
                    isActive(item.path)
                      ? "bg-white text-mono-900 shadow-lg font-medium"
                      : "text-mono-300 hover:bg-mono-800 hover:text-white"
                  }`}
                >
                  <span className={isActive(item.path) ? "text-mono-900" : ""}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* User Info & Logout */}
            <div className="border-t border-mono-800 p-4">
              {user && (
                <div className="mb-4 px-2">
                  <p className="text-xs text-mono-400">Xin chào,</p>
                  <p className="font-semibold text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-mono-400 truncate">{user.email}</p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-mono-300 hover:bg-mono-800 hover:text-white transition-all"
              >
                <FiLogOut size={20} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-mono-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-mono-100 rounded-lg transition-colors"
              >
                <FiMenu size={20} className="text-mono-700" />
              </button>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:block p-2 hover:bg-mono-100 rounded-lg transition-colors"
              >
                <FiMenu size={20} className="text-mono-700" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-mono-900">
                  {getPageTitle()}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-mono-700">
                  {user?.name}
                </p>
                <p className="text-xs text-mono-500">
                  {new Date().toLocaleDateString("vi-VN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
              <></>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Support Chat for Shipper */}
      <SupportChat />
    </div>
  );
};

export default ShipperLayout;
