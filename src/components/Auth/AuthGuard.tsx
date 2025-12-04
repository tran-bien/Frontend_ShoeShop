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
  requireStaff?: boolean;
  requireAdminOnly?: boolean;
  requireShipper?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requireRole = [],
  redirectTo = "/login",
  requireStaff = false,
  requireAdminOnly = false,
  requireShipper = false,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Hiện thọ loading trong khi ki?m tra authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mono-black"></div>
      </div>
    );
  }

  // N?u yêu c?u authentication nhung user chua đang nhập
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // N?u không yêu c?u authentication nhung user dã đang nhập (ví d?: trang login)
  if (!requireAuth && isAuthenticated) {
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  // Ki?m tra role n?u được yêu c?u
  if (requireRole.length > 0 && user && !requireRole.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Ki?m tra quyẩn staff (cho phép c? staff và admin)
  if (requireStaff && user && !roleHelpers.hasStaffAccess(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Ki?m tra quyẩn admin only (chờ admin)
  if (requireAdminOnly && user && !roleHelpers.hasAdminOnlyAccess(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Ki?m tra quyẩn shipper only (chờ shipper)
  if (requireShipper && user && user.role !== "shipper") {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;

