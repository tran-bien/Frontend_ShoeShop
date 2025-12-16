import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AdminSidebar from "../../components/Sidebar/AdminSidebar";
import AdminNavbar from "../../components/Navbar/AdminNavbar";

const AdminLayout = () => {
  const location = useLocation();

  // Scroll to top when navigating to a new admin page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <div className="flex flex-row bg-mono-50">
        <div>
          <AdminSidebar />
        </div>
        <div className="flex flex-col w-full min-h-screen">
          <AdminNavbar />
          <div className="p-4 bg-mono-50">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
