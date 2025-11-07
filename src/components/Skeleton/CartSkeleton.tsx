import React from "react";
import Skeleton from "./Skeleton";

const CartSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-mono-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Skeleton variant="text" width={200} height={36} className="mb-2" />
          <Skeleton variant="text" width={150} height={20} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg shadow-soft p-4 md:p-6"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Skeleton
                    className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0"
                    animation="wave"
                  />

                  {/* Product Details */}
                  <div className="flex-1 space-y-3">
                    {/* Product Name */}
                    <Skeleton variant="text" width="80%" height={20} />
                    <Skeleton variant="text" width="60%" height={16} />

                    {/* Variant Info */}
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <Skeleton variant="circular" width={24} height={24} />
                        <Skeleton variant="text" width={60} height={16} />
                      </div>
                      <Skeleton variant="text" width={60} height={16} />
                    </div>

                    {/* Price & Quantity */}
                    <div className="flex items-center justify-between">
                      <Skeleton variant="text" width={100} height={24} />
                      <Skeleton width={120} height={36} />
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Skeleton variant="circular" width={32} height={32} />
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-soft p-6 sticky top-4">
              {/* Title */}
              <Skeleton
                variant="text"
                width={150}
                height={24}
                className="mb-6"
              />

              {/* Summary Items */}
              <div className="space-y-4 mb-6">
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <Skeleton variant="text" width={100} height={16} />
                    <Skeleton variant="text" width={80} height={16} />
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-mono-200 my-4" />

              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <Skeleton variant="text" width={80} height={24} />
                <Skeleton variant="text" width={120} height={28} />
              </div>

              {/* Coupon Input */}
              <Skeleton width="100%" height={44} className="mb-4" />

              {/* Checkout Button */}
              <Skeleton width="100%" height={48} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSkeleton;
