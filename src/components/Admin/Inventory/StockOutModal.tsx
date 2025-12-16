import { useState } from "react";
import InventoryService from "../../../services/InventoryService";
import type { InventoryItem } from "../../../types/inventory";

interface Props {
  item: InventoryItem;
  onClose: () => void;
  onSuccess: () => void;
}

// Các lý do xuất kho (theo logic BE)
const STOCKOUT_REASONS = [
  { value: "sale", label: "Bán hàng" },
  { value: "damage", label: "Hàng hư hỏng" },
  { value: "lost", label: "Hàng mất mát" },
  { value: "return_supplier", label: "Trả hàng nhà cung cấp" },
  { value: "gift", label: "Hàng tặng/khuyến mãi" },
  { value: "other", label: "Lý do khác" },
];

const StockOutModal = ({ item, onClose, onSuccess }: Props) => {
  const [formData, setFormData] = useState({
    quantity: 0,
    reason: "sale", // Default reason
    note: "",
    orderId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.quantity <= 0) {
      setError("Số lượng phải lớn hơn 0");
      return;
    }

    if (formData.quantity > item.quantity) {
      setError(`Số lượng xuất không được vượt quá tồn kho (${item.quantity})`);
      return;
    }

    try {
      setLoading(true);
      setError("");
      await InventoryService.stockOut({
        productId: item.product?._id || "",
        variantId: item.variant?._id || "",
        sizeId: item.size?._id || "",
        quantity: formData.quantity,
        reason: formData.reason,
        notes: formData.note || undefined,
        orderId: formData.orderId || undefined,
      });
      alert("Xuất kho thành công!");
      onSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-mono-800">
          Xuất kho - {item.product?.name}
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
          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium mb-2 text-mono-700">
              Số lượng xuất <span className="text-mono-800">*</span>
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantity: parseInt(e.target.value) || 0,
                })
              }
              className="w-full border border-mono-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
              min="1"
              max={item.quantity}
              required
            />
            {formData.quantity > 0 && (
              <p className="mt-1 text-xs text-mono-500">
                Tên sau xuất:{" "}
                <strong>{item.quantity - formData.quantity}</strong>
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium mb-2 text-mono-700">
              Lý do xuất kho <span className="text-mono-800">*</span>
            </label>
            <select
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              className="w-full border border-mono-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
              required
            >
              {STOCKOUT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Order ID (optional) */}
          <div>
            <label className="block text-sm font-medium mb-2 text-mono-700">
              Mã đơn hàng (nếu có)
            </label>
            <input
              type="text"
              value={formData.orderId}
              onChange={(e) =>
                setFormData({ ...formData, orderId: e.target.value })
              }
              className="w-full border border-mono-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
              placeholder="Nhập mã đơn hàng"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium mb-2 text-mono-700">
              Ghi chú bổ sung
            </label>
            <textarea
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              className="w-full border border-mono-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
              rows={2}
              placeholder="Thông tin chi tiết (tùy chọn)"
            />
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
              disabled={loading}
              className="flex-1 bg-mono-black text-white py-3 rounded-lg hover:bg-mono-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? "Ðang xử lý..." : "Xuất kho"}
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

export default StockOutModal;
