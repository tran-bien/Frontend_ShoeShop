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

  // Render đặc biệt cho chat page - full height, no scroll
  if (isChatPage) {
    return (
      <div className="flex h-screen bg-mono-50 overflow-hidden">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <AdminNavbar />
          <main className="flex-1 overflow-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  // Render bình thường cho các trang khác
  return (
    <div className="flex bg-mono-50 min-h-screen">
      <AdminSidebar />
      <div className="flex flex-col flex-1 min-h-screen">
        <AdminNavbar />
        <div className="p-4 flex-1 bg-mono-50">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
