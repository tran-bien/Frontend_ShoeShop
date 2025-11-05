import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "text":
        return "h-4 rounded";
      case "circular":
        return "rounded-full";
      case "rectangular":
        return "rounded-lg";
      default:
        return "rounded-lg";
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case "pulse":
        return "animate-pulse";
      case "wave":
        return "animate-shimmer bg-gradient-to-r from-mono-200 via-mono-100 to-mono-200 bg-[length:200%_100%]";
      case "none":
        return "";
      default:
        return "animate-pulse";
    }
  };

  const style: React.CSSProperties = {
    width: width || "100%",
    height: height || "100%",
  };

  return (
    <div
      className={`bg-mono-200 ${getVariantClasses()} ${getAnimationClasses()} ${className}`}
      style={style}
    />
  );
};

export default Skeleton;
