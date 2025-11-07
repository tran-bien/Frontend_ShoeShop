import { useState, useEffect, useCallback } from "react";
import { XMarkIcon, CubeIcon, TagIcon } from "@heroicons/react/24/outline";
import { adminInventoryService } from "../../../services/InventoryService";
import type { InventoryItem } from "../../../types/inventory";
import { toast } from "react-hot-toast";

interface InventoryDetailModalProps {
  itemId: string;
  onClose: () => void;
  onUpdate?: () => void;
}

const InventoryDetailModal = ({
  itemId,
  onClose,
  onUpdate,
}: InventoryDetailModalProps) => {
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await adminInventoryService.getInventoryDetail(itemId);
      const itemData = data.data as InventoryItem;
      setItem(itemData);
      setLowStockThreshold(itemData.lowStockThreshold || 10);
    } catch (error) {
      console.error("Error fetching inventory detail:", error);
      toast.error("Không thể tải thông tin chi tiết");
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleUpdateThreshold = async () => {
    if (!item) return;

    try {
      setUpdating(true);
      await adminInventoryService.updateLowStockThreshold(
        item._id,
        lowStockThreshold
      );
      toast.success("Cập nhật ngưỡng cảnh báo thành công");
      onUpdate?.();
      fetchDetail();
    } catch (error) {
      console.error("Error updating threshold:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Không thể cập nhật ngưỡng cảnh báo"
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-3 border-mono-200 border-t-mono-black rounded-full animate-spin" />
            <span className="text-mono-700">Đang tải...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <p className="text-mono-700">Không tìm thấy thông tin</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-mono-200 rounded-lg hover:bg-mono-300"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-mono-800 to-mono-900 text-white p-6 rounded-t-xl border-b border-mono-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg">
                <CubeIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Chi tiết tồn kho</h2>
                <p className="text-sm text-mono-200 mt-1">
                  SKU: {item.sku || "N/A"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/10 rounded-lg p-2 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Info */}
          <div className="bg-mono-50 border border-mono-200 rounded-lg p-4">
            <h3 className="text-lg font-bold text-mono-900 mb-4 flex items-center gap-2">
              <TagIcon className="w-5 h-5" />
              Thông tin sản phẩm
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-mono-600">Sản phẩm:</p>
                <p className="font-semibold text-mono-900">
                  {item.product?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-mono-600">Màu sắc:</p>
                <div className="flex items-center gap-2">
                  {item.variant?.color?.hexCode && (
                    <div
                      className="w-5 h-5 rounded-full border-2 border-mono-300"
                      style={{
                        backgroundColor: item.variant.color.hexCode,
                      }}
                    />
                  )}
                  <p className="font-semibold text-mono-900">
                    {item.variant?.color?.name || "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-mono-600">Size:</p>
                <p className="font-semibold text-mono-900">
                  {item.size?.value || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-mono-600">Giới tính:</p>
                <p className="font-semibold text-mono-900 capitalize">
                  {item.variant?.gender || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Inventory Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border-2 border-mono-200 rounded-lg p-4">
              <p className="text-sm text-mono-600 mb-1">Tồn kho hiện tại</p>
              <p className="text-3xl font-bold text-mono-900">
                {item.quantity}
              </p>
            </div>
            <div className="bg-white border-2 border-mono-200 rounded-lg p-4">
              <p className="text-sm text-mono-600 mb-1">Giá vốn gần nhất</p>
              <p className="text-lg font-bold text-mono-900">
                {item.costPrice?.toLocaleString("vi-VN")}₫
              </p>
            </div>
            <div className="bg-white border-2 border-mono-200 rounded-lg p-4">
              <p className="text-sm text-mono-600 mb-1">Giá vốn TB</p>
              <p className="text-lg font-bold text-mono-900">
                {item.averageCostPrice?.toLocaleString("vi-VN")}₫
              </p>
            </div>
          </div>

          {/* Pricing Info */}
          {item.sellingPrice && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-bold text-mono-900 mb-3">
                Thông tin giá bán
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-mono-600 mb-1">Giá bán gốc</p>
                  <p className="text-lg font-bold text-mono-900">
                    {item.sellingPrice.toLocaleString("vi-VN")}₫
                  </p>
                </div>
                <div>
                  <p className="text-sm text-mono-600 mb-1">Giảm giá</p>
                  <p className="text-lg font-bold text-orange-600">
                    {item.percentDiscount || 0}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-mono-600 mb-1">Giá sau giảm</p>
                  <p className="text-lg font-bold text-green-600">
                    {item.finalPrice?.toLocaleString("vi-VN")}₫
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Low Stock Threshold */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-bold text-mono-900 mb-3">
              Ngưỡng cảnh báo tồn kho thấp
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm text-mono-600 mb-2">
                  Số lượng cảnh báo
                </label>
                <input
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) =>
                    setLowStockThreshold(parseInt(e.target.value) || 0)
                  }
                  className="w-full border border-mono-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
                  min="0"
                />
              </div>
              <button
                onClick={handleUpdateThreshold}
                disabled={
                  updating || lowStockThreshold === item.lowStockThreshold
                }
                className="mt-6 px-6 py-2 bg-mono-black text-white rounded-lg hover:bg-mono-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updating ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
            <p className="text-xs text-mono-600 mt-2">
              Hệ thống sẽ cảnh báo khi tồn kho ≤ {lowStockThreshold}
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            {item.isOutOfStock ? (
              <span className="px-6 py-3 text-lg font-bold text-red-800 bg-red-100 rounded-lg border-2 border-red-300">
                ⚠️ Hết hàng
              </span>
            ) : item.isLowStock ? (
              <span className="px-6 py-3 text-lg font-bold text-orange-800 bg-orange-100 rounded-lg border-2 border-orange-300">
                ⚠️ Tồn kho thấp
              </span>
            ) : (
              <span className="px-6 py-3 text-lg font-bold text-green-800 bg-green-100 rounded-lg border-2 border-green-300">
                ✓ Tình trạng bình thường
              </span>
            )}
          </div>

          {/* Timestamps */}
          <div className="bg-mono-50 border border-mono-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-mono-600">Ngày tạo:</p>
                <p className="font-semibold text-mono-900">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString("vi-VN")
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-mono-600">Cập nhật lần cuối:</p>
                <p className="font-semibold text-mono-900">
                  {item.updatedAt
                    ? new Date(item.updatedAt).toLocaleString("vi-VN")
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-mono-200 p-4 bg-mono-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-mono-200 text-mono-900 rounded-lg hover:bg-mono-300 font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryDetailModal;
