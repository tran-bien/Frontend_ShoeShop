import React from "react";
import Skeleton from "./Skeleton";

const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-soft overflow-hidden h-full flex flex-col border border-mono-100">
      {/* Image Skeleton */}
      <div className="aspect-square w-full bg-mono-50 relative">
        <Skeleton className="w-full h-full" animation="wave" />

        {/* Compare Button Skeleton */}
        <div className="absolute top-2 left-2 z-10">
          <Skeleton variant="circular" width={40} height={40} />
        </div>

        {/* Sale Tag Skeleton */}
        <div className="absolute top-2 right-2">
          <Skeleton width={60} height={28} />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 flex flex-col flex-1 space-y-3">
        {/* Brand */}
        <Skeleton variant="text" width="40%" height={14} />

        {/* Product Name */}
        <div className="space-y-2">
          <Skeleton variant="text" width="100%" height={16} />
          <Skeleton variant="text" width="80%" height={16} />
        </div>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Price */}
        <Skeleton variant="text" width="50%" height={20} />

        {/* Rating */}
        <div className="flex items-center gap-2">
          <Skeleton variant="text" width={100} height={16} />
          <Skeleton variant="text" width={40} height={16} />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;

