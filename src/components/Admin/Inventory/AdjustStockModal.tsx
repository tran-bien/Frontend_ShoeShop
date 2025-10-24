import { useState } from "react";
import InventoryService from "../../../services/InventoryService";
import type { InventoryItem } from "../../../types/inventory";

interface Props {
  item: InventoryItem;
  onClose: () => void;
  onSuccess: () => void;
}

const AdjustStockModal = ({ item, onClose, onSuccess }: Props) => {
  const [formData, setFormData] = useState({
    newQuantity: item.quantity,
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.newQuantity < 0) {
      setError("Số lượng mới không được âm");
      return;
    }

    if (!formData.reason.trim()) {
      setError("Vui lòng nhập lý do điều chỉnh");
      return;
    }

    if (formData.reason.trim().length < 10) {
      setError("Lý do phải có ít nhất 10 ký tự");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await InventoryService.adjustStock({
        productId: item.product?._id || "",
        variantId: item.variant?._id || "",
        sizeId: item.size?._id || "",
        newQuantity: formData.newQuantity,
        reason: formData.reason,
      });
      alert("Điều chỉnh tồn kho thành công!");
      onSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const getDifference = () => {
    return formData.newQuantity - item.quantity;
  };

  const getDifferenceColor = () => {
    const diff = getDifference();
    if (diff > 0) return "text-green-600";
    if (diff < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          🔧 Điều chỉnh tồn kho - {item.product?.name}
        </h2>

        {/* Product Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Màu sắc:</span>
            <strong>{item.variant?.colorName || "N/A"}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Kích thước:</span>
            <strong>{item.size?.name || "N/A"}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tồn kho hiện tại:</span>
            <strong className="text-blue-600">{item.quantity}</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Quantity */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Số lượng mới <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.newQuantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  newQuantity: parseInt(e.target.value) || 0,
                })
              }
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              required
            />
            {getDifference() !== 0 && (
              <p className={`mt-1 text-xs font-medium ${getDifferenceColor()}`}>
                {getDifference() > 0 ? "+" : ""}
                {getDifference()} ({getDifference() > 0 ? "Tăng" : "Giảm"})
              </p>
            )}
          </div>

          {/* Comparison */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <p className="text-gray-600 text-xs mb-1">Hiện tại</p>
                <p className="font-bold text-gray-800">{item.quantity}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Thay đổi</p>
                <p className={`font-bold ${getDifferenceColor()}`}>
                  {getDifference() > 0 ? "+" : ""}
                  {getDifference()}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Mới</p>
                <p className="font-bold text-blue-600">
                  {formData.newQuantity}
                </p>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Lý do điều chỉnh <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Ví dụ: Kiểm kê phát hiện sai lệch, hàng hỏng, mất mát..."
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Tối thiểu 10 ký tự ({formData.reason.length}/10)
            </p>
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
              disabled={loading || getDifference() === 0}
              className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? "Đang xử lý..." : "✅ Điều chỉnh"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 py-3 rounded-lg hover:bg-gray-300 font-medium transition-colors"
            >
              ❌ Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustStockModal;
