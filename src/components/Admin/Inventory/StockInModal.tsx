import { useState } from "react";
import InventoryService from "../../../services/InventoryService";

interface StockInModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const StockInModal = ({ onClose, onSuccess }: StockInModalProps) => {
  const [formData, setFormData] = useState({
    productId: "",
    variantId: "",
    sizeId: "",
    quantity: 0,
    costPrice: 0,
    note: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await InventoryService.stockIn(formData);
      alert("Nhập kho thành công!");
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Nhập kho</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product ID</label>
            <input
              type="text"
              value={formData.productId}
              onChange={(e) =>
                setFormData({ ...formData, productId: e.target.value })
              }
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Variant ID</label>
            <input
              type="text"
              value={formData.variantId}
              onChange={(e) =>
                setFormData({ ...formData, variantId: e.target.value })
              }
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Size ID</label>
            <input
              type="text"
              value={formData.sizeId}
              onChange={(e) =>
                setFormData({ ...formData, sizeId: e.target.value })
              }
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Số lượng</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: parseInt(e.target.value) })
              }
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Giá vốn</label>
            <input
              type="number"
              value={formData.costPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  costPrice: parseInt(e.target.value),
                })
              }
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú</label>
            <textarea
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              className="w-full border px-3 py-2 rounded"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Nhập kho"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 py-2 rounded hover:bg-gray-300"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockInModal;
