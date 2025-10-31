import { useState, useEffect } from "react";
import {
  FaPlus,
  FaBox,
  FaChartLine,
  FaExclamationTriangle,
  FaDollarSign,
  FaHistory,
} from "react-icons/fa";
import InventoryService, {
  InventoryStats,
} from "../../../services/InventoryService";
import type { InventoryItem } from "../../../types/inventory";
import StockInModal from "../../../components/Admin/Inventory/StockInModal";
import TransactionHistoryModal from "../../../components/Admin/Inventory/TransactionHistoryModal";

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
  const [showTransactionModal, setShowTransactionModal] = useState(false);
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

  const onSuccess = () => {
    fetchInventory();
    fetchStats();
    setShowStockInModal(false);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-mono-800">Quản lý Kho hàng</h1>
        <button
          onClick={handleStockIn}
          className="bg-mono-black hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
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
                <p className="text-mono-500 text-sm">Tồn kho thấp</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.lowStockItems?.length || 0}
                </p>
              </div>
              <FaChartLine className="text-mono-600" size={40} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-mono-500 text-sm">Hết hàng</p>
                <p className="text-2xl font-bold text-mono-900">
                  {stats.outOfStockItems?.length || 0}
                </p>
              </div>
              <FaExclamationTriangle className="text-mono-800" size={40} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-mono-500 text-sm">Giá trị tồn kho</p>
                <p className="text-2xl font-bold text-mono-800">
                  {stats.totalValue?.toLocaleString("vi-VN")}₫
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
            <span className="text-sm text-mono-700">Tồn kho thấp</span>
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
            <span className="text-sm text-mono-700">Hết hàng</span>
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
                    <div className="text-sm text-mono-900">
                      {item.variant?.color?.name || "N/A"} /{" "}
                      {item.size?.value || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-mono-900">
                      {item.quantity}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-mono-900">
                      {item.averageCostPrice?.toLocaleString("vi-VN")}₫
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.isOutOfStock ? (
                      <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded">
                        Hết hàng
                      </span>
                    ) : item.isLowStock ? (
                      <span className="px-2 py-1 text-xs font-semibold text-orange-800 bg-orange-100 rounded">
                        Tồn kho thấp
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded">
                        Bình thường
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleViewTransactions(item)}
                      className="flex items-center gap-1 text-mono-black hover:text-blue-800"
                    >
                      <FaHistory size={16} />
                      Xem lịch sử
                    </button>
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
