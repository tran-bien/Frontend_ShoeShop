// src/components/Auth/AuthGuard.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: string[];
  redirectTo?: string;
  adminOnly?: boolean; // Thêm thuộc tính adminOnly
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requireRole = [],
  redirectTo = "/login",
  adminOnly = false, // Giá trị mặc định là false
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

  // Kiểm tra quyền admin nếu cần
  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
