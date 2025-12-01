import React from "react";

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: "default" | "pills" | "underline";
  fullWidth?: boolean;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  items,
  activeTab,
  onChange,
  variant = "default",
  fullWidth = false,
  className = "",
}) => {
  const variants = {
    default: {
      container: "border-b border-mono-200",
      tab: "px-4 py-3 -mb-px border-b-2 transition-colors",
      active: "border-mono-black text-mono-black font-medium",
      inactive:
        "border-transparent text-mono-500 hover:text-mono-700 hover:border-mono-300",
    },
    pills: {
      container: "bg-mono-100 p-1 rounded-lg",
      tab: "px-4 py-2 rounded-md transition-all",
      active: "bg-white text-mono-black font-medium shadow-sm",
      inactive: "text-mono-600 hover:text-mono-900",
    },
    underline: {
      container: "",
      tab: "px-4 py-3 border-b-2 transition-colors",
      active: "border-mono-black text-mono-black font-medium",
      inactive:
        "border-transparent text-mono-500 hover:text-mono-700 hover:border-mono-300",
    },
  };

  const activeItem = items.find((item) => item.id === activeTab);

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div
        className={`flex ${fullWidth ? "" : "inline-flex"} ${
          variants[variant].container
        }`}
      >
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => !item.disabled && onChange(item.id)}
            disabled={item.disabled}
            className={`
              ${fullWidth ? "flex-1" : ""}
              ${variants[variant].tab}
              ${
                activeTab === item.id
                  ? variants[variant].active
                  : variants[variant].inactive
              }
              ${
                item.disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }
              flex items-center justify-center gap-2
            `}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">{activeItem?.content}</div>
    </div>
  );
};

export default Tabs;
