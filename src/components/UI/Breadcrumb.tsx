import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiChevronRight, FiHome } from "react-icons/fi";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items = [],
  showHome = true,
  className = "",
}) => {
  const location = useLocation();

  // Auto generate breadcrumbs from URL if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items.length > 0) return items;

    const paths = location.pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    const pathMap: { [key: string]: string } = {
      products: "Sáº£n pháº©m",
      product: "Chi tiáº¿t sáº£n pháº©m",
      cart: "Giá» hÃ ng",
      checkout: "Thanh toÃ¡n",
      "order-confirmation": "XÃ¡c nháº­n Ä‘Æ¡n hÃ ng",
      "user-information": "ThÃ´ng tin tÃ i khoáº£n",
      "user-manage-order": "Quáº£n lÃ½ Ä‘Æ¡n hÃ ng",
      "user-reviews": "ÄÃ¡nh giÃ¡ cá»§a tÃ´i",
      blog: "Blog",
      coupons: "MÃ£ giáº£m giÃ¡",
      compare: "So sÃ¡nh sáº£n pháº©m",
      wishlist: "YÃªu thÃ­ch",
      "like-page": "Sáº£n pháº©m yÃªu thÃ­ch",
      notifications: "ThÃ´ng bÃ¡o",
      loyalty: "Loyalty",
      returns: "Äá»•i tráº£",
      recommendations: "Gá»£i Ã½ cho báº¡n",
      "view-history": "Lá»‹ch sá»­ xem",
    };

    let currentPath = "";
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const isLast = index === paths.length - 1;

      breadcrumbs.push({
        label: pathMap[path] || path,
        href: isLast ? undefined : currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = generateBreadcrumbs();

  return (
    <nav
      className={`flex items-center text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center flex-wrap gap-1">
        {showHome && (
          <li className="flex items-center">
            <Link
              to="/"
              className="flex items-center gap-1 text-mono-500 hover:text-mono-900 transition-colors"
            >
              <FiHome className="w-4 h-4" />
              <span>Trang chá»§</span>
            </Link>
            {breadcrumbItems.length > 0 && (
              <FiChevronRight className="mx-2 text-mono-400 w-4 h-4" />
            )}
          </li>
        )}
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          return (
            <li key={index} className="flex items-center">
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="text-mono-500 hover:text-mono-900 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-mono-900 font-medium">{item.label}</span>
              )}
              {!isLast && (
                <FiChevronRight className="mx-2 text-mono-400 w-4 h-4" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

