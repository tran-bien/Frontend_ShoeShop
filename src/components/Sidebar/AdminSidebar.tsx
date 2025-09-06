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
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaChevronDown, FaBars } from "react-icons/fa";

interface LinkProps {
  name: string;
  href?: string;
  icon: React.ElementType;
  subLinks?: { name: string; href: string }[];
}

const AdminSidebar = () => {
  const activeClass = "bg-[#1E304B] border-l-[6px] border-red-500";
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [isExpanded, setIsExpanded] = useState(window.innerWidth >= 768);

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
    { name: "Dashboard", href: "/admin/dashboard", icon: GrDashboard },
    {
      name: "Users",
      href: "/admin/users",
      icon: GrUser,
      subLinks: [
        { name: "All Users", href: "/admin/users" },
        //{ name: "Add User", href: "/admin/users/add" },
      ],
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: GrCube,
      subLinks: [
        { name: "Products", href: "/admin/products" },
        { name: "Variants", href: "/admin/products/variants" },
      ],
    },
    { name: "Categories", href: "/admin/categories", icon: GrClipboard },
    { name: "Brand", href: "/admin/brand", icon: FaTrademark },
    { name: "Color", href: "/admin/color", icon: FaPalette },
    { name: "Size", href: "/admin/size", icon: FaRulerCombined },
    { name: "Orders", href: "/admin/orders", icon: GrCart },
    {
      name: "Coupon",
      href: "/admin/products/discount",
      icon: FaGift,
    },
    { name: "Settings", href: "/admin/settings", icon: GrSettingsOption },
  ];

  const { pathname } = useLocation();

  return (
    <aside
      className={`bg-[#16283C] border-r min-h-screen transition-all duration-300 ${
        isExpanded ? "w-48" : "w-16"
      } sticky top-0 left-0 text-white text-center py-6`}
      id="adminSide"
    >
      <button
        onClick={toggleSidebar}
        className="text-white focus:outline-none mb-4 flex flex-row items-center gap-1 m-auto"
      >
        <FaBars className="text-lg mx-auto" />
        <p className={`${isExpanded ? "block" : "hidden"}`}>Menu</p>
      </button>
      <div className="flex flex-col gap-2">
        {links.map((link, index) => (
          <div key={index}>
            <div className="flex items-center justify-between transition-all duration-300 hover:bg-[#1E304B]">
              <Link
                to={link.href || "#"}
                className={`flex items-center w-full gap-3 px-4 py-3 text-sm transition-all duration-300 hover:bg-[#1E304B] ${
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
                  className="text-white focus:outline-none"
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
                    className={`px-4 py-2 text-sm transition-all duration-300 hover:bg-[#1E304B] ${
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
