import React from "react";
import ProductCardSkeleton from "./ProductCardSkeleton";
import Skeleton from "./Skeleton";

interface ProductListSkeletonProps {
  count?: number;
  showFilters?: boolean;
}

const ProductListSkeleton: React.FC<ProductListSkeletonProps> = ({
  count = 12,
  showFilters = true,
}) => {
  return (
    <div className="min-h-screen bg-mono-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <Skeleton variant="text" width={300} height={36} className="mb-4" />
          <div className="flex items-center justify-between">
            <Skeleton variant="text" width={150} height={20} />
            <Skeleton width={200} height={40} />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          {showFilters && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-soft p-6 space-y-6">
                {/* Filter Title */}
                <Skeleton variant="text" width={100} height={24} />

                {/* Filter Groups */}
                {[...Array(4)].map((_, groupIdx) => (
                  <div key={groupIdx} className="space-y-3">
                    <Skeleton variant="text" width="60%" height={20} />
                    <div className="space-y-2">
                      {[...Array(5)].map((_, itemIdx) => (
                        <div key={itemIdx} className="flex items-center gap-2">
                          <Skeleton
                            variant="rectăngular"
                            width={16}
                            height={16}
                          />
                          <Skeleton variant="text" width="80%" height={16} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Price Range */}
                <div className="space-y-3">
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton width="100%" height={40} />
                </div>

                {/* Apply Button */}
                <Skeleton width="100%" height={44} />
              </div>
            </aside>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-soft p-4">
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton width={180} height={36} />
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(count)].map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, idx) => (
                  <Skeleton key={idx} width={40} height={40} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListSkeleton;

