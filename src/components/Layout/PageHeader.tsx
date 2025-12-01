import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumb,
  actions,
  className = "",
}) => {
  return (
    <div className={`bg-mono-50 border-b border-mono-200 ${className}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        {breadcrumb && <div className="mb-4">{breadcrumb}</div>}

        {/* Header Content */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-mono-900 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-mono-600 text-lg">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
