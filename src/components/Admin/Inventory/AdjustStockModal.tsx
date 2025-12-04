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
      setError("Vui lòng nhập lý đo di?u chơnh");
      return;
    }

    if (formData.reason.trim().length < 10) {
      setError("Lý đo ph?i có ít nh?t 10 ký t?");
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
      alert("Ði?u chơnh tên kho thành công!");
      onSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Có lỗi x?y ra");
    } finally {
      setLoading(false);
    }
  };

  const getDifference = () => {
    return formData.newQuantity - item.quantity;
  };

  const getDifferenceColor = () => {
    const diff = getDifference();
    if (diff > 0) return "text-mono-800";
    if (diff < 0) return "text-mono-900";
    return "text-mono-600";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-mono-800">
          Ði?u chơnh tên kho - {item.product?.name}
        </h2>

        {/* Product Info */}
        <div className="bg-mono-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-mono-600">Màu sắc:</span>
            <strong>{item.variant?.colorName || "N/A"}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-mono-600">Kích thước:</span>
            <strong>{item.size?.name || "N/A"}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-mono-600">Tên kho hiện tại:</span>
            <strong className="text-mono-black">{item.quantity}</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Quantity */}
          <div>
            <label className="block text-sm font-medium mb-2 text-mono-700">
              Số lượng mới <span className="text-mono-800">*</span>
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
              className="w-full border border-mono-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
              min="0"
              required
            />
            {getDifference() !== 0 && (
              <p className={`mt-1 text-xs font-medium ${getDifferenceColor()}`}>
                {getDifference() > 0 ? "+" : ""}
                {getDifference()} ({getDifference() > 0 ? "Tang" : "Giảm"})
              </p>
            )}
          </div>

          {/* Comparison */}
          <div className="bg-mono-50 border border-mono-200 rounded-lg p-3">
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <p className="text-mono-600 text-xs mb-1">Hiện tại</p>
                <p className="font-bold text-mono-800">{item.quantity}</p>
              </div>
              <div>
                <p className="text-mono-600 text-xs mb-1">Thay đổi</p>
                <p className={`font-bold ${getDifferenceColor()}`}>
                  {getDifference() > 0 ? "+" : ""}
                  {getDifference()}
                </p>
              </div>
              <div>
                <p className="text-mono-600 text-xs mb-1">Mới</p>
                <p className="font-bold text-mono-black">
                  {formData.newQuantity}
                </p>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium mb-2 text-mono-700">
              Lý đo di?u chơnh <span className="text-mono-800">*</span>
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              className="w-full border border-mono-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
              rows={3}
              placeholder="Ví d?: Ki?m kê phát hiện sai lọch, hàng hàng, m?t mát..."
              required
            />
            <p className="mt-1 text-xs text-mono-500">
              Tại thi?u 10 ký từ ({formData.reason.length}/10)
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-mono-100 border border-mono-300 text-mono-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={loading || getDifference() === 0}
              className="flex-1 bg-mono-700 text-white py-3 rounded-lg hover:bg-mono-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? "Ðang xử lý..." : "Ði?u chơnh"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-mono-200 py-3 rounded-lg hover:bg-mono-300 font-medium transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustStockModal;




