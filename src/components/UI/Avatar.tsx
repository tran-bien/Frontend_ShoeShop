import React from "react";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  rounded?: "sm" | "md" | "lg" | "full";
  className?: string;
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "Avatar",
  name,
  size = "md",
  rounded = "full",
  className = "",
  onClick,
}) => {
  const sizes = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-14 h-14 text-lg",
    xl: "w-20 h-20 text-2xl",
  };

  const roundedVariants = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const baseStyles = `inline-flex items-center justify-center bg-mono-200 text-mono-600 font-medium overflow-hidden ${
    onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""
  }`;

  if (src) {
    return (
      <div
        className={`${baseStyles} ${sizes[size]} ${roundedVariants[rounded]} ${className}`}
        onClick={onClick}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            if (target.parentElement) {
              target.parentElement.innerHTML = name ? getInitials(name) : "?";
            }
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${baseStyles} ${sizes[size]} ${roundedVariants[rounded]} ${className}`}
      onClick={onClick}
    >
      {name ? getInitials(name) : "?"}
    </div>
  );
};

// Avatar Group Component
export const AvatarGroup: React.FC<{
  avatars: Array<{ src?: string; name?: string }>;
  max?: number;
  size?: "sm" | "md" | "lg";
}> = ({ avatars, max = 4, size = "md" }) => {
  const visibleAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className="flex -space-x-2">
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {remaining > 0 && (
        <div
          className={`inline-flex items-center justify-center bg-mono-100 text-mono-600 font-medium rounded-full ring-2 ring-white ${
            size === "sm"
              ? "w-8 h-8 text-xs"
              : size === "md"
              ? "w-10 h-10 text-sm"
              : "w-14 h-14 text-base"
          }`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default Avatar;
