import default_avatar from "../../assets/default_avatar.png";
// @ts-ignore
import "@fontsource/lobster";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineMenu, AiOutlineLogout, AiOutlineHome } from "react-icons/ai";
import { RiCloseLine } from "react-icons/ri";
import { useAuth } from "../../hooks/useAuth";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Đóng sidebar khi chuyển trang
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Xử lý logout
  const handleLogout = async () => {
    try {
      await logout();
      // Delay trước khi navigate để toast kịp hiển thị
      setTimeout(() => {
        navigate("/login");
      }, 500);
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback navigation nếu có lỗi
      setTimeout(() => {
        navigate("/login");
      }, 500);
    }
  };

  // Tiêu đề trang dựa vào URL
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/admin" || path === "/admin/dashboard") return "Dashboard";
    if (path.includes("/admin/products")) return "Quản lý sản phẩm";
    if (path.includes("/admin/users")) return "Quản lý người dùng";
    if (path.includes("/admin/categories")) return "Quản lý danh mục";
    if (path.includes("/admin/orders")) return "Quản lý đơn hàng";
    if (path.includes("/admin/brand")) return "Quản lý thương hiệu";
    if (path.includes("/admin/color")) return "Quản lý màu sắc";
    if (path.includes("/admin/size")) return "Quản lý kích thước";
    return "Admin";
  };

  return (
    <div className="w-full bg-[#1E304B] h-16 flex justify-between items-center sticky top-0 text-white px-6 shadow-md z-10">
      <div className="flex items-center gap-4">
        {/* <BiMenu className="rounded-full bg-purple-500 h-10 w-10 p-2 hover:bg-purple-400 cursor-pointer transition-all duration-300" onClick={toggleSidebar}/> */}
        <div className="h-10 flex items-center">
          {/*<img className="w-auto h-full" src="/image/logo.png" alt="logo" />*/}
          <h1
            style={{
              fontFamily: "'Lobster', cursive",
              fontSize: "3rem",
              color: "white",
            }} // Tăng kích thước chữ và đổi màu
            className="text-2xl"
          >
            ShoeStore
          </h1>
        </div>
      </div>
      <div className="h-12 flex items-center gap-3 hover:bg-gray-600 cursor-pointer p-2 pr-4 rounded-full transition-all duration-300">
        <img
          src={default_avatar}
          alt="avatar"
          className="w-10 h-10 rounded-full border-2 border-white"
        />
        <p className="text-lg font-semibold">Admin</p>
      </div>

      {/* Mobile menu button */}
      <div className="flex items-center justify-between px-4 py-3 lg:hidden">
        <div className="flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-600 hover:text-gray-900 focus:outline-none mr-3"
          >
            {isOpen ? <RiCloseLine size={24} /> : <AiOutlineMenu size={24} />}
          </button>
          <h1 className="font-bold text-xl text-gray-800">{getPageTitle()}</h1>
        </div>

        {/* Thêm nút về trang chủ */}
        <Link
          to="/"
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <AiOutlineHome size={20} />
          <span className="ml-1 font-medium">Trang chủ</span>
        </Link>
      </div>

      {/* Desktop navbar */}
      <div className="hidden lg:flex lg:justify-between lg:items-center lg:px-6 lg:py-3">
        {/* Menu điều hướng */}
        <div className="flex items-center space-x-6">
          {/* Nút chuyển về trang chủ tại navbar desktop */}
          <Link
            to="/"
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <AiOutlineHome size={20} />
            <span className="ml-1 font-medium">Trang chủ</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center text-red-600 hover:text-red-800 transition-colors"
          >
            <AiOutlineLogout className="mr-1" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;
