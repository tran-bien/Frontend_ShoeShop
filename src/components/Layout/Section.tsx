import React from "react";

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  background?: "white" | "gray" | "dark";
  padding?: "sm" | "md" | "lg" | "xl";
  titleAlign?: "left" | "center";
  className?: string;
  headerActions?: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({
  children,
  title,
  subtitle,
  background = "white",
  padding = "lg",
  titleAlign = "left",
  className = "",
  headerActions,
}) => {
  const backgrounds = {
    white: "bg-white",
    gray: "bg-mono-50",
    dark: "bg-mono-900 text-white",
  };

  const paddings = {
    sm: "py-8",
    md: "py-12",
    lg: "py-16",
    xl: "py-24",
  };

  const alignments = {
    left: "text-left",
    center: "text-center",
  };

  return (
    <section
      className={`${backgrounds[background]} ${paddings[padding]} ${className}`}
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        {(title || subtitle) && (
          <div
            className={`mb-10 ${alignments[titleAlign]} ${
              headerActions ? "flex items-end justify-between" : ""
            }`}
          >
            <div>
              {title && (
                <h2
                  className={`text-3xl md:text-4xl font-bold tracking-tight ${
                    background === "dark" ? "text-white" : "text-mono-900"
                  }`}
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p
                  className={`mt-3 text-lg max-w-2xl ${
                    titleAlign === "center" ? "mx-auto" : ""
                  } ${
                    background === "dark" ? "text-mono-300" : "text-mono-600"
                  }`}
                >
                  {subtitle}
                </p>
              )}
            </div>
            {headerActions && <div>{headerActions}</div>}
          </div>
        )}

        {/* Section Content */}
        {children}
      </div>
    </section>
  );
};

export default Section;
