import { useState, useEffect } from "react";
import ShipperService, { Shipper } from "../../../services/ShipperService";

interface Props {
  shipper: Shipper;
  onClose: () => void;
}

const ShipperDetailModal = ({ shipper, onClose }: Props) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await ShipperService.getShipperStats(shipper._id);
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching shipper stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSuccessRate = () => {
    if (!stats || stats.totalOrders === 0) return 0;
    return ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa cập nhật";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            👤 Chi tiết Shipper
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Personal Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">
            Thông tin cá nhân
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Họ tên:</span>{" "}
              <strong>{shipper.name}</strong>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>{" "}
              <strong>{shipper.email}</strong>
            </div>
            <div>
              <span className="text-gray-600">Số điện thoại:</span>{" "}
              <strong>{shipper.phone}</strong>
            </div>
            <div>
              <span className="text-gray-600">Trạng thái:</span>{" "}
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  shipper.shipper.isAvailable
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {shipper.shipper.isAvailable
                  ? "✅ Đang hoạt động"
                  : "❌ Không hoạt động"}
              </span>
            </div>
          </div>
        </div>

        {/* Capacity Info */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">
            Công suất làm việc
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
            <div>
              <span className="text-gray-600">Đơn đang giao:</span>{" "}
              <strong className="text-blue-600">
                {shipper.shipper.activeOrders}
              </strong>
            </div>
            <div>
              <span className="text-gray-600">Giới hạn đơn:</span>{" "}
              <strong>{shipper.shipper.maxOrders}</strong>
            </div>
          </div>
          {/* Capacity Bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Công suất</span>
              <span>
                {(
                  (shipper.shipper.activeOrders / shipper.shipper.maxOrders) *
                  100
                ).toFixed(0)}
                %
              </span>
            </div>
            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${
                  (shipper.shipper.activeOrders / shipper.shipper.maxOrders) *
                    100 >=
                  80
                    ? "bg-red-500"
                    : (shipper.shipper.activeOrders /
                        shipper.shipper.maxOrders) *
                        100 >=
                      50
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{
                  width: `${
                    (shipper.shipper.activeOrders / shipper.shipper.maxOrders) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Location Info */}
        {shipper.shipper.currentLocation && (
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">
              📍 Vị trí hiện tại
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Vĩ độ:</span>{" "}
                <strong>{shipper.shipper.currentLocation.latitude}</strong>
              </div>
              <div>
                <span className="text-gray-600">Kinh độ:</span>{" "}
                <strong>{shipper.shipper.currentLocation.longitude}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Cập nhật lần cuối:</span>{" "}
                <strong>
                  {formatDate(shipper.shipper.currentLocation.updatedAt)}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        {loading ? (
          <div className="text-center py-6 text-gray-500">
            Đang tải thống kê...
          </div>
        ) : stats ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4">
              📊 Thống kê giao hàng
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-gray-600 text-xs mb-1">Tổng đơn</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalOrders || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-gray-600 text-xs mb-1">Thành công</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.completedOrders || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-gray-600 text-xs mb-1">Thất bại</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.failedOrders || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-gray-600 text-xs mb-1">Tỷ lệ thành công</p>
                <p className="text-2xl font-bold text-blue-600">
                  {getSuccessRate()}%
                </p>
              </div>
            </div>

            {/* Active Orders */}
            {stats.activeOrders > 0 && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ Đang có <strong>{stats.activeOrders}</strong> đơn hàng đang
                  giao
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-red-500">
            Không thể tải thống kê
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipperDetailModal;
