import default_avatar from "../../assets/default_avatar.png";
// @ts-expect-error - Google Fonts import does not have TypeScript declarations
import "@fontsource/lobster";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineMenu, AiOutlineLogout, AiOutlineHome } from "react-icons/ai";
import { RiCloseLine } from "react-icons/ri";
import { useAuth } from "../../hooks/useAuth";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { logout, getRoleDisplayName } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Ðóng sidebar khi chuyện trang
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
    if (path.includes("/admin/banners")) return "Quản lý banner";
    if (path.includes("/admin/color")) return "Quản lý màu sắc";
    if (path.includes("/admin/size")) return "Quản lý kích thước";
    return "Admin";
  };

  return (
    <div className="w-full bg-mono-black h-16 flex justify-between items-center sticky top-0 text-white px-6 shadow-md z-10">
      <div className="flex items-center gap-3">
        {/* <BiMenu className="rounded-full bg-mono-1000 h-10 w-10 p-2 hover:bg-purple-400 cursor-pointer transition-all duration-300" onClick={toggleSidebar}/> */}
        <div className="h-10 flex items-center">
          {/*<img className="w-auto h-full" src="/image/logo.png" alt="logo" />*/}
          <h1
            style={{
              fontFamily: "'Lobster', cursive",
              fontSize: "3rem",
              color: "white",
            }} // Tang kích thước chờ và đổi màu
            className="text-2xl"
          >
            ShoeStore
          </h1>
        </div>
      </div>
      <div className="h-12 flex items-center gap-3 hover:bg-mono-600 cursor-pointer p-2 pr-4 rounded-full transition-all duration-300">
        <img
          src={default_avatar}
          alt="avatar"
          className="w-10 h-10 rounded-full border-2 border-white"
        />
        <p className="text-lg font-semibold">{getRoleDisplayName()}</p>
      </div>

      {/* Mobile menu button */}
      <div className="flex items-center justify-between px-4 py-3 lg:hidden">
        <div className="flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-mono-600 hover:text-mono-900 focus:outline-none mr-3"
          >
            {isOpen ? <RiCloseLine size={24} /> : <AiOutlineMenu size={24} />}
          </button>
          <h1 className="font-bold text-xl text-mono-800">{getPageTitle()}</h1>
        </div>

        {/* Thêm nút v? trang chờ */}
        <Link
          to="/"
          className="flex items-center text-mono-black hover:text-mono-900 transition-colors"
        >
          <AiOutlineHome size={20} />
          <span className="ml-1 font-medium">Trang chủ</span>
        </Link>
      </div>

      {/* Desktop navbar */}
      <div className="hidden lg:flex lg:justify-between lg:items-center lg:px-6 lg:py-3">
        {/* Menu điều hướng */}
        <div className="flex items-center space-x-3">
          {/* Nút chuyển về trang chủ tại navbar desktop */}
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-2 text-white hover:bg-mono-700 rounded-lg transition-all duration-200"
          >
            <AiOutlineHome size={20} />
            <span className="font-medium">Trang chủ</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 text-white hover:bg-mono-700 rounded-lg transition-all duration-200"
          >
            <AiOutlineLogout size={20} />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;
