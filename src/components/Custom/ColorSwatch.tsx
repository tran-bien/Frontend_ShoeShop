import React from "react";
import type { Color } from "../../types/color";

interface ColorSwatchProps {
  color: Color;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  selected?: boolean;
  onClick?: () => void;
  showName?: boolean;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  size = "md",
  className = "",
  selected = false,
  onClick,
  showName = false,
}) => {
  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const borderClass = selected
    ? "ring-2 ring-mono-black ring-offset-2"
    : "border-2 border-mono-300";

  const cursorClass = onClick ? "cursor-pointer hover:scale-110" : "";

  const renderSwatch = () => {
    if (color.type === "solid" && color.code) {
      // Single solid color
      return (
        <div
          className={`${sizeClasses[size]} rounded-full ${borderClass} ${cursorClass} transition-all ${className}`}
          style={{ backgroundColor: color.code }}
          onClick={onClick}
          title={color.name}
        />
      );
    }

    if (color.type === "half" && color.colors && color.colors.length >= 2) {
      // Half/split color (2+ colors)
      return (
        <div
          className={`${sizeClasses[size]} rounded-full ${borderClass} ${cursorClass} transition-all relative overflow-hidden ${className}`}
          onClick={onClick}
          title={color.name}
        >
          {color.colors.map((c, index) => {
            const totalColors = color.colors!.length;
            const segmentWidth = 100 / totalColors;

            return (
              <div
                key={index}
                style={{
                  backgroundColor: c,
                  position: "absolute",
                  top: 0,
                  left: `${index * segmentWidth}%`,
                  width: `${segmentWidth}%`,
                  height: "100%",
                }}
              />
            );
          })}
        </div>
      );
    }

    // Fallback for invalid color
    return (
      <div
        className={`${sizeClasses[size]} rounded-full ${borderClass} bg-mono-200 flex items-center justify-center ${className}`}
        onClick={onClick}
        title={color.name}
      >
        <span className="text-xs text-mono-500">?</span>
      </div>
    );
  };

  if (showName) {
    return (
      <div className="flex flex-col items-center gap-1">
        {renderSwatch()}
        <span className="text-xs text-mono-700 text-center">{color.name}</span>
      </div>
    );
  }

  return renderSwatch();
};

export default ColorSwatch;
