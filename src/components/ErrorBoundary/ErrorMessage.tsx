import React from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = "Đã xảy ra lỗi",
  message = "Không thể tải dữ liệu. Vui lòng thử lại.",
  onRetry,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}
    >
      {/* Error Icon */}
      <div className="mb-4">
        <div className="bg-red-100 rounded-full p-3">
          <ExclamationCircleIcon className="h-12 w-12 text-red-600" />
        </div>
      </div>

      {/* Error Title */}
      <h3 className="text-lg font-bold text-mono-900 mb-2">{title}</h3>

      {/* Error Message */}
      <p className="text-mono-600 text-center mb-6 max-w-md">{message}</p>

      {/* Retry Button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-mono-black text-white px-6 py-2 rounded-lg hover:bg-mono-800 transition-colors font-medium"
        >
          Thử lại
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
