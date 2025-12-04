import React, { forwardRef } from "react";
import { FiChevronDown } from "react-icons/fi";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  variant?: "default" | "filled";
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder = "Chá»n má»™t tÃ¹y chá»n",
      variant = "default",
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const variants = {
      default:
        "border border-mono-200 bg-mono-50 focus:bg-white focus:border-mono-black",
      filled:
        "border-0 bg-mono-100 focus:bg-mono-50 focus:ring-2 focus:ring-mono-black",
    };

    const baseSelectStyles =
      "w-full px-4 py-3 pr-10 text-mono-700 appearance-none transition-all duration-200 ease-out focus:outline-none rounded-lg cursor-pointer";

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-mono-700 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              ${baseSelectStyles}
              ${variants[variant]}
              ${error ? "border-mono-800 focus:border-mono-800" : ""}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-mono-400 pointer-events-none" />
        </div>
        {error && <p className="mt-1.5 text-sm text-mono-800">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-mono-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;

