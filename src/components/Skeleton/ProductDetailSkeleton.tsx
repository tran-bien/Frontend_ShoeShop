import React from "react";
import Skeleton from "./Skeleton";

const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Skeleton */}
        <div className="mb-6 flex items-center gap-2">
          <Skeleton variant="text" width={60} height={16} />
          <Skeleton variant="text" width={20} height={16} />
          <Skeleton variant="text" width={80} height={16} />
          <Skeleton variant="text" width={20} height={16} />
          <Skeleton variant="text" width={120} height={16} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square w-full bg-mono-50 rounded-lg overflow-hidden">
              <Skeleton className="w-full h-full" animation="wave" />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-5 gap-2">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="aspect-square">
                  <Skeleton className="w-full h-full" animation="wave" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Brand */}
            <Skeleton variant="text" width={100} height={16} />

            {/* Product Name */}
            <div className="space-y-2">
              <Skeleton variant="text" width="100%" height={32} />
              <Skeleton variant="text" width="80%" height={32} />
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-4">
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="text" width={80} height={20} />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Skeleton variant="text" width={150} height={36} />
              <Skeleton variant="text" width={100} height={20} />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Skeleton variant="text" width="100%" height={16} />
              <Skeleton variant="text" width="95%" height={16} />
              <Skeleton variant="text" width="90%" height={16} />
              <Skeleton variant="text" width="85%" height={16} />
            </div>

            {/* Colors */}
            <div className="space-y-3">
              <Skeleton variant="text" width={80} height={20} />
              <div className="flex gap-2">
                {[...Array(5)].map((_, idx) => (
                  <Skeleton
                    key={idx}
                    variant="circular"
                    width={40}
                    height={40}
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-3">
              <Skeleton variant="text" width={60} height={20} />
              <div className="grid grid-cols-6 gap-2">
                {[...Array(6)].map((_, idx) => (
                  <Skeleton key={idx} width="100%" height={44} />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <Skeleton variant="text" width={80} height={20} />
              <Skeleton width={120} height={44} />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Skeleton width="100%" height={48} />
              <Skeleton width={48} height={48} />
            </div>

            {/* Additional Info */}
            <div className="space-y-2 pt-4 border-t border-mono-200">
              <Skeleton variant="text" width="100%" height={16} />
              <Skeleton variant="text" width="90%" height={16} />
              <Skeleton variant="text" width="85%" height={16} />
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-16">
          <Skeleton variant="text" width={200} height={32} className="mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg shadow-soft overflow-hidden border border-mono-100"
              >
                <Skeleton className="aspect-square w-full" animation="wave" />
                <div className="p-4 space-y-2">
                  <Skeleton variant="text" width="100%" height={16} />
                  <Skeleton variant="text" width="60%" height={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;

