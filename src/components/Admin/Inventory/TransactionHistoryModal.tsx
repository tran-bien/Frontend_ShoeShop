import { useState, useEffect } from "react";
import InventoryService, {
  InventoryItem,
  InventoryTransaction,
} from "../../../services/InventoryService";

interface Props {
  item: InventoryItem;
  onClose: () => void;
}

const TransactionHistoryModal = ({ item, onClose }: Props) => {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await InventoryService.getTransactionHistory({
        productId: item.product?._id,
        variantId: item.variant?._id,
        sizeId: item.size?._id,
        page: currentPage,
        limit: 10,
      });
      setTransactions(response.data.transactions || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      IN: { text: "Nhập kho", color: "bg-green-100 text-green-800" },
      OUT: { text: "Xuất kho", color: "bg-red-100 text-red-800" },
      ADJUST: { text: "Điều chỉnh", color: "bg-orange-100 text-orange-800" },
    };
    return (
      labels[type as keyof typeof labels] || {
        text: type,
        color: "bg-gray-100 text-gray-800",
      }
    );
  };

  const formatDate = (dateString: string) => {
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
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📜 Lịch sử giao dịch
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Product Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">
            {item.product?.name}
          </h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Màu sắc:</span>{" "}
              <strong>{item.variant?.colorName || "N/A"}</strong>
            </div>
            <div>
              <span className="text-gray-600">Size:</span>{" "}
              <strong>{item.size?.name || "N/A"}</strong>
            </div>
            <div>
              <span className="text-gray-600">Tồn hiện tại:</span>{" "}
              <strong className="text-blue-600">{item.quantity}</strong>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">Đang tải...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Chưa có giao dịch nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá vốn
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người thực hiện
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ghi chú
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => {
                  const typeInfo = getTypeLabel(transaction.type);
                  return (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${typeInfo.color}`}
                        >
                          {typeInfo.text}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        <div className="font-medium">
                          {transaction.type === "IN" && "+"}
                          {transaction.type === "OUT" && "-"}
                          {transaction.quantityChange}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.quantityBefore} →{" "}
                          {transaction.quantityAfter}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        {transaction.costPrice
                          ? `${transaction.costPrice.toLocaleString("vi-VN")}₫`
                          : "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {transaction.performedBy?.name || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {transaction.notes || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
            >
              ← Trước
            </button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
            >
              Sau →
            </button>
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

export default TransactionHistoryModal;
