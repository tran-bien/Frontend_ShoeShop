import { useState, useEffect } from "react";
import { adminShipperService } from "../../../services/ShipperService";
import type { Shipper } from "../../../types/shipper";

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
      const response = await adminShipperService.getShipperStats(shipper._id);
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
          <h2 className="text-2xl font-bold text-mono-800">
            ?? Chi tiết Shipper
          </h2>
          <button
            onClick={onClose}
            className="text-mono-500 hover:text-mono-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Personal Info */}
        <div className="bg-mono-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-mono-800 mb-3">
            Thông tin cá nhân
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-mono-600">Họ tên:</span>{" "}
              <strong>{shipper.name}</strong>
            </div>
            <div>
              <span className="text-mono-600">Email:</span>{" "}
              <strong>{shipper.email}</strong>
            </div>
            <div>
              <span className="text-mono-600">Số điện thoại:</span>{" "}
              <strong>{shipper.phone}</strong>
            </div>
            <div>
              <span className="text-mono-600">Trạng thái:</span>{" "}
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  shipper.shipper.isAvailable
                    ? "bg-mono-100 text-mono-800"
                    : "bg-mono-200 text-mono-900"
                }`}
              >
                {shipper.shipper.isAvailable
                  ? "🟢 Đang hoạt động"
                  : "🔴 Không hoạt động"}
              </span>
            </div>
          </div>
        </div>

        {/* Capacity Info */}
        <div className="bg-mono-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-mono-800 mb-3">
            Công su?t làm vi?c
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
            <div>
              <span className="text-mono-600">Đơn đang giao:</span>{" "}
              <strong className="text-mono-black">
                {shipper.shipper.activeOrders}
              </strong>
            </div>
            <div>
              <span className="text-mono-600">Giới hạn đơn:</span>{" "}
              <strong>{shipper.shipper.maxOrders}</strong>
            </div>
          </div>
          {/* Capacity Bar */}
          <div>
            <div className="flex justify-between text-xs text-mono-600 mb-1">
              <span>Công su?t</span>
              <span>
                {(
                  (shipper.shipper.activeOrders / shipper.shipper.maxOrders) *
                  100
                ).toFixed(0)}
                %
              </span>
            </div>
            <div className="bg-mono-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${
                  (shipper.shipper.activeOrders / shipper.shipper.maxOrders) *
                    100 >=
                  80
                    ? "bg-mono-800"
                    : (shipper.shipper.activeOrders /
                        shipper.shipper.maxOrders) *
                        100 >=
                      50
                    ? "bg-mono-1000"
                    : "bg-mono-700"
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
          <div className="bg-mono-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-mono-800 mb-3">
              📍 Vị trí hiện tại
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-mono-600">Vĩ độ:</span>{" "}
                <strong>{shipper.shipper.currentLocation.latitude}</strong>
              </div>
              <div>
                <span className="text-mono-600">Kinh độ:</span>{" "}
                <strong>{shipper.shipper.currentLocation.longitude}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-mono-600">Cập nhật lần cuối:</span>{" "}
                <strong>
                  {formatDate(shipper.shipper.currentLocation.updatedAt)}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        {loading ? (
          <div className="text-center py-6 text-mono-500">
            Ðang tại thàng kê...
          </div>
        ) : stats ? (
          <div className="bg-mono-50 rounded-lg p-4">
            <h3 className="font-semibold text-mono-800 mb-4">
              📊 Thống kê giao hàng
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-mono-600 text-xs mb-1">Tổng đơn</p>
                <p className="text-2xl font-bold text-mono-800">
                  {stats.totalOrders || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-mono-600 text-xs mb-1">Thành công</p>
                <p className="text-2xl font-bold text-mono-800">
                  {stats.completedOrders || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-mono-600 text-xs mb-1">Thất bại</p>
                <p className="text-2xl font-bold text-mono-900">
                  {stats.failedOrders || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-mono-600 text-xs mb-1">Tỷ lệ thành công</p>
                <p className="text-2xl font-bold text-mono-black">
                  {getSuccessRate()}%
                </p>
              </div>
            </div>

            {/* Active Orders */}
            {stats.activeOrders > 0 && (
              <div className="mt-4 bg-mono-100 border border-mono-200 rounded-lg p-3">
                <p className="text-sm text-mono-800">
                  📦 Đang có <strong>{stats.activeOrders}</strong> đơn hàng đang
                  giao
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-mono-800">
            Không thể tại thàng kê
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-mono-200 rounded-lg hover:bg-mono-300 font-medium"
          >
            Ðóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipperDetailModal;
