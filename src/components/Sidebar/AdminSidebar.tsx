import {
  GrDashboard,
  GrUser,
  GrCube,
  GrClipboard,
  GrCart,
  GrSettingsOption,
} from "react-icons/gr";
import {
  FaRulerCombined,
  FaPalette,
  FaTrademark,
  FaGift,
  FaImage,
  FaTags,
  FaWarehouse,
  FaTruck,
  FaExchangeAlt,
  FaBlog,
  FaStar,
  FaBookOpen,
  FaComments,
  FaRegCommentDots,
  FaDatabase,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaChevronDown, FaBars } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";

interface LinkProps {
  name: string;
  href?: string;
  icon: React.ElementType;
  subLinks?: { name: string; href: string; icon: React.ElementType }[];
  adminOnly?: boolean; // Chỉ admin mới thấy
}

const AdminSidebar = () => {
  const activeClass = "bg-mono-800 border-l-4 border-white";
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [isExpanded, setIsExpanded] = useState(window.innerWidth >= 768);
  const { hasAdminOnlyAccess } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsExpanded(window.innerWidth >= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };

  const links: LinkProps[] = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: GrDashboard,
      adminOnly: true,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: GrUser,
      adminOnly: true,
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: GrCube,
      subLinks: [
        { name: "Products", href: "/admin/products", icon: GrCube },
        { name: "Variants", href: "/admin/products/variants", icon: FaPalette },
        { name: "Categories", href: "/admin/categories", icon: GrClipboard },
        { name: "Brand", href: "/admin/brand", icon: FaTrademark },
        { name: "Tags", href: "/admin/tags", icon: FaTags },
        { name: "Color", href: "/admin/color", icon: FaPalette },
        { name: "Size", href: "/admin/size", icon: FaRulerCombined },
      ],
    },
    { name: "Banner", href: "/admin/banners", icon: FaImage },
    { name: "Inventory", href: "/admin/inventory", icon: FaWarehouse },
    { name: "Shippers", href: "/admin/shippers", icon: FaTruck },
    { name: "Orders", href: "/admin/orders", icon: GrCart },
    { name: "Returns", href: "/admin/returns", icon: FaExchangeAlt },
    { name: "Reviews", href: "/admin/reviews", icon: FaRegCommentDots },
    { name: "Blogs", href: "/admin/blogs", icon: FaBlog },
    { name: "Size Guides", href: "/admin/size-guides", icon: FaBookOpen },
    { name: "Loyalty Tiers", href: "/admin/loyalty-tiers", icon: FaStar },
    { name: "Chat Support", href: "/admin/chat", icon: FaComments },
    { name: "Knowledge Base", href: "/admin/knowledge-base", icon: FaDatabase },
    {
      name: "Coupon",
      href: "/admin/products/discount",
      icon: FaGift,
    },
  ];

  // Lọc menu items theo quyền
  const filteredLinks = links.filter((link) => {
    if (link.adminOnly) {
      return hasAdminOnlyAccess();
    }
    return true;
  });

  const { pathname } = useLocation();

  return (
    <aside
      className={`bg-mono-900 border-r border-mono-800 h-full flex flex-col transition-all duration-300 ${
        isExpanded ? "w-56" : "w-16"
      } text-white`}
      id="adminSide"
    >
      {/* Logo - Đồng bộ với MainNavbar */}
      <div className="px-4 py-4 flex-shrink-0">
        <Link to="/" className="group flex items-center gap-2 justify-center">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center transform group-hover:rotate-12 group-hover:scale-105 transition-all duration-300 shadow-md">
            <span className="text-xl font-black italic text-mono-900 tracking-tighter">
              S
            </span>
          </div>
          {isExpanded && (
            <div>
              <h1 className="text-lg font-black tracking-tighter uppercase italic leading-none text-white group-hover:text-mono-300 transition-colors">
                ShoeShop
              </h1>
              <p className="text-[8px] text-mono-400 tracking-[0.15em] uppercase font-semibold">
                Admin Panel
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="w-full text-white hover:text-mono-300 focus:outline-none mb-4 flex flex-row items-center justify-center gap-2 px-4 transition-colors duration-200 flex-shrink-0"
      >
        <FaBars className="text-lg" />
        {isExpanded && <span className="text-sm">Menu</span>}
      </button>

      {/* Menu Items - Scrollable */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1 pb-4">
        {filteredLinks.map((link, index) => (
          <div key={index}>
            <div className="flex items-center justify-between transition-all duration-300 hover:bg-mono-800">
              <Link
                to={link.href || "#"}
                className={`flex items-center w-full gap-3 px-4 py-3 text-sm transition-all duration-300 hover:bg-mono-800 ${
                  pathname === link.href ? activeClass : ""
                }`}
              >
                <link.icon className="text-lg" />
                {isExpanded && (
                  <span className="text-sm font-medium">{link.name}</span>
                )}
              </Link>
              {link.subLinks && isExpanded && (
                <button
                  onClick={() => toggleMenu(link.name)}
                  className="text-white hover:text-mono-300 focus:outline-none transition-colors duration-200"
                >
                  <FaChevronDown
                    className={`transition-transform mr-2 ${
                      openMenus[link.name] ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}
            </div>
            {link.subLinks && openMenus[link.name] && isExpanded && (
              <div className="ml-8 flex flex-col gap-1 transition-all duration-300">
                {link.subLinks.map((subLink, subIndex) => (
                  <Link
                    to={subLink.href}
                    key={subIndex}
                    className={`px-4 py-2 text-sm transition-all duration-300 hover:bg-mono-800 ${
                      pathname === subLink.href ? activeClass : ""
                    }`}
                  >
                    {subLink.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default AdminSidebar;
