/**
 * ShipperReturnsPage - Quản lý yêu cầu trả hàng cho Shipper
 * Shipper có thể:
 * - Xem danh sách yêu cầu trả hàng được giao
 * - Xác nhận đã nhận hàng trả từ khách
 * - Xác nhận đã giao tiền hoàn cho khách (cash refund)
 */
import { useState, useEffect, useCallback } from "react";
import {
  FiPackage,
  FiRefreshCw,
  FiCheck,
  FiDollarSign,
  FiMapPin,
  FiPhone,
  FiUser,
  FiCalendar,
  FiAlertCircle,
  FiChevronRight,
  FiFilter,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { shipperReturnService } from "../../services/ReturnService";
import type { ReturnRequest, ReturnRequestStatus } from "../../types/return";

// ===== STATUS CONFIG =====
const STATUS_CONFIG: Record<
  ReturnRequestStatus,
  { label: string; color: string; bgColor: string }
> = {
  pending: {
    label: "Chờ duyệt",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  },
  approved: {
    label: "Chờ lấy hàng",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
  },
  shipping: {
    label: "Đang lấy hàng",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
  },
  received: {
    label: "Đã nhận hàng",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
  },
  refunded: {
    label: "Đã hoàn tiền",
    color: "text-teal-700",
    bgColor: "bg-teal-50",
  },
  completed: {
    label: "Hoàn tất",
    color: "text-green-700",
    bgColor: "bg-green-50",
  },
  rejected: {
    label: "Từ chối",
    color: "text-red-700",
    bgColor: "bg-red-50",
  },
  canceled: {
    label: "Đã hủy",
    color: "text-gray-500",
    bgColor: "bg-gray-100",
  },
};

const REASON_LABELS: Record<string, string> = {
  wrong_size: "Sai kích cỡ",
  wrong_product: "Sai sản phẩm",
  defective: "Sản phẩm lỗi",
  not_as_described: "Không giống mô tả",
  changed_mind: "Đổi ý",
  other: "Lý do khác",
};

const ShipperReturnsPage = () => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Modal states
  const [showConfirmReceived, setShowConfirmReceived] = useState(false);
  const [showConfirmRefund, setShowConfirmRefund] = useState(false);
  const [note, setNote] = useState("");

  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      const params: { status?: string } = {};
      if (filterStatus !== "all") {
        params.status = filterStatus;
      }
      const response = await shipperReturnService.getShipperReturns(params);
      const data = response.data.data;
      setReturns(data?.requests || []);
    } catch (error) {
      console.error("Error fetching returns:", error);
      toast.error("Không thể tải danh sách trả hàng");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  // Xác nhận đã nhận hàng trả từ khách
  const handleConfirmReceived = async () => {
    if (!selectedReturn) return;

    try {
      setActionLoading(true);
      await shipperReturnService.confirmReceived(selectedReturn._id, { note });
      toast.success("Đã xác nhận nhận hàng trả từ khách");
      setShowConfirmReceived(false);
      setSelectedReturn(null);
      setNote("");
      fetchReturns();
    } catch (error) {
      console.error("Error confirming received:", error);
      toast.error("Không thể xác nhận. Vui lòng thử lại.");
    } finally {
      setActionLoading(false);
    }
  };

  // Xác nhận đã giao tiền hoàn cho khách (cash refund)
  const handleConfirmRefund = async () => {
    if (!selectedReturn) return;

    try {
      setActionLoading(true);
      await shipperReturnService.confirmRefundDelivered(selectedReturn._id, {
        note,
      });
      toast.success("Đã xác nhận giao tiền hoàn cho khách");
      setShowConfirmRefund(false);
      setSelectedReturn(null);
      setNote("");
      fetchReturns();
    } catch (error) {
      console.error("Error confirming refund:", error);
      toast.error("Không thể xác nhận. Vui lòng thử lại.");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  // Lọc returns có thể thao tác
  const actionableReturns = returns.filter(
    (r) => r.status === "shipping" || r.status === "received"
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý trả hàng</h1>
        <p className="text-gray-600 mt-1">
          Xác nhận nhận hàng trả và giao tiền hoàn cho khách
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <FiPackage className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Chờ lấy hàng</p>
              <p className="text-xl font-bold">
                {returns.filter((r) => r.status === "shipping").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <FiCheck className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đã nhận hàng</p>
              <p className="text-xl font-bold">
                {returns.filter((r) => r.status === "received").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <FiDollarSign className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Chờ giao tiền</p>
              <p className="text-xl font-bold">
                {
                  returns.filter(
                    (r) => r.status === "received" && r.refundMethod === "cash"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <FiCheck className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Hoàn tất</p>
              <p className="text-xl font-bold">
                {returns.filter((r) => r.status === "completed").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
        <div className="flex items-center gap-4">
          <FiFilter className="text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">Tất cả</option>
            <option value="shipping">Chờ lấy hàng</option>
            <option value="received">Đã nhận hàng</option>
            <option value="completed">Hoàn tất</option>
          </select>
          <button
            onClick={fetchReturns}
            className="ml-auto flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <FiRefreshCw size={16} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Quick Actions for Actionable Returns */}
      {actionableReturns.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="text-amber-600 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-amber-800">
                Có {actionableReturns.length} yêu cầu cần xử lý
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Vui lòng xác nhận nhận hàng trả và giao tiền hoàn cho khách
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Returns List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : returns.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border">
          <FiPackage className="mx-auto text-gray-300" size={48} />
          <p className="mt-4 text-gray-600">Chưa có yêu cầu trả hàng nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((returnReq) => (
            <div
              key={returnReq._id}
              className="bg-white rounded-xl p-5 shadow-sm border hover:border-gray-300 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">
                      {returnReq.code || returnReq._id.slice(-8).toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        STATUS_CONFIG[returnReq.status]?.bgColor ||
                        "bg-gray-100"
                      } ${
                        STATUS_CONFIG[returnReq.status]?.color ||
                        "text-gray-700"
                      }`}
                    >
                      {STATUS_CONFIG[returnReq.status]?.label ||
                        returnReq.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Đơn hàng: {returnReq.order?.code || "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg text-green-600">
                    {formatCurrency(returnReq.refundAmount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {returnReq.refundMethod === "cash"
                      ? "Hoàn tiền mặt"
                      : "Chuyển khoản"}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FiUser className="text-gray-400" size={16} />
                  <span className="text-sm">
                    {returnReq.pickupAddress?.name ||
                      returnReq.customer?.name ||
                      "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FiPhone className="text-gray-400" size={16} />
                  <span className="text-sm">
                    {returnReq.pickupAddress?.phone ||
                      returnReq.order?.shippingAddress?.phone ||
                      "N/A"}
                  </span>
                </div>
                <div className="col-span-2 flex items-start gap-2">
                  <FiMapPin className="text-gray-400 mt-0.5" size={16} />
                  <span className="text-sm">
                    {returnReq.pickupAddress ? (
                      <>
                        {returnReq.pickupAddress.detail},{" "}
                        {returnReq.pickupAddress.ward},{" "}
                        {returnReq.pickupAddress.district},{" "}
                        {returnReq.pickupAddress.province}
                      </>
                    ) : (
                      <>
                        {returnReq.order?.shippingAddress?.address},{" "}
                        {returnReq.order?.shippingAddress?.ward},{" "}
                        {returnReq.order?.shippingAddress?.district},{" "}
                        {returnReq.order?.shippingAddress?.province}
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Reason */}
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Lý do:</span>{" "}
                  {REASON_LABELS[returnReq.reason] || returnReq.reason}
                  {returnReq.reasonDetail && ` - ${returnReq.reasonDetail}`}
                </p>
              </div>

              {/* Timeline */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <FiCalendar size={14} />
                  <span>Tạo: {formatDate(returnReq.createdAt)}</span>
                </div>
                {returnReq.assignedAt && (
                  <div className="flex items-center gap-1">
                    <FiPackage size={14} />
                    <span>Giao: {formatDate(returnReq.assignedAt)}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t">
                {returnReq.status === "shipping" && (
                  <button
                    onClick={() => {
                      setSelectedReturn(returnReq);
                      setShowConfirmReceived(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FiCheck size={16} />
                    Xác nhận đã nhận hàng
                  </button>
                )}

                {returnReq.status === "received" &&
                  returnReq.refundMethod === "cash" && (
                    <button
                      onClick={() => {
                        setSelectedReturn(returnReq);
                        setShowConfirmRefund(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <FiDollarSign size={16} />
                      Xác nhận đã giao tiền hoàn
                    </button>
                  )}

                {returnReq.status === "received" &&
                  returnReq.refundMethod === "bank_transfer" && (
                    <p className="text-sm text-gray-500 italic">
                      Chờ Admin chuyển khoản hoàn tiền
                    </p>
                  )}

                {returnReq.status === "completed" && (
                  <p className="text-sm text-green-600 font-medium">
                    ✓ Đã hoàn tất
                  </p>
                )}

                <button
                  onClick={() => setSelectedReturn(returnReq)}
                  className="ml-auto flex items-center gap-1 text-gray-600 hover:text-gray-800"
                >
                  Chi tiết <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Received Modal */}
      {showConfirmReceived && selectedReturn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Xác nhận nhận hàng trả</h2>
            <p className="text-gray-600 mb-4">
              Bạn xác nhận đã nhận hàng trả từ khách hàng{" "}
              <strong>{selectedReturn.customer?.name}</strong> cho đơn{" "}
              <strong>{selectedReturn.order?.code}</strong>?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú nếu có..."
                rows={3}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmReceived(false);
                  setSelectedReturn(null);
                  setNote("");
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={actionLoading}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmReceived}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Refund Modal */}
      {showConfirmRefund && selectedReturn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Xác nhận giao tiền hoàn</h2>
            <p className="text-gray-600 mb-4">
              Bạn xác nhận đã giao{" "}
              <strong className="text-green-600">
                {formatCurrency(selectedReturn.refundAmount)}
              </strong>{" "}
              tiền hoàn cho khách hàng{" "}
              <strong>{selectedReturn.customer?.name}</strong>?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú nếu có..."
                rows={3}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmRefund(false);
                  setSelectedReturn(null);
                  setNote("");
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={actionLoading}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmRefund}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipperReturnsPage;
