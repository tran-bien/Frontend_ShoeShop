import React from "react";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "outlined" | "elevated" | "luxury";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  padding = "md",
  hover = false,
  className = "",
  onClick,
}) => {
  const variants = {
    default: "bg-white border border-mono-200",
    outlined: "bg-transparent border-2 border-mono-200",
    elevated: "bg-white shadow-medium",
    luxury: "bg-white border border-mono-200 shadow-luxury",
  };

  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-8",
  };

  const hoverStyles = hover
    ? "cursor-pointer hover:shadow-hard hover:-translate-y-1 transition-all duration-300"
    : "";

  return (
    <div
      className={`rounded-xl ${variants[variant]} ${paddings[padding]} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Card Header Component
export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`pb-4 border-b border-mono-100 ${className}`}>{children}</div>
);

// Card Body Component
export const CardBody: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`py-4 ${className}`}>{children}</div>
);

// Card Footer Component
export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`pt-4 border-t border-mono-100 ${className}`}>{children}</div>
);

export default Card;

