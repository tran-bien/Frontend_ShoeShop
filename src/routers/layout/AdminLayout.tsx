import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AdminSidebar from "../../components/Sidebar/AdminSidebar";
import AdminNavbar from "../../components/Navbar/AdminNavbar";

const AdminLayout = () => {
  const location = useLocation();
  const isChatPage = location.pathname.includes("/admin/chat");

  // Scroll to top when navigating to a new admin page (except chat page)
  useEffect(() => {
    if (!isChatPage) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, isChatPage]);

  // Layout chung cho tất cả trang admin - sử dụng fixed height
  return (
    <div className="fixed inset-0 flex bg-mono-50">
      {/* Sidebar - cố định bên trái */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Navbar - cố định trên cùng */}
        <AdminNavbar />

        {/* Content area */}
        {isChatPage ? (
          // Chat page: full height, no padding, no scroll
          <div className="flex-1 min-h-0">
            <Outlet />
          </div>
        ) : (
          // Các trang khác: có scroll và padding
          <div className="flex-1 overflow-auto p-4">
            <Outlet />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLayout;
