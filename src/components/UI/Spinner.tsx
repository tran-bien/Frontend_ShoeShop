import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "black" | "white" | "gray";
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  color = "black",
  className = "",
}) => {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
    xl: "w-12 h-12 border-4",
  };

  const colors = {
    black: "border-mono-black border-t-transparent",
    white: "border-white border-t-transparent",
    gray: "border-mono-400 border-t-transparent",
  };

  return (
    <div
      className={`rounded-full animate-spin ${sizes[size]} ${colors[color]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

// Full Page Loading Spinner
export const FullPageSpinner: React.FC<{ text?: string }> = ({
  text = "Đang tải...",
}) => (
  <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
    <Spinner size="xl" />
    <p className="mt-4 text-mono-600 font-medium">{text}</p>
  </div>
);

// Inline Loading Spinner
export const InlineSpinner: React.FC<{ text?: string }> = ({
  text = "Đang xử lý...",
}) => (
  <div className="flex items-center justify-center gap-2 py-4">
    <Spinner size="sm" />
    <span className="text-sm text-mono-600">{text}</span>
  </div>
);

export default Spinner;
