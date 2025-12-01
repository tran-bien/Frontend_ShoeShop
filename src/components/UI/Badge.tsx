import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "solid" | "outline" | "subtle";
  color?: "black" | "gray" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  rounded?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "solid",
  color = "black",
  size = "md",
  rounded = false,
  className = "",
}) => {
  const baseStyles =
    "inline-flex items-center font-medium tracking-wide uppercase";

  const colors = {
    black: {
      solid: "bg-mono-black text-white",
      outline: "border-2 border-mono-black text-mono-black bg-transparent",
      subtle: "bg-mono-100 text-mono-800",
    },
    gray: {
      solid: "bg-mono-500 text-white",
      outline: "border-2 border-mono-500 text-mono-500 bg-transparent",
      subtle: "bg-mono-100 text-mono-600",
    },
    success: {
      solid: "bg-mono-700 text-white",
      outline: "border-2 border-mono-700 text-mono-700 bg-transparent",
      subtle: "bg-mono-50 text-mono-700",
    },
    warning: {
      solid: "bg-mono-600 text-white",
      outline: "border-2 border-mono-600 text-mono-600 bg-transparent",
      subtle: "bg-mono-50 text-mono-600",
    },
    error: {
      solid: "bg-mono-900 text-white",
      outline: "border-2 border-mono-900 text-mono-900 bg-transparent",
      subtle: "bg-mono-100 text-mono-900",
    },
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  const roundedClass = rounded ? "rounded-full" : "rounded";

  return (
    <span
      className={`${baseStyles} ${colors[color][variant]} ${sizes[size]} ${roundedClass} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
