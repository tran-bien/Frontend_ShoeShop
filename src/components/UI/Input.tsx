import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "default" | "filled" | "underline";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = "default",
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const variants = {
      default:
        "border border-mono-200 bg-mono-50 focus:bg-white focus:border-mono-black",
      filled:
        "border-0 bg-mono-100 focus:bg-mono-50 focus:ring-2 focus:ring-mono-black",
      underline:
        "border-0 border-b-2 border-mono-200 bg-transparent focus:border-mono-black rounded-none px-0",
    };

    const baseInputStyles =
      "w-full px-4 py-3 text-mono-700 placeholder:text-mono-400 transition-all duration-200 ease-out focus:outline-none";

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-mono-700 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              ${baseInputStyles}
              ${variants[variant]}
              ${leftIcon ? "pl-10" : ""}
              ${rightIcon ? "pr-10" : ""}
              ${
                error
                  ? "border-mono-800 focus:border-mono-800 focus:ring-mono-800"
                  : ""
              }
              ${variant !== "underline" ? "rounded-lg" : ""}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-mono-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-mono-800">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-mono-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
