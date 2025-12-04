import React from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiAlertTriangle,
  FiX,
} from "react-icons/fi";

interface AlertProps {
  type?: "info" | "success" | "warning" | "error";
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  type = "info",
  title,
  children,
  onClose,
  className = "",
}) => {
  const types = {
    info: {
      container: "bg-mono-50 border-mono-300 text-mono-800",
      icon: <FiInfo className="w-5 h-5 text-mono-600" />,
    },
    success: {
      container: "bg-mono-50 border-mono-400 text-mono-800",
      icon: <FiCheckCircle className="w-5 h-5 text-mono-700" />,
    },
    warning: {
      container: "bg-mono-50 border-mono-400 text-mono-800",
      icon: <FiAlertTriangle className="w-5 h-5 text-mono-600" />,
    },
    error: {
      container: "bg-mono-100 border-mono-500 text-mono-900",
      icon: <FiAlertCircle className="w-5 h-5 text-mono-800" />,
    },
  };

  return (
    <div
      className={`flex gap-3 p-4 border rounded-lg ${types[type].container} ${className}`}
      role="alert"
    >
      <div className="flex-shrink-0">{types[type].icon}</div>
      <div className="flex-1">
        {title && <h5 className="font-medium mb-1">{title}</h5>}
        <div className="text-sm">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded hover:bg-mono-200 transition-colors"
          aria-label="Đóng thông báo"
        >
          <FiX className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;

