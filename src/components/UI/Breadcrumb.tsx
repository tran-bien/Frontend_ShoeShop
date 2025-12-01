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
      products: "Sản phẩm",
      product: "Chi tiết sản phẩm",
      cart: "Giỏ hàng",
      checkout: "Thanh toán",
      "order-confirmation": "Xác nhận đơn hàng",
      "user-information": "Thông tin tài khoản",
      "user-manage-order": "Quản lý đơn hàng",
      "user-reviews": "Đánh giá của tôi",
      blog: "Blog",
      coupons: "Mã giảm giá",
      compare: "So sánh sản phẩm",
      wishlist: "Yêu thích",
      "like-page": "Sản phẩm yêu thích",
      notifications: "Thông báo",
      loyalty: "Loyalty",
      returns: "Đổi trả",
      recommendations: "Gợi ý cho bạn",
      "view-history": "Lịch sử xem",
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
              <span>Trang chủ</span>
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
