import { useState, useEffect } from "react";
import {
  FaTruck,
  FaUserCheck,
  FaUserTimes,
  FaMapMarkerAlt,
} from "react-icons/fa";
import ShipperService from "../../../services/ShipperService";
import type { Shipper } from "../../../types/shipper";
import AssignOrderModal from "../../../components/Admin/Shipper/AssignOrderModal";
import ShipperDetailModal from "../../../components/Admin/Shipper/ShipperDetailModal";

const ShipperPage = () => {
  const [shippers, setShippers] = useState<Shipper[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAvailable, setFilterAvailable] = useState<boolean | undefined>(
    undefined
  );
  const [selectedShipper, setSelectedShipper] = useState<Shipper | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchShippers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterAvailable]);

  const fetchShippers = async () => {
    try {
      setLoading(true);
      const response = await ShipperService.getShippers(filterAvailable);
      setShippers(response.data);
    } catch (error) {
      console.error("Error fetching shippers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (shipper: Shipper) => {
    setSelectedShipper(shipper);
    setShowDetailModal(true);
  };

  const handleAssignOrder = () => {
    setShowAssignModal(true);
  };

  const calculateSuccessRate = (stats: {
    totalDeliveries: number;
    successfulDeliveries: number;
  }) => {
    if (stats.totalDeliveries === 0) return 0;
    return ((stats.successfulDeliveries / stats.totalDeliveries) * 100).toFixed(
      1
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Shipper</h1>
        <button
          onClick={handleAssignOrder}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaTruck size={20} />
          Gán đơn hàng
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setFilterAvailable(undefined)}
            className={`px-4 py-2 rounded ${
              filterAvailable === undefined
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterAvailable(true)}
            className={`px-4 py-2 rounded ${
              filterAvailable === true
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Đang hoạt động
          </button>
          <button
            onClick={() => setFilterAvailable(false)}
            className={`px-4 py-2 rounded ${
              filterAvailable === false
                ? "bg-gray-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Không hoạt động
          </button>
        </div>
      </div>

      {/* Shipper Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Đang tải...
          </div>
        ) : shippers.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Không có shipper nào
          </div>
        ) : (
          shippers.map((shipper) => (
            <div
              key={shipper._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {/* Shipper Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    {shipper.avatar ? (
                      <img
                        src={shipper.avatar}
                        alt={shipper.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <FaTruck size={32} className="text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{shipper.name}</h3>
                    <p className="text-sm text-blue-100">{shipper.phone}</p>
                  </div>
                </div>
              </div>

              {/* Shipper Body */}
              <div className="p-6 space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Trạng thái</span>
                  {shipper.shipper.isAvailable ? (
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <FaUserCheck size={16} />
                      Đang hoạt động
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-600 font-medium">
                      <FaUserTimes size={16} />
                      Không hoạt động
                    </span>
                  )}
                </div>

                {/* Active Orders */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Đơn đang giao</span>
                  <span className="font-bold text-gray-900">
                    {shipper.shipper.activeOrders} / {shipper.shipper.maxOrders}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Tổng</div>
                    <div className="text-lg font-bold text-gray-900">
                      {shipper.shipper.deliveryStats.totalDeliveries}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Thành công</div>
                    <div className="text-lg font-bold text-green-600">
                      {shipper.shipper.deliveryStats.successfulDeliveries}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Thất bại</div>
                    <div className="text-lg font-bold text-red-600">
                      {shipper.shipper.deliveryStats.failedDeliveries}
                    </div>
                  </div>
                </div>

                {/* Success Rate */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      Tỷ lệ thành công
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {calculateSuccessRate(shipper.shipper.deliveryStats)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${calculateSuccessRate(
                          shipper.shipper.deliveryStats
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Location */}
                {shipper.shipper.currentLocation && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 pt-2">
                    <FaMapMarkerAlt size={16} />
                    <span>
                      Cập nhật:{" "}
                      {shipper.shipper.currentLocation.updatedAt
                        ? new Date(
                            shipper.shipper.currentLocation.updatedAt
                          ).toLocaleString("vi-VN")
                        : "N/A"}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <button
                  onClick={() => handleViewDetail(shipper)}
                  className="w-full mt-4 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg font-medium transition"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showAssignModal && (
        <AssignOrderModal
          shippers={shippers.filter((s) => s.shipper.isAvailable)}
          onClose={() => setShowAssignModal(false)}
          onSuccess={fetchShippers}
        />
      )}
      {showDetailModal && selectedShipper && (
        <ShipperDetailModal
          shipper={selectedShipper}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

export default ShipperPage;
