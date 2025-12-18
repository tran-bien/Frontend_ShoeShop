/**
 * ShipperReturnsPage - Quản lý yêu cầu trả hàng cho Shipper
 * UI giống MyOrdersPage với cards, tabs, search
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
  FiClock,
  FiAlertCircle,
  FiChevronRight,
  FiSearch,
  FiX,
  FiTruck,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { shipperReturnService } from "../../services/ReturnService";
import type { ReturnRequest, ReturnRequestStatus } from "../../types/return";

// ===== STATUS CONFIG - Giống MyOrdersPage style =====
const STATUS_CONFIG: Record<
  ReturnRequestStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Chờ duyệt",
    color: "bg-mono-100 text-mono-600 border border-mono-200",
    icon: <FiClock size={14} />,
  },
  approved: {
    label: "Chờ lấy hàng",
    color: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: <FiPackage size={14} />,
  },
  shipping: {
    label: "Đang lấy hàng",
    color: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: <FiTruck size={14} />,
  },
  received: {
    label: "Đã nhận hàng",
    color: "bg-purple-50 text-purple-700 border border-purple-200",
    icon: <FiCheck size={14} />,
  },
  refunded: {
    label: "Đã hoàn tiền",
    color: "bg-teal-50 text-teal-700 border border-teal-200",
    icon: <FiDollarSign size={14} />,
  },
  completed: {
    label: "Hoàn tất",
    color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: <FiCheck size={14} />,
  },
  rejected: {
    label: "Từ chối",
    color: "bg-rose-50 text-rose-700 border border-rose-200",
    icon: <FiX size={14} />,
  },
  cancel_pending: {
    label: "Chờ duyệt hủy",
    color: "bg-orange-50 text-orange-700 border border-orange-200",
    icon: <FiClock size={14} />,
  },
  canceled: {
    label: "Đã hủy",
    color: "bg-mono-100 text-mono-500 border border-mono-200",
    icon: <FiX size={14} />,
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

// Status tabs cho shipper returns
type ShipperReturnTab = "all" | "shipping" | "received" | "completed";

const ShipperReturnsPage = () => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [filteredReturns, setFilteredReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ShipperReturnTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [showConfirmReceived, setShowConfirmReceived] = useState(false);
  const [showConfirmRefund, setShowConfirmRefund] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [note, setNote] = useState("");

  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      const response = await shipperReturnService.getShipperReturns({});
      const data = response.data.data;
      setReturns(data?.requests || []);
    } catch (error) {
      console.error("Error fetching returns:", error);
      toast.error("Không thể tải danh sách trả hàng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  useEffect(() => {
    let filtered = returns;

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((r) => r.status === filterStatus);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.code?.toLowerCase().includes(query) ||
          r.order?.code?.toLowerCase().includes(query) ||
          r.customer?.name?.toLowerCase().includes(query) ||
          r.pickupAddress?.phone?.includes(query)
      );
    }

    setFilteredReturns(filtered);
  }, [filterStatus, searchQuery, returns]);

  // Xác nhận đã nhận hàng trả từ khách
  const handleConfirmReceived = async () => {
    if (!selectedReturn) return;

    try {
      setActionLoading(selectedReturn._id);
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
      setActionLoading(null);
    }
  };

  // Xác nhận đã giao tiền hoàn cho khách (cash refund)
  const handleConfirmRefund = async () => {
    if (!selectedReturn) return;

    try {
      setActionLoading(selectedReturn._id);
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
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const getStatusBadge = (status: ReturnRequestStatus) => {
    const config = STATUS_CONFIG[status] || {
      label: status,
      color: "bg-mono-100 text-mono-600 border border-mono-200",
      icon: <FiAlertCircle size={14} />,
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getStatusCounts = () => {
    return {
      all: returns.length,
      shipping: returns.filter((r) => r.status === "shipping").length,
      received: returns.filter((r) => r.status === "received").length,
      completed: returns.filter((r) => r.status === "completed").length,
    };
  };

  const counts = getStatusCounts();

  // Lọc returns cần xử lý
  const actionableCount = returns.filter(
    (r) =>
      r.status === "shipping" ||
      (r.status === "received" && r.refundMethod === "cash")
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <FiRefreshCw className="animate-spin text-mono-400" size={32} />
          <span className="text-mono-500">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-mono-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-mono-900">Quản lý trả hàng</h1>
          <p className="text-mono-500 text-sm mt-1">
            Xác nhận nhận hàng trả và giao tiền hoàn cho khách
          </p>
        </div>
        <button
          onClick={fetchReturns}
          className="inline-flex items-center gap-2 bg-white hover:bg-mono-50 text-mono-700 border border-mono-200 px-4 py-2.5 rounded-lg transition-all font-medium text-sm"
        >
          <FiRefreshCw size={16} />
          Làm mới
        </button>
      </div>

      {/* Alert for actionable returns */}
      {actionableCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <FiAlertCircle className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="font-semibold text-amber-800">
                Có {actionableCount} yêu cầu cần xử lý
              </p>
              <p className="text-sm text-amber-700 mt-0.5">
                Vui lòng xác nhận nhận hàng trả và giao tiền hoàn cho khách
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(
          [
            { key: "all", label: "Tất cả", count: counts.all },
            { key: "shipping", label: "Chờ lấy hàng", count: counts.shipping },
            { key: "received", label: "Đã nhận hàng", count: counts.received },
            { key: "completed", label: "Hoàn tất", count: counts.completed },
          ] as { key: ShipperReturnTab; label: string; count: number }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === tab.key
                ? "bg-mono-900 text-white"
                : "bg-white text-mono-600 border border-mono-200 hover:bg-mono-50"
            }`}
          >
            {tab.label}
            <span
              className={`px-1.5 py-0.5 rounded text-xs ${
                filterStatus === tab.key ? "bg-white/20" : "bg-mono-100"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-mono-200 shadow-sm mb-6">
        <div className="p-4">
          <div className="relative">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm mã yêu cầu, mã đơn hàng, tên khách hàng, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-mono-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mono-200 focus:border-mono-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mono-400 hover:text-mono-600"
              >
                <FiX size={16} />
              </button>
            )}
          </div>
        </div>
        <div className="px-4 py-3 bg-mono-50/50 border-t border-mono-100 text-sm text-mono-600">
          Hiển thị{" "}
          <span className="font-semibold text-mono-800">
            {filteredReturns.length}
          </span>{" "}
          yêu cầu trả hàng
        </div>
      </div>

      {/* Returns Grid */}
      {filteredReturns.length === 0 ? (
        <div className="bg-white rounded-xl border border-mono-200 p-12 text-center">
          <FiPackage className="mx-auto text-mono-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-mono-700 mb-2">
            Không có yêu cầu trả hàng nào
          </h3>
          <p className="text-mono-500 text-sm">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredReturns.map((returnReq) => (
            <div
              key={returnReq._id}
              className="bg-white rounded-xl border border-mono-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Card Header */}
              <div className="px-5 py-4 border-b border-mono-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-mono-900">
                      #{returnReq.code || returnReq._id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-mono-400 mt-1">
                    <FiClock size={12} />
                    <span>{formatDate(returnReq.createdAt)}</span>
                  </div>
                </div>
                {getStatusBadge(returnReq.status)}
              </div>

              {/* Card Body */}
              <div className="p-5">
                {/* Customer */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-mono-100 rounded-lg">
                    <FiUser className="text-mono-600" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-mono-900 truncate">
                      {returnReq.pickupAddress?.name ||
                        returnReq.customer?.name ||
                        "N/A"}
                    </p>
                    <div className="flex items-center gap-1.5 text-sm text-mono-500 mt-0.5">
                      <FiPhone size={12} />
                      <span>
                        {returnReq.pickupAddress?.phone ||
                          returnReq.order?.shippingAddress?.phone ||
                          "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-mono-100 rounded-lg">
                    <FiMapPin className="text-mono-600" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-mono-700 line-clamp-2">
                      {returnReq.pickupAddress ? (
                        <>
                          {returnReq.pickupAddress.detail},{" "}
                          {returnReq.pickupAddress.ward},{" "}
                          {returnReq.pickupAddress.district},{" "}
                          {returnReq.pickupAddress.province}
                        </>
                      ) : returnReq.order?.shippingAddress ? (
                        <>
                          {returnReq.order.shippingAddress.address},{" "}
                          {returnReq.order.shippingAddress.ward},{" "}
                          {returnReq.order.shippingAddress.district},{" "}
                          {returnReq.order.shippingAddress.province}
                        </>
                      ) : (
                        "N/A"
                      )}
                    </p>
                  </div>
                </div>

                {/* Return Info */}
                <div className="flex items-center justify-between py-3 border-t border-mono-100">
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-mono-500">
                      Đơn:{" "}
                      <span className="font-medium text-blue-600">
                        {returnReq.order?.code || "N/A"}
                      </span>
                    </div>
                    <div
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        returnReq.refundMethod === "cash"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {returnReq.refundMethod === "cash"
                        ? "Tiền mặt"
                        : "Chuyển khoản"}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600">
                      {formatCurrency(returnReq.refundAmount)}
                    </span>
                  </div>
                </div>

                {/* Reason */}
                <div className="mt-2 p-2 bg-mono-50 rounded-lg">
                  <p className="text-xs text-mono-500">
                    <span className="font-medium">Lý do:</span>{" "}
                    {REASON_LABELS[returnReq.reason] || returnReq.reason}
                    {returnReq.reasonDetail && ` - ${returnReq.reasonDetail}`}
                  </p>
                </div>
              </div>

              {/* Card Footer - Quick Actions */}
              <div className="px-5 py-3 bg-mono-50 border-t border-mono-100 space-y-2">
                <div className="flex gap-2">
                  {/* shipping → received */}
                  {returnReq.status === "shipping" && (
                    <button
                      onClick={() => {
                        setSelectedReturn(returnReq);
                        setShowConfirmReceived(true);
                      }}
                      disabled={actionLoading === returnReq._id}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                    >
                      <FiCheck size={14} />
                      {actionLoading === returnReq._id
                        ? "Đang xử lý..."
                        : "Xác nhận nhận hàng"}
                    </button>
                  )}

                  {/* received + cash → confirm refund */}
                  {returnReq.status === "received" &&
                    returnReq.refundMethod === "cash" && (
                      <button
                        onClick={() => {
                          setSelectedReturn(returnReq);
                          setShowConfirmRefund(true);
                        }}
                        disabled={actionLoading === returnReq._id}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                      >
                        <FiDollarSign size={14} />
                        {actionLoading === returnReq._id
                          ? "Đang xử lý..."
                          : "Xác nhận giao tiền hoàn"}
                      </button>
                    )}

                  {/* received + bank_transfer → waiting admin */}
                  {returnReq.status === "received" &&
                    returnReq.refundMethod === "bank_transfer" && (
                      <div className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm text-mono-500 italic">
                        <FiClock size={14} />
                        Chờ Admin chuyển khoản
                      </div>
                    )}

                  {/* completed */}
                  {returnReq.status === "completed" && (
                    <div className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm text-emerald-600 font-medium">
                      <FiCheck size={14} />
                      Đã hoàn tất
                    </div>
                  )}
                </div>

                {/* View Detail Button */}
                <button
                  onClick={() => {
                    setSelectedReturn(returnReq);
                    setShowDetailModal(true);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 bg-mono-100 hover:bg-mono-200 text-mono-700 py-2 rounded-lg font-medium text-sm transition-colors"
                >
                  Xem chi tiết
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReturn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-mono-700 to-mono-800 text-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">
                    Chi tiết yêu cầu trả hàng
                  </h2>
                  <p className="text-mono-200 text-sm mt-0.5">
                    Mã:{" "}
                    <span className="font-mono">
                      {selectedReturn.code ||
                        `#${selectedReturn._id.slice(-8).toUpperCase()}`}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedReturn.status)}
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedReturn(null);
                    }}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-5">
              {/* Grid Info */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Request Info */}
                <div className="bg-mono-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-mono-700 font-semibold mb-3">
                    <FiPackage size={16} />
                    <span>Thông tin yêu cầu</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-mono-500">Mã đơn hàng:</span>
                      <span className="font-mono font-medium text-blue-600">
                        {selectedReturn.order?.code || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mono-500">Ngày tạo:</span>
                      <span>{formatDate(selectedReturn.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mono-500">
                        Phương thức hoàn tiền:
                      </span>
                      <span
                        className={`font-medium ${
                          selectedReturn.refundMethod === "cash"
                            ? "text-amber-600"
                            : "text-blue-600"
                        }`}
                      >
                        {selectedReturn.refundMethod === "bank_transfer"
                          ? "Chuyển khoản"
                          : "Tiền mặt"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-mono-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-mono-700 font-semibold mb-3">
                    <FiUser size={16} />
                    <span>Thông tin khách hàng</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-mono-500">Họ tên:</span>
                      <span className="font-medium">
                        {selectedReturn.customer?.name || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mono-500">SĐT:</span>
                      <span>
                        {selectedReturn.pickupAddress?.phone ||
                          selectedReturn.customer?.phone ||
                          "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mono-500">Email:</span>
                      <span className="truncate max-w-[180px]">
                        {selectedReturn.customer?.email || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pickup Address */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-700 font-semibold mb-3">
                  <FiMapPin size={16} />
                  <span>Địa chỉ lấy hàng</span>
                </div>
                <div className="text-sm text-blue-800">
                  {selectedReturn.pickupAddress ? (
                    <>
                      <p className="font-medium">
                        {selectedReturn.pickupAddress.name}
                      </p>
                      <p>{selectedReturn.pickupAddress.phone}</p>
                      <p>{selectedReturn.pickupAddress.detail}</p>
                      <p>
                        {selectedReturn.pickupAddress.ward},{" "}
                        {selectedReturn.pickupAddress.district},{" "}
                        {selectedReturn.pickupAddress.province}
                      </p>
                    </>
                  ) : selectedReturn.order?.shippingAddress ? (
                    <>
                      <p className="font-medium">
                        {selectedReturn.order.shippingAddress.fullName}
                      </p>
                      <p>{selectedReturn.order.shippingAddress.phone}</p>
                      <p>
                        {selectedReturn.order.shippingAddress.addressLine ||
                          selectedReturn.order.shippingAddress.address}
                      </p>
                      <p>
                        {selectedReturn.order.shippingAddress.ward},{" "}
                        {selectedReturn.order.shippingAddress.district},{" "}
                        {selectedReturn.order.shippingAddress.province}
                      </p>
                    </>
                  ) : (
                    <p className="text-mono-500">Không có thông tin địa chỉ</p>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-800 mb-2">
                  Lý do trả hàng
                </h3>
                <p className="text-amber-700 font-medium">
                  {REASON_LABELS[selectedReturn.reason] ||
                    selectedReturn.reason}
                </p>
                {selectedReturn.reasonDetail && (
                  <p className="text-amber-600 text-sm mt-2 italic">
                    "{selectedReturn.reasonDetail}"
                  </p>
                )}
              </div>

              {/* Products */}
              {selectedReturn.order?.orderItems &&
                selectedReturn.order.orderItems.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-mono-700 mb-3">
                      Sản phẩm trả ({selectedReturn.order.orderItems.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedReturn.order.orderItems.map(
                        (item, idx: number) => (
                          <div
                            key={idx}
                            className="bg-white border border-mono-200 rounded-lg p-3 flex gap-3"
                          >
                            {item.variant?.product?.images?.[0]?.url && (
                              <img
                                src={item.variant.product.images[0].url}
                                alt={item.variant.product?.name || "Product"}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-mono-800 truncate">
                                {item.variant?.product?.name || "Sản phẩm"}
                              </p>
                              <div className="flex flex-wrap gap-3 text-xs text-mono-600 mt-1">
                                <span>
                                  Màu:{" "}
                                  <strong>
                                    {item.variant?.color?.name || "N/A"}
                                  </strong>
                                </span>
                                <span>
                                  Size:{" "}
                                  <strong>{item.size?.value || "N/A"}</strong>
                                </span>
                                <span>
                                  SL: <strong>{item.quantity}</strong>
                                </span>
                                <span>
                                  Giá:{" "}
                                  <strong>
                                    {formatCurrency(item.price || 0)}
                                  </strong>
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Refund Info */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-3">
                  <FiDollarSign size={16} />
                  <span>Thông tin hoàn tiền</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-600">
                    Số tiền hoàn cho khách:
                  </span>
                  <span className="text-xl font-bold text-emerald-700">
                    {formatCurrency(selectedReturn.refundAmount)}
                  </span>
                </div>

                {/* Bank Info */}
                {selectedReturn.refundMethod === "bank_transfer" &&
                  selectedReturn.bankInfo && (
                    <div className="mt-3 pt-3 border-t border-emerald-200">
                      <p className="font-medium text-emerald-700 mb-2 text-sm">
                        Thông tin ngân hàng:
                      </p>
                      <div className="space-y-1 text-sm text-emerald-800">
                        <p>
                          Ngân hàng:{" "}
                          <strong>{selectedReturn.bankInfo.bankName}</strong>
                        </p>
                        <p>
                          Số TK:{" "}
                          <strong className="font-mono">
                            {selectedReturn.bankInfo.accountNumber}
                          </strong>
                        </p>
                        <p>
                          Chủ TK:{" "}
                          <strong>{selectedReturn.bankInfo.accountName}</strong>
                        </p>
                      </div>
                    </div>
                  )}

                {/* Refund collected by shipper (for cash method) */}
                {selectedReturn.refundMethod === "cash" &&
                  selectedReturn.refundCollectedByShipper && (
                    <div className="mt-3 pt-3 border-t border-emerald-200">
                      <div className="flex items-center gap-2 text-emerald-600 font-medium mb-2 text-sm">
                        <FiCheck size={14} />
                        <span>Đã giao tiền hoàn cho khách</span>
                      </div>
                      <div className="space-y-1 text-sm text-emerald-800">
                        <p>
                          Số tiền:{" "}
                          <strong>
                            {formatCurrency(
                              selectedReturn.refundCollectedByShipper.amount ||
                                0
                            )}
                          </strong>
                        </p>
                        <p>
                          Thời gian:{" "}
                          {formatDate(
                            selectedReturn.refundCollectedByShipper.collectedAt
                          )}
                        </p>
                        {selectedReturn.refundCollectedByShipper.note && (
                          <p className="italic">
                            Ghi chú:{" "}
                            {selectedReturn.refundCollectedByShipper.note}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
              </div>

              {/* History Timeline */}
              <div className="bg-mono-50 rounded-lg p-4">
                <h3 className="font-semibold text-mono-700 mb-3">
                  Lịch sử xử lý
                </h3>
                <div className="space-y-3">
                  {/* Created */}
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                    <div className="text-sm">
                      <p className="font-medium text-mono-700">Tạo yêu cầu</p>
                      <p className="text-mono-500">
                        {formatDate(selectedReturn.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Approved */}
                  {selectedReturn.approvedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                      <div className="text-sm">
                        <p className="font-medium text-mono-700">Đã duyệt</p>
                        <p className="text-mono-500">
                          {formatDate(selectedReturn.approvedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Assigned */}
                  {selectedReturn.assignedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-purple-500"></div>
                      <div className="text-sm">
                        <p className="font-medium text-mono-700">
                          Phân công cho bạn
                        </p>
                        <p className="text-mono-500">
                          {formatDate(selectedReturn.assignedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Received */}
                  {selectedReturn.receivedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500"></div>
                      <div className="text-sm">
                        <p className="font-medium text-mono-700">
                          Đã nhận hàng trả
                        </p>
                        <p className="text-mono-500">
                          {formatDate(selectedReturn.receivedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Refund delivered */}
                  {selectedReturn.refundCollectedByShipper?.collectedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-teal-500"></div>
                      <div className="text-sm">
                        <p className="font-medium text-mono-700">
                          Đã giao tiền hoàn
                        </p>
                        <p className="text-mono-500">
                          {formatDate(
                            selectedReturn.refundCollectedByShipper.collectedAt
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Completed */}
                  {selectedReturn.completedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500"></div>
                      <div className="text-sm">
                        <p className="font-medium text-emerald-700">
                          Hoàn thành
                        </p>
                        <p className="text-mono-500">
                          {formatDate(selectedReturn.completedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-mono-200 px-6 py-4 bg-mono-50 flex justify-end gap-3">
              {/* Quick action from modal */}
              {selectedReturn.status === "shipping" && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowConfirmReceived(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                >
                  Xác nhận nhận hàng
                </button>
              )}
              {selectedReturn.status === "received" &&
                selectedReturn.refundMethod === "cash" && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowConfirmRefund(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm"
                  >
                    Xác nhận giao tiền hoàn
                  </button>
                )}
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedReturn(null);
                }}
                className="px-4 py-2 bg-mono-200 text-mono-700 rounded-lg hover:bg-mono-300 font-medium text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Received Modal */}
      {showConfirmReceived && selectedReturn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-mono-900 mb-4">
              Xác nhận nhận hàng trả
            </h2>
            <p className="text-mono-600 mb-4">
              Bạn xác nhận đã nhận hàng trả từ khách hàng{" "}
              <strong>
                {selectedReturn.pickupAddress?.name ||
                  selectedReturn.customer?.name}
              </strong>{" "}
              cho đơn <strong>{selectedReturn.order?.code}</strong>?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú nếu có..."
                rows={3}
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-200"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmReceived(false);
                  setSelectedReturn(null);
                  setNote("");
                }}
                className="flex-1 px-4 py-2.5 border border-mono-300 rounded-lg hover:bg-mono-50 font-medium text-mono-700"
                disabled={actionLoading === selectedReturn._id}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmReceived}
                disabled={actionLoading === selectedReturn._id}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {actionLoading === selectedReturn._id
                  ? "Đang xử lý..."
                  : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Refund Modal */}
      {showConfirmRefund && selectedReturn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-mono-900 mb-4">
              Xác nhận giao tiền hoàn
            </h2>
            <p className="text-mono-600 mb-4">
              Bạn xác nhận đã giao{" "}
              <strong className="text-emerald-600">
                {formatCurrency(selectedReturn.refundAmount)}
              </strong>{" "}
              tiền hoàn cho khách hàng{" "}
              <strong>
                {selectedReturn.pickupAddress?.name ||
                  selectedReturn.customer?.name}
              </strong>
              ?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú nếu có..."
                rows={3}
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-200"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmRefund(false);
                  setSelectedReturn(null);
                  setNote("");
                }}
                className="flex-1 px-4 py-2.5 border border-mono-300 rounded-lg hover:bg-mono-50 font-medium text-mono-700"
                disabled={actionLoading === selectedReturn._id}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmRefund}
                disabled={actionLoading === selectedReturn._id}
                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium"
              >
                {actionLoading === selectedReturn._id
                  ? "Đang xử lý..."
                  : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipperReturnsPage;
