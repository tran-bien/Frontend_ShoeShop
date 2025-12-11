import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { adminOrderService } from "../../../services/OrderService";
import CancelRequestList from "./CancelRequestList";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "react-hot-toast";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiEye,
  FiCheck,
  FiTruck,
  FiRefreshCw,
  FiArrowRight,
} from "react-icons/fi";

// ===== STATUS MAPPING - ĐÚNG THEO BE =====
const ORDER_STATUS_MAP: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  assigned_to_shipper: "Đã gán shipper",
  out_for_delivery: "Đang giao hàng",
  delivered: "Giao thành công",
  delivery_failed: "Giao thất bại",
  returning_to_warehouse: "Đang trả về kho",
  cancelled: "Đã hủy",
  returned: "Đã hoàn trả",
  refunded: "Đã hoàn tiền",
};

// Status badge colors - Monochrome style
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border border-blue-200",
  assigned_to_shipper: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  out_for_delivery: "bg-violet-50 text-violet-700 border border-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  delivery_failed: "bg-rose-50 text-rose-700 border border-rose-200",
  returning_to_warehouse:
    "bg-orange-50 text-orange-700 border border-orange-200",
  cancelled: "bg-mono-100 text-mono-600 border border-mono-200",
  returned: "bg-pink-50 text-pink-700 border border-pink-200",
  refunded: "bg-teal-50 text-teal-700 border border-teal-200",
};

// Tab filters
type OrderTab =
  | "all"
  | "pending"
  | "processing"
  | "delivering"
  | "completed"
  | "issues";

const TAB_FILTERS: Record<OrderTab, string[]> = {
  all: [],
  pending: ["pending", "confirmed"],
  processing: ["assigned_to_shipper"],
  delivering: ["out_for_delivery"],
  completed: ["delivered", "cancelled", "refunded"],
  issues: ["delivery_failed", "returning_to_warehouse", "returned"],
};

// Simplified order interface for list display
interface OrderListItem {
  _id: string;
  orderCode: string;
  customerName: string;
  address: string;
  phone: string;
  price: string;
  paymentStatus: string;
  paymentStatusRaw?: string;
  paymentMethod?: string;
  orderStatus: string;
  orderStatusRaw?: string;
  shipperName?: string;
  shipperId?: string;
  createdAt?: string;
}

const ListOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { canProcessOrders, hasAdminOnlyAccess } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderListItem | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"orders" | "cancel">("orders");
  const [orderTab, setOrderTab] = useState<OrderTab>("all");

  // Lấy danh sách đơn hàng từ API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminOrderService.getAllOrders();
      /* eslint-disable @typescript-eslint/no-explicit-any */
      setOrders(
        (res.data.orders || []).map((o: any) => ({
          _id: o._id,
          orderCode: o.code || o.orderCode || o._id,
          customerName: o.user?.name || o.shippingAddress?.name || "",
          address: [
            o.shippingAddress?.detail,
            o.shippingAddress?.ward,
            o.shippingAddress?.district,
            o.shippingAddress?.province,
          ]
            .filter(Boolean)
            .join(", "),
          phone: o.shippingAddress?.phone || o.user?.phone || "",
          price: o.totalAfterDiscountAndShipping
            ? o.totalAfterDiscountAndShipping.toLocaleString("vi-VN") + "₫"
            : "",
          paymentStatus:
            o.payment?.paymentStatus === "paid"
              ? "Đã thanh toán"
              : "Chưa thanh toán",
          paymentStatusRaw: o.payment?.paymentStatus,
          paymentMethod:
            o.payment?.method === "VNPAY"
              ? "VNPAY"
              : o.payment?.method === "COD"
              ? "COD"
              : o.payment?.method || "",
          orderStatus: ORDER_STATUS_MAP[o.status] || o.status || "",
          orderStatusRaw: o.status,
          shipperName: o.shipper?.name || "",
          shipperId: o.shipper?._id || "",
          createdAt: o.createdAt,
        }))
      );
      /* eslint-enable @typescript-eslint/no-explicit-any */
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "orders") {
      fetchOrders();
    }
  }, [tab]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const handleViewDetails = async (order: any) => {
    try {
      const res = await adminOrderService.getOrderDetail(order._id);
      const o = res.data.data as any;
      setSelectedOrder({
        _id: o._id,
        orderCode: o.code || o._id,
        customerName: o.user?.name || o.shippingAddress?.name || "",
        address: [
          o.shippingAddress?.detail,
          o.shippingAddress?.ward,
          o.shippingAddress?.district,
          o.shippingAddress?.province,
        ]
          .filter(Boolean)
          .join(", "),
        phone: o.shippingAddress?.phone || "",
        price: o.totalAfterDiscountAndShipping
          ? o.totalAfterDiscountAndShipping.toLocaleString("vi-VN") + "₫"
          : "",
        paymentStatus:
          o.payment?.paymentStatus === "paid"
            ? "Đã thanh toán"
            : "Chưa thanh toán",
        paymentStatusRaw: o.payment?.paymentStatus,
        paymentMethod:
          o.payment?.method === "VNPAY"
            ? "VNPAY"
            : o.payment?.method === "COD"
            ? "COD"
            : o.payment?.method || "",
        orderStatus: ORDER_STATUS_MAP[o.status] || o.status || "",
        orderStatusRaw: o.status,
        shipperName: o.shipper?.name || "",
        shipperId: o.shipper?._id || "",
      });
    } catch {
      setSelectedOrder(null);
    }
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  // Filter orders based on tab, search, payment, status
  const filteredOrders = useMemo(() => {
    let result = orders;

    // Filter by order tab
    if (orderTab !== "all" && TAB_FILTERS[orderTab].length > 0) {
      result = result.filter((order) =>
        TAB_FILTERS[orderTab].includes(order.orderStatusRaw || "")
      );
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          order.customerName.toLowerCase().includes(query) ||
          order.orderCode.toLowerCase().includes(query) ||
          order.phone.includes(query)
      );
    }

    // Filter by payment status
    if (paymentFilter) {
      result = result.filter((order) => order.paymentStatus === paymentFilter);
    }

    // Filter by order status (from dropdown)
    if (statusFilter) {
      result = result.filter((order) => order.orderStatusRaw === statusFilter);
    }

    return result;
  }, [orders, orderTab, searchQuery, paymentFilter, statusFilter]);

  // Xử lý cập nhật trạng thái đơn hàng
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      await adminOrderService.updateOrderStatus(orderId, {
        status: status as any,
      });
      /* eslint-enable @typescript-eslint/no-explicit-any */
      toast.success(`Cập nhật trạng thái thành công`);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "Không thể cập nhật trạng thái"
      );
    }
  };

  // Xác nhận nhận hàng trả về
  const handleConfirmReturn = async (orderId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xác nhận đã nhận hàng trả về?")) return;

    try {
      await adminOrderService.confirmReturn(orderId);
      toast.success("Đã xác nhận nhận hàng trả về");
      fetchOrders();
    } catch (error) {
      console.error("Error confirming return:", error);
      toast.error("Không thể xác nhận nhận hàng trả về");
    }
  };

  // Hoàn tiền cho đơn đã hủy/trả hàng (Admin Only)
  const handleRefundOrder = async (orderId: string) => {
    if (!confirm("Bạn có chắc chắn muốn hoàn tiền cho đơn hàng này?")) return;

    try {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      await adminOrderService.updateOrderStatus(orderId, {
        status: "refunded" as any,
      });
      /* eslint-enable @typescript-eslint/no-explicit-any */
      toast.success("Đã cập nhật trạng thái hoàn tiền");
      fetchOrders();
    } catch (error) {
      console.error("Error refunding order:", error);
      toast.error("Không thể hoàn tiền");
    }
  };

  // Force xác nhận thanh toán cho VNPAY failed callbacks (Admin Only)
  const handleForceConfirmPayment = async (orderId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xác nhận thanh toán cho đơn hàng này?"))
      return;

    try {
      await adminOrderService.forceConfirmPayment(orderId);
      toast.success("Đã xác nhận thanh toán thành công");
      fetchOrders();
    } catch (error) {
      console.error("Error forcing payment confirmation:", error);
      toast.error("Không thể xác nhận thanh toán");
    }
  };

  // Get status counts for tabs
  const statusCounts = useMemo(() => {
    const counts: Record<OrderTab, number> = {
      all: orders.length,
      pending: 0,
      processing: 0,
      delivering: 0,
      completed: 0,
      issues: 0,
    };

    orders.forEach((order) => {
      const status = order.orderStatusRaw || "";
      if (TAB_FILTERS.pending.includes(status)) counts.pending++;
      if (TAB_FILTERS.processing.includes(status)) counts.processing++;
      if (TAB_FILTERS.delivering.includes(status)) counts.delivering++;
      if (TAB_FILTERS.completed.includes(status)) counts.completed++;
      if (TAB_FILTERS.issues.includes(status)) counts.issues++;
    });

    return counts;
  }, [orders]);

  // Count confirmed orders (ready for shipper assignment)
  const confirmedOrdersCount = useMemo(() => {
    return orders.filter((o) => o.orderStatusRaw === "confirmed").length;
  }, [orders]);

  // Render action buttons based on order status
  const renderActions = (order: OrderListItem) => {
    const status = order.orderStatusRaw;

    return (
      <div className="flex flex-col gap-1.5 min-w-[130px] items-stretch">
        {/* View details button - always show */}
        <button
          className="inline-flex items-center justify-center gap-1.5 bg-mono-900 hover:bg-mono-800 text-white text-xs px-3 py-2 rounded-lg transition-all font-medium"
          onClick={async () => {
            try {
              const res = await adminOrderService.getOrderDetail(order._id);
              handleViewDetails(res.data.data);
            } catch (err) {
              console.error("Error fetching order:", err);
            }
          }}
        >
          <FiEye size={12} />
          Chi tiết
        </button>

        {canProcessOrders() && (
          <>
            {/* Pending → Confirm */}
            {status === "pending" && (
              <button
                className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-lg transition-all font-medium"
                onClick={() => handleUpdateOrderStatus(order._id, "confirmed")}
              >
                <FiCheck size={12} />
                Xác nhận
              </button>
            )}

            {/* Confirmed → Go to Shipper page */}
            {status === "confirmed" && (
              <button
                className="inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-2 rounded-lg transition-all font-medium"
                onClick={() => navigate("/admin/shippers")}
              >
                <FiTruck size={12} />
                Gán shipper
              </button>
            )}

            {/* Assigned → Show shipper name + can start delivery */}
            {status === "assigned_to_shipper" && (
              <>
                <div className="text-xs text-mono-600 bg-mono-100 px-2 py-1.5 rounded text-center">
                  <span className="font-medium">
                    {order.shipperName || "Đã gán"}
                  </span>
                </div>
                <button
                  className="inline-flex items-center justify-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs px-3 py-2 rounded-lg transition-all font-medium"
                  onClick={() =>
                    handleUpdateOrderStatus(order._id, "out_for_delivery")
                  }
                >
                  <FiTruck size={12} />
                  Bắt đầu giao
                </button>
              </>
            )}

            {/* Out for delivery → Show shipper */}
            {status === "out_for_delivery" && (
              <div className="text-xs text-violet-600 bg-violet-50 px-2 py-1.5 rounded text-center font-medium border border-violet-200">
                🚚 {order.shipperName || "Đang giao"}
              </div>
            )}

            {/* Delivery failed → Retry or return to warehouse */}
            {status === "delivery_failed" && (
              <>
                <button
                  className="inline-flex items-center justify-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs px-3 py-2 rounded-lg transition-all font-medium"
                  onClick={() =>
                    handleUpdateOrderStatus(order._id, "out_for_delivery")
                  }
                >
                  <FiRefreshCw size={12} />
                  Giao lại
                </button>
                <button
                  className="inline-flex items-center justify-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-2 rounded-lg transition-all font-medium"
                  onClick={() =>
                    handleUpdateOrderStatus(order._id, "returning_to_warehouse")
                  }
                >
                  Trả về kho
                </button>
              </>
            )}

            {/* Returning to warehouse → Cancel */}
            {status === "returning_to_warehouse" && (
              <button
                className="inline-flex items-center justify-center gap-1.5 bg-mono-600 hover:bg-mono-700 text-white text-xs px-3 py-2 rounded-lg transition-all font-medium"
                onClick={() => handleUpdateOrderStatus(order._id, "cancelled")}
              >
                Xác nhận hủy
              </button>
            )}

            {/* Returned → Confirm return received */}
            {status === "returned" && (
              <button
                className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-lg transition-all font-medium"
                onClick={() => handleConfirmReturn(order._id)}
              >
                Xác nhận trả hàng
              </button>
            )}

            {/* Cancelled/Returned + paid → Refund (Admin only) */}
            {hasAdminOnlyAccess() &&
              (status === "cancelled" || status === "returned") &&
              order.paymentStatusRaw === "paid" && (
                <button
                  className="inline-flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs px-3 py-2 rounded-lg transition-all font-medium"
                  onClick={() => handleRefundOrder(order._id)}
                >
                  Hoàn tiền
                </button>
              )}

            {/* Force confirm payment - Admin Only, VNPAY unpaid */}
            {hasAdminOnlyAccess() &&
              order.paymentMethod === "VNPAY" &&
              order.paymentStatusRaw !== "paid" && (
                <button
                  className="inline-flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs px-3 py-2 rounded-lg transition-all font-medium"
                  onClick={() => handleForceConfirmPayment(order._id)}
                  title="Force xác nhận thanh toán khi VNPAY callback failed"
                >
                  Xác nhận TT
                </button>
              )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 w-full min-h-screen bg-mono-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-mono-900">Quản lý đơn hàng</h1>
          <p className="text-mono-500 text-sm mt-1">
            Theo dõi và xử lý các đơn hàng của khách hàng
          </p>
        </div>

        {/* Quick action - Go to shipper page if there are confirmed orders */}
        {confirmedOrdersCount > 0 && (
          <button
            onClick={() => navigate("/admin/shippers")}
            className="inline-flex items-center gap-2 bg-mono-900 hover:bg-mono-800 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm"
          >
            <FiTruck size={18} />
            Gán shipper ({confirmedOrdersCount} đơn chờ)
            <FiArrowRight size={16} />
          </button>
        )}
      </div>

      {/* Main tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-mono-200 mb-6">
        <div className="flex border-b border-mono-200">
          <button
            onClick={() => setTab("orders")}
            className={`px-6 py-4 font-medium transition-all border-b-2 -mb-px ${
              tab === "orders"
                ? "text-mono-900 border-mono-900"
                : "text-mono-500 border-transparent hover:text-mono-700"
            }`}
          >
            Danh sách đơn hàng
          </button>
          <button
            onClick={() => setTab("cancel")}
            className={`px-6 py-4 font-medium transition-all border-b-2 -mb-px ${
              tab === "cancel"
                ? "text-mono-900 border-mono-900"
                : "text-mono-500 border-transparent hover:text-mono-700"
            }`}
          >
            Yêu cầu hủy đơn
          </button>
        </div>

        {/* Orders content */}
        {tab === "orders" && (
          <div className="p-6">
            {/* Status tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { key: "all" as OrderTab, label: "Tất cả", icon: "📋" },
                { key: "pending" as OrderTab, label: "Cần xử lý", icon: "⏳" },
                {
                  key: "processing" as OrderTab,
                  label: "Đã gán shipper",
                  icon: "👤",
                },
                {
                  key: "delivering" as OrderTab,
                  label: "Đang giao",
                  icon: "🚚",
                },
                {
                  key: "completed" as OrderTab,
                  label: "Hoàn thành",
                  icon: "✅",
                },
                { key: "issues" as OrderTab, label: "Có vấn đề", icon: "⚠️" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => {
                    setOrderTab(t.key);
                    setStatusFilter("");
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    orderTab === t.key
                      ? "bg-mono-900 text-white shadow-md"
                      : "bg-mono-100 text-mono-600 hover:bg-mono-200"
                  }`}
                >
                  <span>{t.icon}</span>
                  {t.label}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      orderTab === t.key
                        ? "bg-white/20 text-white"
                        : "bg-mono-200 text-mono-700"
                    }`}
                  >
                    {statusCounts[t.key]}
                  </span>
                </button>
              ))}
            </div>

            {/* Search and filters */}
            <div className="flex items-center gap-3 flex-wrap mb-6">
              <div className="relative flex-1 min-w-[280px]">
                <FiSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-400"
                  size={18}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Tìm mã đơn, tên khách hàng, SĐT..."
                  className="w-full pl-10 pr-4 py-2.5 border border-mono-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900 focus:border-transparent text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <FiFilter className="text-mono-400" size={18} />
                <select
                  className="py-2.5 px-4 border border-mono-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-mono-900"
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  value={paymentFilter}
                >
                  <option value="">Thanh toán</option>
                  <option value="Đã thanh toán">Đã thanh toán</option>
                  <option value="Chưa thanh toán">Chưa thanh toán</option>
                </select>

                <select
                  className="py-2.5 px-4 border border-mono-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-mono-900"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  value={statusFilter}
                >
                  <option value="">Trạng thái</option>
                  {Object.entries(ORDER_STATUS_MAP).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>

                {(searchQuery ||
                  paymentFilter ||
                  statusFilter ||
                  orderTab !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setPaymentFilter("");
                      setStatusFilter("");
                      setOrderTab("all");
                    }}
                    className="inline-flex items-center gap-1 text-sm text-mono-500 hover:text-mono-700 px-3 py-2"
                  >
                    <FiX size={14} />
                    Xóa lọc
                  </button>
                )}
              </div>
            </div>

            {/* Orders table */}
            <div className="overflow-x-auto rounded-lg border border-mono-200">
              <table className="min-w-full bg-white">
                <thead className="bg-mono-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-mono-600 uppercase tracking-wider">
                      Mã đơn
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-mono-600 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-mono-600 uppercase tracking-wider">
                      SĐT
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-mono-600 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-mono-600 uppercase tracking-wider">
                      Thanh toán
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-mono-600 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-mono-600 uppercase tracking-wider">
                      Shipper
                    </th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-mono-600 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mono-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12">
                        <div className="flex items-center justify-center gap-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-mono-300 border-t-mono-900"></div>
                          <span className="text-mono-500">
                            Đang tải dữ liệu...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12">
                        <div className="text-mono-400">
                          <div className="text-4xl mb-2">📭</div>
                          <p>Không có đơn hàng nào</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-mono-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm">
                          <span className="font-mono font-medium text-mono-900">
                            {order.orderCode.slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="font-medium text-mono-900">
                            {order.customerName}
                          </div>
                          <div
                            className="text-xs text-mono-500 truncate max-w-[180px]"
                            title={order.address}
                          >
                            {order.address}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-mono-700">
                          {order.phone}
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-mono-900">
                          {order.price}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              order.paymentStatusRaw === "paid"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                          <div className="text-xs text-mono-400 mt-1">
                            {order.paymentMethod}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              STATUS_COLORS[order.orderStatusRaw || ""] ||
                              "bg-mono-100 text-mono-600"
                            }`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {order.shipperName ? (
                            <span className="font-medium text-mono-700">
                              {order.shipperName}
                            </span>
                          ) : (
                            <span className="text-mono-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">{renderActions(order)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="mt-4 flex items-center justify-between text-sm text-mono-500">
              <span>
                Hiển thị {filteredOrders.length} / {orders.length} đơn hàng
              </span>
              <button
                onClick={fetchOrders}
                className="inline-flex items-center gap-1 text-mono-600 hover:text-mono-900"
              >
                <FiRefreshCw size={14} />
                Làm mới
              </button>
            </div>
          </div>
        )}

        {/* Cancel requests */}
        {tab === "cancel" && (
          <div className="p-6">
            <CancelRequestList />
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-mono-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Chi tiết đơn hàng</h3>
              <button
                onClick={handleCloseModal}
                className="text-white/80 hover:text-white transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-mono-100">
                  <span className="text-mono-500">Mã đơn hàng</span>
                  <span className="font-mono font-semibold text-mono-900">
                    {selectedOrder.orderCode.slice(-8).toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-mono-500">Khách hàng</span>
                  <span className="font-medium text-mono-900">
                    {selectedOrder.customerName}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-mono-500">Địa chỉ</span>
                  <span className="text-mono-900 text-right max-w-[60%]">
                    {selectedOrder.address}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-mono-500">Số điện thoại</span>
                  <span className="text-mono-900">{selectedOrder.phone}</span>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-mono-100">
                  <span className="text-mono-500">Tổng tiền</span>
                  <span className="text-xl font-bold text-mono-900">
                    {selectedOrder.price}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-mono-500">Thanh toán</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedOrder.paymentStatusRaw === "paid"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {selectedOrder.paymentStatus}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-mono-500">Phương thức</span>
                  <span className="text-mono-900">
                    {selectedOrder.paymentMethod}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-mono-500">Trạng thái</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      STATUS_COLORS[selectedOrder.orderStatusRaw || ""] ||
                      "bg-mono-100 text-mono-600"
                    }`}
                  >
                    {selectedOrder.orderStatus}
                  </span>
                </div>

                {selectedOrder.shipperName && (
                  <div className="flex justify-between items-center pt-4 border-t border-mono-100">
                    <span className="text-mono-500">Shipper</span>
                    <span className="font-medium text-mono-900">
                      {selectedOrder.shipperName}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-mono-50 border-t border-mono-200">
              <button
                onClick={handleCloseModal}
                className="w-full bg-mono-900 hover:bg-mono-800 text-white py-2.5 rounded-lg font-medium transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListOrderPage;
