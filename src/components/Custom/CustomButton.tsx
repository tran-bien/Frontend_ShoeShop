import React from "react";

interface CustomButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  children,
  onClick,
  type = "button",
  className = "",
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-mono-black text-mono-white hover:bg-mono-900 focus:ring-mono-800 shadow-md hover:shadow-luxury active:scale-95",
    secondary:
      "bg-mono-white text-mono-black border-2 border-mono-black hover:bg-mono-black hover:text-mono-white focus:ring-mono-600 active:scale-95",
    ghost:
      "bg-transparent text-mono-black hover:bg-mono-100 focus:ring-mono-400",
    danger:
      "bg-mono-900 text-mono-white hover:bg-mono-black focus:ring-mono-700 shadow-md hover:shadow-luxury active:scale-95",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm rounded-md gap-1.5",
    md: "px-6 py-3 text-base rounded-lg gap-2",
    lg: "px-8 py-4 text-lg rounded-xl gap-2.5",
  };

  const widthClass = fullWidth ? "w-full" : "";

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={combinedClasses}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Äang xá»­ lÃ½...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && <span>{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === "right" && <span>{icon}</span>}
        </>
      )}
    </button>
  );
};

export default CustomButton;

