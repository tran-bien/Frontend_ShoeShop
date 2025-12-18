/**
 * MyOrdersPage - Danh sách đơn hàng của Shipper
 * SYNCED WITH BE: shipper.service.js - getShipperOrders(), updateDeliveryStatus()
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiMapPin,
  FiPhone,
  FiPackage,
  FiRefreshCw,
  FiSearch,
  FiX,
  FiChevronRight,
  FiUser,
  FiAlertCircle,
  FiPlay,
  FiRotateCw,
} from "react-icons/fi";
import { shipperService } from "../../services/ShipperService";
import { toast } from "react-hot-toast";
import type { Order, OrderStatus, DeliveryAttempt } from "../../types/order";
import type { UpdateDeliveryStatusData } from "../../types/shipper";

// ===== STATUS CONFIG - ĐÚNG THEO BE shipper.service.js =====
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  assigned_to_shipper: {
    label: "Chờ lấy hàng",
    color: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: <FiClock size={14} />,
  },
  out_for_delivery: {
    label: "Đang giao",
    color: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: <FiTruck size={14} />,
  },
  delivered: {
    label: "Đã giao",
    color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: <FiCheckCircle size={14} />,
  },
  returned: {
    label: "Đã giao",
    color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: <FiCheckCircle size={14} />,
  },
  cancelled: {
    label: "Thất bại",
    color: "bg-rose-50 text-rose-700 border border-rose-200",
    icon: <FiXCircle size={14} />,
  },
  returning_to_warehouse: {
    label: "Đang trả kho",
    color: "bg-orange-50 text-orange-700 border border-orange-200",
    icon: <FiRotateCw size={14} />,
  },
};

// Status tabs cho shipper
type ShipperStatusTab =
  | "all"
  | "assigned_to_shipper"
  | "out_for_delivery"
  | "delivered"
  | "delivery_failed";

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<ShipperStatusTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    orderId: string;
    status: UpdateDeliveryStatusData["status"];
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((o) => o.status === filterStatus);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.code.toLowerCase().includes(query) ||
          o.user?.name?.toLowerCase().includes(query) ||
          o.shippingAddress?.phone?.includes(query)
      );
    }

    setFilteredOrders(filtered);
  }, [filterStatus, searchQuery, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await shipperService.getMyOrders();
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const responseData = (response.data as any)?.data || response.data;
      const ordersData = responseData?.orders || responseData || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      /* eslint-enable @typescript-eslint/no-explicit-any */
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusCounts = () => {
    return {
      all: orders.length,
      assigned_to_shipper: orders.filter(
        (o) => o.status === "assigned_to_shipper"
      ).length,
      out_for_delivery: orders.filter((o) => o.status === "out_for_delivery")
        .length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };
  };

  const counts = getStatusCounts();

  /**
   * Quick action handler theo đúng BE logic (shipper.service.js):
   * - assigned_to_shipper → out_for_delivery (Bắt đầu giao)
   * - out_for_delivery → delivered | delivery_failed
   * - delivery_failed → out_for_delivery (Giao lại)
   */
  const handleQuickAction = async (
    orderId: string,
    newStatus: UpdateDeliveryStatusData["status"],
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    const confirmMessages: Record<string, string> = {
      out_for_delivery: "Bạn có chắc chắn muốn bắt đầu giao hàng không?",
      delivered: "Bạn có chắc chắn đã giao hàng thành công không?",
      delivery_failed: "Bạn có chắc chắn giao hàng thất bại không?",
    };

    // Hiển thị modal xác nhận
    setPendingAction({
      orderId,
      status: newStatus,
      message: confirmMessages[newStatus],
    });
    setShowConfirmModal(true);
  };

  const confirmQuickAction = async () => {
    if (!pendingAction) return;

    try {
      setUpdatingOrderId(pendingAction.orderId);
      setShowConfirmModal(false);
      await shipperService.updateDeliveryStatus(pendingAction.orderId, {
        status: pendingAction.status,
      });
      toast.success(
        pendingAction.status === "delivered"
          ? "Đã xác nhận giao thành công!"
          : pendingAction.status === "out_for_delivery"
          ? "Đã bắt đầu giao hàng!"
          : "Đã cập nhật trạng thái thất bại!"
      );
      fetchOrders();
      setPendingAction(null);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <FiRefreshCw className="animate-spin text-mono-400" size={32} />
          <span className="text-mono-500">Đang tải đơn hàng...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-mono-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-mono-900">Đơn hàng của tôi</h1>
          <p className="text-mono-500 text-sm mt-1">
            Quản lý và theo dõi các đơn hàng được giao
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 bg-white hover:bg-mono-50 text-mono-700 border border-mono-200 px-4 py-2.5 rounded-lg transition-all font-medium text-sm"
        >
          <FiRefreshCw size={16} />
          Làm mới
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(
          [
            { key: "all", label: "Tất cả", count: counts.all },
            {
              key: "assigned_to_shipper",
              label: "Chờ lấy hàng",
              count: counts.assigned_to_shipper,
            },
            {
              key: "out_for_delivery",
              label: "Đang giao",
              count: counts.out_for_delivery,
            },
            { key: "delivered", label: "Đã giao", count: counts.delivered },
            {
              key: "cancelled",
              label: "Thất bại",
              count: counts.cancelled,
            },
          ] as { key: ShipperStatusTab; label: string; count: number }[]
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
              placeholder="Tìm mã đơn, tên khách hàng, SĐT..."
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
            {filteredOrders.length}
          </span>{" "}
          đơn hàng
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-mono-200 p-12 text-center">
          <FiPackage className="mx-auto text-mono-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-mono-700 mb-2">
            Không có đơn hàng nào
          </h3>
          <p className="text-mono-500 text-sm">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl border border-mono-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Card Header */}
              <div className="px-5 py-4 border-b border-mono-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-mono-900">
                      #{order.code.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-mono-400 mt-1">
                    <FiClock size={12} />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                </div>
                {getStatusBadge(order.status)}
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
                      {order.user?.name || order.shippingAddress?.name || "N/A"}
                    </p>
                    <div className="flex items-center gap-1.5 text-sm text-mono-500 mt-0.5">
                      <FiPhone size={12} />
                      <span>
                        {order.user?.phone ||
                          order.shippingAddress?.phone ||
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
                      {[
                        order.shippingAddress?.detail,
                        order.shippingAddress?.ward,
                        order.shippingAddress?.district,
                        order.shippingAddress?.province,
                      ]
                        .filter(Boolean)
                        .join(", ") || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Order Info */}
                <div className="flex items-center justify-between py-3 border-t border-mono-100">
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-mono-500">
                      <span className="font-medium text-mono-700">
                        {order.orderItems?.length || 0}
                      </span>{" "}
                      sản phẩm
                    </div>
                    <div
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        order.payment?.paymentStatus === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {order.payment?.paymentStatus === "paid"
                        ? "Đã thanh toán"
                        : "COD"}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-mono-900">
                      {formatCurrency(order.totalAfterDiscountAndShipping)}
                    </span>
                  </div>
                </div>

                {/* Delivery Attempts */}
                {order.deliveryAttempts &&
                  order.deliveryAttempts.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-mono-100">
                      <div className="flex items-center gap-2 text-xs text-mono-500">
                        <FiClock size={12} />
                        <span>
                          Lần giao gần nhất:{" "}
                          {formatDate(
                            (
                              order.deliveryAttempts[
                                order.deliveryAttempts.length - 1
                              ] as DeliveryAttempt
                            ).time || order.createdAt
                          )}
                        </span>
                      </div>
                    </div>
                  )}
              </div>

              {/* Card Footer - Quick Actions theo BE logic */}
              <div className="px-5 py-3 bg-mono-50 border-t border-mono-100 space-y-2">
                <div className="flex gap-2">
                  {/* assigned_to_shipper → out_for_delivery */}
                  {order.status === "assigned_to_shipper" && (
                    <button
                      onClick={(e) =>
                        handleQuickAction(order._id, "out_for_delivery", e)
                      }
                      disabled={updatingOrderId === order._id}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                    >
                      <FiPlay size={14} />
                      {updatingOrderId === order._id
                        ? "Đang xử lý..."
                        : "Bắt đầu giao"}
                    </button>
                  )}

                  {/* out_for_delivery → delivered | delivery_failed */}
                  {order.status === "out_for_delivery" && (
                    <>
                      <button
                        onClick={(e) =>
                          handleQuickAction(order._id, "delivered", e)
                        }
                        disabled={updatingOrderId === order._id}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                      >
                        <FiCheckCircle size={14} />
                        {updatingOrderId === order._id ? "..." : "Thành công"}
                      </button>
                      <button
                        onClick={(e) =>
                          handleQuickAction(order._id, "delivery_failed", e)
                        }
                        disabled={updatingOrderId === order._id}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                      >
                        <FiXCircle size={14} />
                        {updatingOrderId === order._id ? "..." : "Thất bại"}
                      </button>
                    </>
                  )}

                  {/* delivery_failed → out_for_delivery (Giao lại) */}
                  {order.status === "delivery_failed" && (
                    <button
                      onClick={(e) =>
                        handleQuickAction(order._id, "out_for_delivery", e)
                      }
                      disabled={updatingOrderId === order._id}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                    >
                      <FiRotateCw size={14} />
                      {updatingOrderId === order._id
                        ? "Đang xử lý..."
                        : "Giao lại"}
                    </button>
                  )}
                </div>

                {/* View Detail Button */}
                <button
                  onClick={() => navigate(`/shipper/orders/${order._id}`)}
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

      {/* Confirmation Modal */}
      {showConfirmModal && pendingAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    pendingAction.status === "delivered"
                      ? "bg-emerald-100"
                      : pendingAction.status === "delivery_failed"
                      ? "bg-rose-100"
                      : "bg-amber-100"
                  }`}
                >
                  {pendingAction.status === "delivered" ? (
                    <FiCheckCircle className="text-emerald-600" size={24} />
                  ) : pendingAction.status === "delivery_failed" ? (
                    <FiXCircle className="text-rose-600" size={24} />
                  ) : (
                    <FiTruck className="text-amber-600" size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-mono-900">
                    Xác nhận hành động
                  </h3>
                  <p className="text-sm text-mono-500">
                    Vui lòng xác nhận để tiếp tục
                  </p>
                </div>
              </div>

              <p className="text-mono-700 mb-6">{pendingAction.message}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setPendingAction(null);
                  }}
                  disabled={updatingOrderId !== null}
                  className="flex-1 px-4 py-2.5 bg-mono-100 hover:bg-mono-200 text-mono-700 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={confirmQuickAction}
                  disabled={updatingOrderId !== null}
                  className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium transition-colors disabled:opacity-50 ${
                    pendingAction.status === "delivered"
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : pendingAction.status === "delivery_failed"
                      ? "bg-rose-500 hover:bg-rose-600"
                      : "bg-amber-500 hover:bg-amber-600"
                  }`}
                >
                  {updatingOrderId !== null ? "Đang xử lý..." : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
