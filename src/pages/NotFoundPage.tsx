import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiHome, FiArrowLeft, FiSearch } from "react-icons/fi";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-mono-50 to-mono-100 flex items-center justify-center px-4">
      <div className="max-w-xl w-full text-center">
        {/* 404 Number */}
        <div className="relative">
          <h1
            className="text-[180px] md:text-[220px] font-black text-mono-100 leading-none select-none"
            style={{ letterSpacing: "-0.05em" }}
          >
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-mono-black rounded-full flex items-center justify-center shadow-xl">
              <FiSearch className="text-white text-5xl md:text-6xl" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-mono-900">
            Không tìm thấy trang
          </h2>
          <p className="text-mono-600 max-w-md mx-auto">
            Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời
            không khả dụng.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-mono-200 text-mono-700 rounded-xl hover:bg-mono-50 hover:border-mono-300 transition-all font-medium w-full sm:w-auto justify-center"
          >
            <FiArrowLeft />
            Quay lại
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 bg-mono-black text-white rounded-xl hover:bg-mono-800 transition-all font-medium w-full sm:w-auto justify-center"
          >
            <FiHome />
            Về trang chủ
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-mono-200">
          <p className="text-sm text-mono-500 mb-4">
            Hoặc thử xem các trang sau:
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/products"
              className="text-mono-700 hover:text-mono-black hover:underline text-sm"
            >
              Sản phẩm
            </Link>
            <span className="text-mono-300">•</span>
            <Link
              to="/blog"
              className="text-mono-700 hover:text-mono-black hover:underline text-sm"
            >
              Blog
            </Link>
            <span className="text-mono-300">•</span>
            <Link
              to="/cart"
              className="text-mono-700 hover:text-mono-black hover:underline text-sm"
            >
              Giỏ hàng
            </Link>
            <span className="text-mono-300">•</span>
            <Link
              to="/user-information"
              className="text-mono-700 hover:text-mono-black hover:underline text-sm"
            >
              Tài khoản
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
