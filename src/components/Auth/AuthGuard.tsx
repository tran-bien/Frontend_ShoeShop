// src/components/Auth/AuthGuard.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { roleHelpers } from "../../utils/roleHelpers";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: string[];
  redirectTo?: string;
  adminOnly?: boolean; // Thêm thuộc tính adminOnly - giữ lại để backward compatibility
  requireStaff?: boolean; // Mới - cho phép cả staff và admin
  requireAdminOnly?: boolean; // Mới - chỉ admin
  requireShipper?: boolean; // Mới - chỉ shipper
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requireRole = [],
  redirectTo = "/login",
  adminOnly = false, // Giá trị mặc định là false
  requireStaff = false, // Mới
  requireAdminOnly = false, // Mới
  requireShipper = false, // Mới
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Hiển thị loading trong khi kiểm tra authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Nếu yêu cầu authentication nhưng user chưa đăng nhập
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Nếu không yêu cầu authentication nhưng user đã đăng nhập (ví dụ: trang login)
  if (!requireAuth && isAuthenticated) {
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  // Kiểm tra role nếu được yêu cầu
  if (requireRole.length > 0 && user && !requireRole.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Kiểm tra quyền staff (cho phép cả staff và admin)
  if (requireStaff && user && !roleHelpers.hasStaffAccess(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Kiểm tra quyền admin only (chỉ admin)
  if (requireAdminOnly && user && !roleHelpers.hasAdminOnlyAccess(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Kiểm tra quyền shipper only (chỉ shipper)
  if (requireShipper && user && user.role !== "shipper") {
    return <Navigate to="/unauthorized" replace />;
  }

  // Backward compatibility cho adminOnly
  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
