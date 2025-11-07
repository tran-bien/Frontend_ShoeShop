import React from "react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionLink?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  actionLink,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
    >
      {/* Icon */}
      {icon && (
        <div className="mb-6 text-mono-400 flex items-center justify-center">
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className="text-2xl font-bold text-mono-900 mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-mono-600 mb-8 max-w-md leading-relaxed">
          {description}
        </p>
      )}

      {/* Action Button */}
      {actionLabel && (actionLink || onAction) && (
        <>
          {actionLink ? (
            <Link
              to={actionLink}
              className="inline-block bg-mono-black text-white px-6 py-3 rounded-lg hover:bg-mono-800 transition-colors font-medium"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="bg-mono-black text-white px-6 py-3 rounded-lg hover:bg-mono-800 transition-colors font-medium"
            >
              {actionLabel}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default EmptyState;
