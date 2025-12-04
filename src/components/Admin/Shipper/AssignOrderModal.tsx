import { useState, useEffect } from "react";
import { adminShipperService } from "../../../services/ShipperService";
import type { Shipper } from "../../../types/shipper";

interface Props {
  shippers: Shipper[];
  onClose: () => void;
  onSuccess: () => void;
}

const AssignOrderModal = ({ shippers, onClose, onSuccess }: Props) => {
  const [formData, setFormData] = useState({
    orderId: "",
    shipperId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableShippers, setAvailableShippers] = useState<Shipper[]>([]);

  useEffect(() => {
    // Filter only available shippers who haven't reached maxOrders
    const filtered = shippers.filter(
      (s) =>
        s.shipper.isAvailable && s.shipper.activeOrders < s.shipper.maxOrders
    );
    setAvailableShippers(filtered);
  }, [shippers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.orderId.trim()) {
      setError("Vui lòng nh?p mã don hàng");
      return;
    }

    if (!formData.shipperId) {
      setError("Vui lòng ch?n shipper");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await adminShipperService.assignOrderToShipper(formData.orderId, {
        shipperId: formData.shipperId,
      });
      alert("Gán don hàng cho shipper thành công!");
      onSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Có l?i x?y ra");
    } finally {
      setLoading(false);
    }
  };

  const getShipperCapacity = (shipper: Shipper) => {
    const percentage =
      (shipper.shipper.activeOrders / shipper.shipper.maxOrders) * 100;
    return percentage;
  };

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 80) return "bg-red-200 text-red-800";
    if (percentage >= 50) return "bg-yellow-200 text-yellow-800";
    return "bg-green-200 text-green-800";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-xl font-bold mb-4 text-mono-800">
          ?? Gán don hàng cho Shipper
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Order ID */}
          <div>
            <label className="block text-sm font-medium mb-2 text-mono-700">
              Mã don hàng <span className="text-mono-800">*</span>
            </label>
            <input
              type="text"
              value={formData.orderId}
              onChange={(e) =>
                setFormData({ ...formData, orderId: e.target.value })
              }
              className="w-full border border-mono-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
              placeholder="Nh?p ID ho?c mã don hàng"
              required
            />
          </div>

          {/* Shipper Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-mono-700">
              Ch?n Shipper <span className="text-mono-800">*</span>
            </label>

            {availableShippers.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                ?? Không có shipper kh? d?ng. T?t c? shipper dang b?n ho?c dã
                d?t gi?i h?n don hàng.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto border border-mono-200 rounded-lg p-2">
                {availableShippers.map((shipper) => {
                  const capacity = getShipperCapacity(shipper);
                  return (
                    <label
                      key={shipper._id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-mono-50 ${
                        formData.shipperId === shipper._id
                          ? "border-mono-500 bg-mono-50"
                          : "border-mono-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipper"
                        value={shipper._id}
                        checked={formData.shipperId === shipper._id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            shipperId: e.target.value,
                          })
                        }
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-mono-800">
                              {shipper.name}
                            </p>
                            <p className="text-sm text-mono-600">
                              {shipper.phone}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded ${getCapacityColor(
                                capacity
                              )}`}
                            >
                              {shipper.shipper.activeOrders}/
                              {shipper.shipper.maxOrders} don
                            </span>
                            <p className="text-xs text-mono-500 mt-1">
                              {
                                shipper.shipper.deliveryStats
                                  .successfulDeliveries
                              }{" "}
                              thành công
                            </p>
                          </div>
                        </div>

                        {/* Capacity Bar */}
                        <div className="mt-2">
                          <div className="bg-mono-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full ${
                                capacity >= 80
                                  ? "bg-mono-800"
                                  : capacity >= 50
                                  ? "bg-yellow-500"
                                  : "bg-mono-700"
                              }`}
                              style={{ width: `${capacity}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={loading || availableShippers.length === 0}
              className="flex-1 bg-mono-black text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? "Ðang x? lý..." : "Gán don hàng"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-mono-200 py-3 rounded-lg hover:bg-mono-300 font-medium transition-colors"
            >
              H?y
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignOrderModal;
