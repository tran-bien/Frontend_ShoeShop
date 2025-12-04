import React from "react";
import { FiLoader } from "react-icons/fi";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-mono-black text-white hover:bg-mono-800 active:bg-mono-900 focus:ring-mono-black disabled:bg-mono-300 disabled:text-mono-500",
    secondary:
      "bg-white border-2 border-mono-black text-mono-black hover:bg-mono-black hover:text-white focus:ring-mono-black disabled:border-mono-300 disabled:text-mono-300",
    ghost:
      "bg-transparent text-mono-700 hover:bg-mono-100 hover:text-mono-black focus:ring-mono-400",
    outline:
      "bg-transparent border border-mono-300 text-mono-700 hover:border-mono-black hover:text-mono-black focus:ring-mono-black",
    danger:
      "bg-mono-black text-white hover:bg-mono-900 focus:ring-mono-black disabled:bg-mono-300",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-md gap-1.5",
    md: "px-5 py-2.5 text-base rounded-lg gap-2",
    lg: "px-7 py-3.5 text-lg rounded-xl gap-2.5",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <FiLoader className="animate-spin" />
          <span>Äang xá»­ lÃ½...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;

