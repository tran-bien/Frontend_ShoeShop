import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
}

const Container: React.FC<ContainerProps> = ({
  children,
  size = "lg",
  padding = "md",
  className = "",
}) => {
  const sizes = {
    sm: "max-w-3xl",
    md: "max-w-5xl",
    lg: "max-w-7xl",
    xl: "max-w-screen-2xl",
    full: "max-w-full",
  };

  const paddings = {
    none: "",
    sm: "px-2 sm:px-4",
    md: "px-4 sm:px-6 lg:px-8",
    lg: "px-6 sm:px-8 lg:px-12",
  };

  return (
    <div className={`mx-auto ${sizes[size]} ${paddings[padding]} ${className}`}>
      {children}
    </div>
  );
};

export default Container;
