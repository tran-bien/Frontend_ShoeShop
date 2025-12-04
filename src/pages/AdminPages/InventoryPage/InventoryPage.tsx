import { useState, useEffect } from "react";
import {
  FaPlus,
  FaBox,
  FaChartLine,
  FaExclamationTriangle,
  FaDollarSign,
} from "react-icons/fa";
import InventoryService, {
  InventoryStats,
} from "../../../services/InventoryService";
import type { InventoryItem } from "../../../types/inventory";
import StockInModal from "../../../components/Admin/Inventory/StockInModal";
import StockOutModal from "../../../components/Admin/Inventory/StockOutModal";
import AdjustStockModal from "../../../components/Admin/Inventory/AdjustStockModal";
import TransactionHistoryModal from "../../../components/Admin/Inventory/TransactionHistoryModal";
import InventoryDetailModal from "../../../components/Admin/Inventory/InventoryDetailModal";

const InventoryPage = () => {
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    lowStock: false,
    outOfStock: false,
    productId: "",
  });

  // Modals
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showStockOutModal, setShowStockOutModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      console.log("Fetching inventory with params:", {
        page: currentPage,
        limit: 20,
        lowStock: filter.lowStock || undefined,
        outOfStock: filter.outOfStock || undefined,
        productId: filter.productId || undefined,
      });

      const response = await InventoryService.getInventoryList({
        page: currentPage,
        limit: 20,
        lowStock: filter.lowStock || undefined,
        outOfStock: filter.outOfStock || undefined,
        productId: filter.productId || undefined,
      });

      console.log("Inventory response:", response);

      // Response structure: { data: { success, data: { items, pagination } } }
      const responseData = response.data.data as unknown as {
        items: InventoryItem[];
        pagination: { totalPages: number };
      };
      const items = responseData?.items || [];
      const pages = responseData?.pagination?.totalPages || 1;

      console.log("Setting inventory list:", items.length, "items");
      console.log("Total pages:", pages);

      setInventoryList(items);
      setTotalPages(pages);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setInventoryList([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await InventoryService.getInventoryStats();
      // Response structure: { data: { success, data } }
      setStats(response.data.data || null);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats(null);
    }
  };

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchInventory();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filter]);

  const handleStockIn = () => {
    setShowStockInModal(true);
  };

  const handleViewTransactions = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowTransactionModal(true);
  };

  const handleViewDetail = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleStockOut = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowStockOutModal(true);
  };

  const handleAdjustStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowAdjustModal(true);
  };

  const onSuccess = () => {
    fetchInventory();
    fetchStats();
    setShowStockInModal(false);
    setShowStockOutModal(false);
    setShowAdjustModal(false);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-mono-800">Quận lý Kho hàng</h1>
        <button
          onClick={handleStockIn}
          className="bg-mono-black hover:bg-mono-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaPlus size={20} />
          Nhập kho
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-mono-500 text-sm">Tổng sản phẩm</p>
                <p className="text-2xl font-bold text-mono-800">
                  {stats.totalItems}
                </p>
              </div>
              <FaBox className="text-mono-500" size={40} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-mono-500 text-sm">Tên kho thấp</p>
                <p className="text-2xl font-bold text-mono-700">
                  {stats.lowStockItems || 0}
                </p>
              </div>
              <FaChartLine className="text-mono-600" size={40} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-mono-500 text-sm">H?t hàng</p>
                <p className="text-2xl font-bold text-mono-900">
                  {stats.outOfStockItems || 0}
                </p>
              </div>
              <FaExclamationTriangle className="text-mono-800" size={40} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-mono-500 text-sm">Giá trở tên kho</p>
                <p className="text-2xl font-bold text-mono-800">
                  {stats.totalValue?.toLocaleString("vi-VN")}?
                </p>
              </div>
              <FaDollarSign className="text-mono-700" size={40} />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filter.lowStock}
              onChange={(e) =>
                setFilter({ ...filter, lowStock: e.target.checked })
              }
              className="w-4 h-4"
            />
            <span className="text-sm text-mono-700">Tên kho thấp</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filter.outOfStock}
              onChange={(e) =>
                setFilter({ ...filter, outOfStock: e.target.checked })
              }
              className="w-4 h-4"
            />
            <span className="text-sm text-mono-700">H?t hàng</span>
          </label>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-mono-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                Sản phẩm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                Hình ảnh
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                Biến thể / Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                Tồn kho
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                Giá vốn TB
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-mono-500">
                  Đang tải...
                </td>
              </tr>
            ) : inventoryList.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-mono-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              inventoryList.map((item) => (
                <tr key={item._id} className="hover:bg-mono-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-mono-900">
                      {item.product?.name || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Hiển thị ảnh biến thể nếu có */}
                      {item.variant?.imagesvariant?.[0]?.url ? (
                        <img
                          src={item.variant.imagesvariant[0].url}
                          alt={item.variant.color?.name || "Variant"}
                          className="w-16 h-16 object-cover rounded-lg border-2 border-mono-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-mono-100 rounded-lg flex items-center justify-center border-2 border-mono-200">
                          <span className="text-mono-400 text-xs">No img</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {/* Hiển thị màu sắc với color swatch */}
                      <div className="flex items-center gap-2">
                        {item.variant?.color?.hexCode && (
                          <div
                            className="w-5 h-5 rounded-full border-2 border-mono-300 shadow-sm"
                            style={{
                              backgroundColor: item.variant.color.hexCode,
                            }}
                            title={item.variant.color.name}
                          />
                        )}
                        <span className="text-sm font-semibold text-mono-900">
                          {item.variant?.color?.name || "N/A"}
                        </span>
                      </div>
                      {/* Hiển thị size */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-mono-600">Size:</span>
                        <span className="text-sm font-bold text-mono-900 bg-mono-100 px-2 py-0.5 rounded">
                          {item.size?.value || "N/A"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-mono-900">
                      {item.quantity}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-mono-900">
                      {item.averageCostPrice?.toLocaleString("vi-VN")}?
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.isOutOfStock ? (
                      <span className="px-2 py-1 text-xs font-semibold text-mono-900 bg-mono-200 rounded">
                        H?t hàng
                      </span>
                    ) : item.isLowStock ? (
                      <span className="px-2 py-1 text-xs font-semibold text-mono-800 bg-mono-200 rounded">
                        Tên kho thấp
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold text-mono-800 bg-mono-100 rounded">
                        Bình thuẩng
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => handleViewDetail(item)}
                        className="px-3 py-1.5 text-xs font-medium text-mono-700 bg-mono-100 hover:bg-mono-200 rounded border border-mono-300 transition-colors"
                        title="Xem chi tiết"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => handleStockOut(item)}
                        className="px-3 py-1.5 text-xs font-medium text-mono-700 bg-white hover:bg-mono-50 rounded border border-mono-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Xuất kho"
                        disabled={item.isOutOfStock}
                      >
                        Xuất kho
                      </button>
                      <button
                        onClick={() => handleAdjustStock(item)}
                        className="px-3 py-1.5 text-xs font-medium text-mono-700 bg-white hover:bg-mono-50 rounded border border-mono-300 transition-colors"
                        title="Ði?u chơnh tên kho"
                      >
                        Ði?u chơnh
                      </button>
                      <button
                        onClick={() => handleViewTransactions(item)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-mono-black hover:bg-mono-800 rounded border border-mono-black transition-colors"
                      >
                        Lọch s?
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-mono-200 rounded disabled:opacity-50"
          >
            Trước
          </button>
          <span className="px-4 py-2">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-mono-200 rounded disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}

      {/* Modals */}
      {showStockInModal && (
        <StockInModal
          onClose={() => setShowStockInModal(false)}
          onSuccess={onSuccess}
        />
      )}
      {showStockOutModal && selectedItem && (
        <StockOutModal
          item={selectedItem}
          onClose={() => setShowStockOutModal(false)}
          onSuccess={onSuccess}
        />
      )}
      {showAdjustModal && selectedItem && (
        <AdjustStockModal
          item={selectedItem}
          onClose={() => setShowAdjustModal(false)}
          onSuccess={onSuccess}
        />
      )}
      {showDetailModal && selectedItem && (
        <InventoryDetailModal
          itemId={selectedItem._id}
          onClose={() => setShowDetailModal(false)}
          onUpdate={() => {
            fetchInventory();
            fetchStats();
          }}
        />
      )}
      {showTransactionModal && selectedItem && (
        <TransactionHistoryModal
          item={selectedItem}
          onClose={() => setShowTransactionModal(false)}
        />
      )}
    </div>
  );
};

export default InventoryPage;
