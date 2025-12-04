import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const UnauthorizedPage: React.FC = () => {
  const { user, hasStaffAccess } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-mono-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="mb-6">
          {/* Icon 403 */}
          <div className="mx-auto w-16 h-16 bg-mono-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-mono-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-mono-800 mb-2">403</h1>
          <h2 className="text-xl font-semibold text-mono-800 mb-4">
            Không có quyền truy cập
          </h2>
          <p className="text-mono-600 mb-2">
            Bạn không có quyền truy cập vào trang này.
          </p>
          {user && (
            <p className="text-sm text-mono-500">
              Đăng nhập với tài khoản:{" "}
              <span className="font-medium">{user.name}</span> ({user.role})
            </p>
          )}
        </div>

        <div className="space-y-3">
          {/* Nút quay lại dành cho staff/admin */}
          {hasStaffAccess() && (
            <Link
              to="/admin/dashboard"
              className="block w-full bg-mono-500 text-white py-2 px-4 rounded hover:bg-mono-black transition-colors duration-200"
            >
              Quay lại Dashboard
            </Link>
          )}

          {/* Nút về trang chủ */}
          <Link
            to="/"
            className="block w-full bg-mono-500 text-white py-2 px-4 rounded hover:bg-mono-600 transition-colors duration-200"
          >
            Về trang chủ
          </Link>
        </div>

        {/* Thông tin hỗ trợ */}
        <div className="mt-6 pt-4 border-t border-mono-200">
          <p className="text-xs text-mono-500">
            Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ quản trị viên.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
