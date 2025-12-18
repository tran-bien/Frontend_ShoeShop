import { useState, useEffect } from "react";
import InventoryService from "../../../services/InventoryService";
import type {
  InventoryItem,
  InventoryTransaction,
} from "../../../types/inventory";

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
        const responseData = response.data.data as unknown as {
          transactions: InventoryTransaction[];
          pagination: { totalPages: number };
        };
        setTransactions(responseData?.transactions || []);
        setTotalPages(responseData?.pagination?.totalPages || 1);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentPage, item.product?._id, item.variant?._id, item.size?._id]);

  const getTypeLabel = (type: string) => {
    const labels = {
      IN: { text: "Nhập kho", color: "bg-mono-100 text-mono-800" },
      OUT: { text: "Xuất kho", color: "bg-mono-200 text-mono-900" },
      ADJUST: { text: "Điều chỉnh", color: "bg-mono-200 text-mono-800" },
    };
    return (
      labels[type as keyof typeof labels] || {
        text: type,
        color: "bg-mono-100 text-mono-800",
      }
    );
  };

  const getReasonLabel = (reason: string) => {
    const reasons: Record<string, string> = {
      initial_stock: "Nhập kho ban đầu",
      restock: "Nhập hàng bổ sung",
      sale: "Xuất bán",
      delivery_failed: "Giao hàng thất bại",
      return: "Trả hàng",
      damage: "Hàng hỏng",
      adjustment: "Điều chỉnh kiểm kê",
      other: "Khác",
    };
    return reasons[reason] || reason;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-mono-800">Lịch sử kho</h2>
          <button
            onClick={onClose}
            className="text-mono-500 hover:text-mono-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Product Info */}
        <div className="bg-mono-50 rounded-lg p-4 mb-6 flex-shrink-0">
          <h3 className="font-semibold text-mono-800 mb-2">
            {item.product?.name}
          </h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-mono-600">SKU:</span>{" "}
              <strong>{item.sku || "N/A"}</strong>
            </div>
            <div>
              <span className="text-mono-600">Màu sắc:</span>{" "}
              <strong>{item.variant?.color?.name || "N/A"}</strong>
            </div>
            <div>
              <span className="text-mono-600">Size:</span>{" "}
              <strong>{item.size?.value || "N/A"}</strong>
            </div>
            <div>
              <span className="text-mono-600">Tồn hiện tại:</span>{" "}
              <strong className="text-mono-black">{item.quantity}</strong>
            </div>
          </div>
        </div>

        {/* Transactions Table - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="text-center py-10 text-mono-500">Đang tải...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10 text-mono-500">
              Chưa có giao dịch nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-mono-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Lý do
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Số lượng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Giá vốn lô
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Giá vốn TB
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Người thực hiện
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Ghi chú
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => {
                    const typeInfo = getTypeLabel(transaction.type);
                    return (
                      <tr key={transaction._id} className="hover:bg-mono-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-mono-900">
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded ${typeInfo.color}`}
                          >
                            {typeInfo.text}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-mono-700">
                          {getReasonLabel(transaction.reason)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                          <div className="font-medium">
                            {transaction.type === "IN" && "+"}
                            {transaction.type === "OUT" && "-"}
                            {transaction.quantityChange}
                          </div>
                          <div className="text-xs text-mono-500">
                            {transaction.quantityBefore} →{" "}
                            {transaction.quantityAfter}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-mono-700">
                          {transaction.costPrice?.toLocaleString("vi-VN")}đ
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {transaction.type === "IN" ? (
                            <div className="space-y-1">
                              <div className="text-xs text-mono-500">
                                Trước:{" "}
                                {(
                                  transaction.averageCostPriceBefore || 0
                                ).toLocaleString("vi-VN")}
                                đ
                              </div>
                              <div className="font-medium text-green-700">
                                Sau:{" "}
                                {(
                                  transaction.averageCostPriceAfter ||
                                  transaction.costPrice ||
                                  0
                                ).toLocaleString("vi-VN")}
                                đ
                              </div>
                            </div>
                          ) : (
                            <span className="text-mono-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-mono-900">
                          {transaction.performedBy?.name || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm text-mono-600 min-w-[200px]">
                          {transaction.notes || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-mono-200 rounded disabled:opacity-50 hover:bg-mono-300"
            >
              ← Trước
            </button>
            <span className="px-4 py-2 text-sm text-mono-700">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-mono-200 rounded disabled:opacity-50 hover:bg-mono-300"
            >
              Sau →
            </button>
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-mono-200 rounded-lg hover:bg-mono-300 font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryModal;
