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

  return (
    <>
      <div className="flex flex-row bg-mono-50 min-h-screen">
        <div>
          <AdminSidebar />
        </div>
        <div
          className={`flex flex-col w-full ${
            isChatPage ? "h-screen" : "min-h-screen"
          }`}
        >
          <AdminNavbar />
          <div
            className={`${
              isChatPage ? "flex-1 overflow-hidden" : "p-4"
            } bg-mono-50`}
          >
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
