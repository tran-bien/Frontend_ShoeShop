import React from "react";
import Skeleton from "./Skeleton";

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <Skeleton variant="text" width={250} height={32} className="mb-2" />
        <Skeleton variant="text" width={180} height={20} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg shadow-soft p-6 border border-mono-100"
          >
            <div className="flex items-center justify-between mb-4">
              <Skeleton variant="text" width={100} height={16} />
              <Skeleton variant="circular" width={40} height={40} />
            </div>
            <Skeleton variant="text" width={120} height={36} className="mb-2" />
            <Skeleton variant="text" width={80} height={16} />
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton variant="text" width={150} height={24} />
            <Skeleton width={120} height={36} />
          </div>
          <Skeleton width="100%" height={300} animation="wave" />
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton variant="text" width={150} height={24} />
            <Skeleton width={120} height={36} />
          </div>
          <Skeleton width="100%" height={300} animation="wave" />
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton variant="text" width={180} height={24} />
          <Skeleton width={100} height={36} />
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 pb-4 border-b border-mono-200 mb-4">
          {[...Array(5)].map((_, idx) => (
            <Skeleton key={idx} variant="text" width="80%" height={16} />
          ))}
        </div>

        {/* Table Rows */}
        {[...Array(5)].map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="grid grid-cols-5 gap-4 py-4 border-b border-mono-100"
          >
            {[...Array(5)].map((_, colIdx) => (
              <Skeleton key={colIdx} variant="text" width="90%" height={16} />
            ))}
          </div>
        ))}

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <Skeleton variant="text" width={120} height={16} />
          <div className="flex gap-2">
            {[...Array(5)].map((_, idx) => (
              <Skeleton key={idx} width={36} height={36} />
            ))}
          </div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <Skeleton variant="text" width={150} height={24} className="mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <Skeleton
                  className="w-16 h-16 flex-shrink-0"
                  animation="wave"
                />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" width="100%" height={16} />
                  <Skeleton variant="text" width="60%" height={14} />
                </div>
                <Skeleton variant="text" width={60} height={20} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <Skeleton variant="text" width={150} height={24} className="mb-6" />
          <div className="space-y-4">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="flex gap-4">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" width="100%" height={16} />
                  <Skeleton variant="text" width="70%" height={14} />
                  <Skeleton variant="text" width="40%" height={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;

