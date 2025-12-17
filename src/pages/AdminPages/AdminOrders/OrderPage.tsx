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
  FiDollarSign,
} from "react-icons/fi";
import { FaUniversity } from "react-icons/fa";

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

// Tab filters - Phân loại rõ ràng theo trạng thái
type OrderTab =
  | "all"
  | "pending"
  | "delivering"
  | "delivered"
  | "delivery_failed"
  | "cancelled"
  | "refunded";

const TAB_FILTERS: Record<OrderTab, string[]> = {
  all: [],
  pending: ["pending", "confirmed"], // Đơn mới cần xử lý
  delivering: ["assigned_to_shipper", "out_for_delivery"], // Đang vận chuyển
  delivered: ["delivered"], // Đã giao thành công (chỉ delivered)
  delivery_failed: ["delivery_failed", "returning_to_warehouse"], // Giao thất bại, đang trả về kho
  cancelled: ["cancelled"], // Đã hủy
  refunded: ["refunded", "returned"], // Đã hoàn tiền / đã trả hàng (kết quả cuối)
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
  shipperPhone?: string;
  shipperEmail?: string;
  createdAt?: string;
  // Refund info
  refund?: {
    status?: string;
    amount?: number;
    bankInfo?: {
      bankName?: string;
      accountNumber?: string;
      accountName?: string;
    };
  };
  returnConfirmed?: boolean;
}

// Order detail interface with orderItems
interface OrderDetail extends OrderListItem {
  orderItems: {
    _id: string;
    productName: string;
    quantity: number;
    price: number;
    image: string;
    variant?: {
      _id: string;
      color?: { name: string; code: string };
      imagesvariant?: string[];
      product?: {
        name: string;
        images?: string[];
      };
    };
    size?: {
      _id: string;
      value: string;
    };
  }[];
  subTotal: number;
  discount: number;
  shippingFee: number;
  couponDetail?: {
    code: string;
    type: string;
    value: number;
  };
  refund?: {
    status?: string;
    amount?: number;
    method?: string;
    bankInfo?: {
      bankName?: string;
      accountNumber?: string;
      accountName?: string;
    };
    requestedAt?: string;
  };
  returnConfirmed?: boolean;
}

const ListOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { canProcessOrders, hasAdminOnlyAccess } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"orders" | "cancel">("orders");
  const [orderTab, setOrderTab] = useState<OrderTab>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const ITEMS_PER_PAGE = 20;

  // Refund modal state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundOrderInfo, setRefundOrderInfo] = useState<OrderListItem | null>(
    null
  );
  const [refundNotes, setRefundNotes] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);

  // Lấy danh sách đơn hàng từ API
  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminOrderService.getAllOrders({
        page,
        limit: ITEMS_PER_PAGE,
      });
      const { pagination } = res.data;
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
          shipperName: o.assignedShipper?.name || "",
          shipperId: o.assignedShipper?._id || "",
          shipperPhone: o.assignedShipper?.phone || "",
          shipperEmail: o.assignedShipper?.email || "",
          createdAt: o.createdAt,
          // Refund info
          refund: o.refund || null,
          returnConfirmed: o.returnConfirmed || false,
        }))
      );
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Update pagination state
      if (pagination) {
        setCurrentPage(pagination.page);
        setTotalPages(pagination.totalPages);
        setTotalOrders(pagination.total);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "orders") {
      fetchOrders(currentPage);
    }
  }, [tab, currentPage]);

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
        shipperName: o.assignedShipper?.name || "",
        shipperId: o.assignedShipper?._id || "",
        shipperPhone: o.assignedShipper?.phone || "",
        shipperEmail: o.assignedShipper?.email || "",
        // Order items detail
        orderItems: o.orderItems || [],
        subTotal: o.subTotal || 0,
        discount: o.discount || 0,
        shippingFee: o.shippingFee || 0,
        couponDetail: o.couponDetail || null,
        // Refund info
        refund: o.refund || null,
        returnConfirmed: o.returnConfirmed || false,
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

  // Xác nhận đã hoàn tiền (khi user đã gửi bank info)
  const handleOpenRefundModal = (order: OrderListItem) => {
    setRefundOrderInfo(order);
    setRefundNotes("");
    setShowRefundModal(true);
  };

  const handleCloseRefundModal = () => {
    setShowRefundModal(false);
    setRefundOrderInfo(null);
    setRefundNotes("");
  };

  const handleConfirmRefund = async () => {
    if (!refundOrderInfo) return;

    setRefundLoading(true);
    try {
      await adminOrderService.confirmRefund(refundOrderInfo._id, refundNotes);
      toast.success("Đã xác nhận hoàn tiền thành công");
      handleCloseRefundModal();
      fetchOrders();
    } catch (error) {
      console.error("Error confirming refund:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "Không thể xác nhận hoàn tiền"
      );
    } finally {
      setRefundLoading(false);
    }
  };

  // Get status counts for tabs
  const statusCounts = useMemo(() => {
    const counts: Record<OrderTab, number> = {
      all: orders.length,
      pending: 0,
      delivering: 0,
      delivered: 0,
      delivery_failed: 0,
      cancelled: 0,
      refunded: 0,
    };

    orders.forEach((order) => {
      const status = order.orderStatusRaw || "";
      if (TAB_FILTERS.pending.includes(status)) counts.pending++;
      if (TAB_FILTERS.delivering.includes(status)) counts.delivering++;
      if (TAB_FILTERS.delivered.includes(status)) counts.delivered++;
      if (TAB_FILTERS.delivery_failed.includes(status))
        counts.delivery_failed++;
      if (TAB_FILTERS.cancelled.includes(status)) counts.cancelled++;
      if (TAB_FILTERS.refunded.includes(status)) counts.refunded++;
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

            {/* Assigned → Show shipper name (shipper sẽ tự ấn "Bắt đầu giao" trên app) */}
            {status === "assigned_to_shipper" && (
              <div className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1.5 rounded text-center font-medium border border-indigo-200">
                👤 {order.shipperName || "Đã gán shipper"} - Chờ shipper bắt đầu
                giao
              </div>
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

            {/* Returning to warehouse → Confirm received */}
            {status === "returning_to_warehouse" && (
              <>
                <button
                  className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-lg transition-all font-medium"
                  onClick={() => handleConfirmReturn(order._id)}
                >
                  <FiCheck size={12} />
                  Nhận về kho
                </button>
                {order.paymentStatusRaw === "paid" && (
                  <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1.5 rounded text-center font-medium border border-amber-200">
                    💰 Chờ user điền bank info
                  </div>
                )}
              </>
            )}

            {/* Returned → Đơn đã trả hàng (đang được xử lý ở trang Quản lý Trả hàng) */}
            {status === "returned" && (
              <div className="text-xs text-pink-600 bg-pink-50 px-2 py-1.5 rounded text-center font-medium border border-pink-200">
                📦 Đã nhận hàng trả về - Xử lý hoàn tiền tại trang Quản lý Trả
                hàng
              </div>
            )}

            {/* Cancelled + paid + có bank info pending → Xác nhận hoàn tiền */}
            {hasAdminOnlyAccess() &&
              status === "cancelled" &&
              order.paymentStatusRaw === "paid" &&
              order.refund?.status === "pending" &&
              order.refund?.bankInfo?.accountNumber && (
                <button
                  className="inline-flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs px-3 py-2 rounded-lg transition-all font-medium"
                  onClick={() => handleOpenRefundModal(order)}
                >
                  💳 Xác nhận đã hoàn tiền
                </button>
              )}

            {/* Cancelled + paid + chưa có bank info → Chờ user điền */}
            {status === "cancelled" &&
              order.paymentStatusRaw === "paid" &&
              !order.refund?.bankInfo?.accountNumber && (
                <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1.5 rounded text-center font-medium border border-amber-200">
                  ⏳ Chờ KH gửi thông tin ngân hàng
                </div>
              )}

            {/* Refunded → Đã hoàn tiền */}
            {status === "refunded" && (
              <div className="text-xs text-teal-600 bg-teal-50 px-2 py-1.5 rounded text-center font-medium border border-teal-200">
                ✅ Đã hoàn tiền
              </div>
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
                  key: "delivering" as OrderTab,
                  label: "Đang giao",
                  icon: "🚚",
                },
                {
                  key: "delivered" as OrderTab,
                  label: "Đã giao",
                  icon: "✅",
                },
                {
                  key: "delivery_failed" as OrderTab,
                  label: "Giao thất bại",
                  icon: "⚠️",
                },
                {
                  key: "cancelled" as OrderTab,
                  label: "Đã hủy",
                  icon: "❌",
                },
                {
                  key: "refunded" as OrderTab,
                  label: "Hoàn tiền/Trả hàng",
                  icon: "💰",
                },
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-mono-500">
                  Hiển thị {filteredOrders.length} / {totalOrders} đơn hàng
                  (Trang {currentPage} / {totalPages})
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm border border-mono-200 rounded-lg hover:bg-mono-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 text-sm rounded-lg ${
                            currentPage === pageNum
                              ? "bg-mono-900 text-white"
                              : "border border-mono-200 hover:bg-mono-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm border border-mono-200 rounded-lg hover:bg-mono-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}

            {/* Summary when single page */}
            {totalPages <= 1 && (
              <div className="mt-4 flex items-center justify-between text-sm text-mono-500">
                <span>
                  Hiển thị {filteredOrders.length} / {totalOrders} đơn hàng
                </span>
                <button
                  onClick={() => fetchOrders(currentPage)}
                  className="inline-flex items-center gap-1 text-mono-600 hover:text-mono-900"
                >
                  <FiRefreshCw size={14} />
                  Làm mới
                </button>
              </div>
            )}
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-mono-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Chi tiết đơn hàng</h3>
                <p className="text-mono-300 text-sm font-mono">
                  #{selectedOrder.orderCode.slice(-8).toUpperCase()}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-white/80 hover:text-white transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Order Items Section */}
              <div className="p-6 border-b border-mono-100">
                <h4 className="font-semibold text-mono-900 mb-4">
                  Sản phẩm đặt hàng ({selectedOrder.orderItems?.length || 0})
                </h4>
                <div className="space-y-3">
                  {selectedOrder.orderItems?.map((item, index) => {
                    const itemImage =
                      item.image ||
                      item.variant?.imagesvariant?.[0] ||
                      item.variant?.product?.images?.[0] ||
                      "";
                    const colorName = item.variant?.color?.name || "—";
                    const colorCode = item.variant?.color?.code || "#ccc";
                    const sizeValue = item.size?.value || "—";

                    return (
                      <div
                        key={item._id || index}
                        className="flex gap-4 p-3 bg-mono-50 rounded-lg"
                      >
                        {/* Product Image */}
                        <div className="w-20 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden border border-mono-200">
                          {itemImage ? (
                            <img
                              src={itemImage}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-mono-400 text-2xl">
                              📦
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-mono-900 text-sm truncate">
                            {item.productName}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-mono-500">
                            {/* Color */}
                            <span className="flex items-center gap-1">
                              <span
                                className="w-3 h-3 rounded-full border border-mono-300"
                                style={{ backgroundColor: colorCode }}
                              ></span>
                              {colorName}
                            </span>
                            {/* Size */}
                            <span className="px-1.5 py-0.5 bg-mono-200 rounded text-mono-700 font-medium">
                              Size {sizeValue}
                            </span>
                            {/* Quantity */}
                            <span>x{item.quantity}</span>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm font-semibold text-mono-900">
                              {item.price.toLocaleString("vi-VN")}₫
                            </span>
                            <span className="text-xs text-mono-500">
                              ={" "}
                              {(item.price * item.quantity).toLocaleString(
                                "vi-VN"
                              )}
                              ₫
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer & Shipping Info */}
              <div className="p-6 border-b border-mono-100">
                <h4 className="font-semibold text-mono-900 mb-3">
                  Thông tin giao hàng
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-mono-500">Khách hàng</span>
                    <span className="font-medium text-mono-900">
                      {selectedOrder.customerName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mono-500">Số điện thoại</span>
                    <span className="text-mono-900">{selectedOrder.phone}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-mono-500">Địa chỉ</span>
                    <span className="text-mono-900 text-right max-w-[60%]">
                      {selectedOrder.address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipper Info (if assigned) */}
              {selectedOrder.shipperName && (
                <div className="p-6 border-b border-mono-100 bg-indigo-50/50">
                  <h4 className="font-semibold text-mono-900 mb-3 flex items-center gap-2">
                    <FiTruck className="text-indigo-600" /> Thông tin shipper
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-mono-500">Tên</span>
                      <span className="font-medium text-mono-900">
                        {selectedOrder.shipperName}
                      </span>
                    </div>
                    {selectedOrder.shipperPhone && (
                      <div className="flex justify-between">
                        <span className="text-mono-500">SĐT</span>
                        <span className="text-mono-900">
                          {selectedOrder.shipperPhone}
                        </span>
                      </div>
                    )}
                    {selectedOrder.shipperEmail && (
                      <div className="flex justify-between">
                        <span className="text-mono-500">Email</span>
                        <span className="text-mono-900">
                          {selectedOrder.shipperEmail}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment & Totals */}
              <div className="p-6">
                <h4 className="font-semibold text-mono-900 mb-3">
                  Thanh toán & Tổng tiền
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-mono-500">Tạm tính</span>
                    <span className="text-mono-900">
                      {selectedOrder.subTotal?.toLocaleString("vi-VN") || 0}₫
                    </span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>
                        Giảm giá{" "}
                        {selectedOrder.couponDetail?.code && (
                          <span className="text-xs bg-emerald-100 px-1 rounded">
                            {selectedOrder.couponDetail.code}
                          </span>
                        )}
                      </span>
                      <span>
                        -{selectedOrder.discount.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-mono-500">Phí vận chuyển</span>
                    <span className="text-mono-900">
                      {selectedOrder.shippingFee === 0
                        ? "Miễn phí"
                        : `${selectedOrder.shippingFee?.toLocaleString(
                            "vi-VN"
                          )}₫`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 mt-2 border-t border-mono-200">
                    <span className="font-semibold text-mono-900">
                      Tổng cộng
                    </span>
                    <span className="text-lg font-bold text-mono-900">
                      {selectedOrder.price}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-mono-500">Phương thức</span>
                    <span className="text-mono-900 font-medium">
                      {selectedOrder.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-mono-500">Trạng thái TT</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        selectedOrder.paymentStatusRaw === "paid"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-mono-500">Trạng thái đơn</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        STATUS_COLORS[selectedOrder.orderStatusRaw || ""] ||
                        "bg-mono-100 text-mono-600"
                      }`}
                    >
                      {selectedOrder.orderStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Refund Info - Hiển thị khi có yêu cầu hoàn tiền */}
              {selectedOrder.refund?.bankInfo?.accountNumber && (
                <div className="p-6 border-t border-mono-100 bg-teal-50/50">
                  <h4 className="font-semibold text-mono-900 mb-3 flex items-center gap-2">
                    💳 Thông tin hoàn tiền
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-mono-500">Số tiền hoàn</span>
                      <span className="font-semibold text-teal-600">
                        {selectedOrder.refund.amount?.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mono-500">Ngân hàng</span>
                      <span className="text-mono-900">
                        {selectedOrder.refund.bankInfo.bankName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mono-500">Số tài khoản</span>
                      <span className="font-mono text-mono-900">
                        {selectedOrder.refund.bankInfo.accountNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mono-500">Chủ tài khoản</span>
                      <span className="font-medium text-mono-900">
                        {selectedOrder.refund.bankInfo.accountName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-teal-200">
                      <span className="text-mono-500">Trạng thái</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          selectedOrder.refund.status === "completed"
                            ? "bg-teal-100 text-teal-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {selectedOrder.refund.status === "completed"
                          ? "Đã hoàn tiền"
                          : "Chờ xử lý"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
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

      {/* Refund Confirmation Modal */}
      {showRefundModal && refundOrderInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-mono-200">
              <div className="flex items-center gap-2">
                <FiDollarSign className="text-teal-600 text-xl" />
                <h3 className="text-lg font-semibold text-mono-900">
                  Xác nhận hoàn tiền
                </h3>
              </div>
              <button
                onClick={handleCloseRefundModal}
                className="text-mono-400 hover:text-mono-600"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              {/* Order Info */}
              <div className="bg-mono-50 p-3 rounded-lg">
                <p className="text-sm text-mono-600">Mã đơn hàng</p>
                <p className="font-semibold text-mono-900">
                  {refundOrderInfo.orderCode}
                </p>
                <p className="text-sm text-mono-500 mt-1">
                  Khách hàng: {refundOrderInfo.customerName}
                </p>
              </div>

              {/* Bank Info */}
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                <div className="flex items-center gap-2 mb-3">
                  <FaUniversity className="text-teal-600" />
                  <span className="font-semibold text-teal-800">
                    Thông tin chuyển khoản
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-mono-500">Ngân hàng:</span>
                    <span className="font-medium text-mono-800">
                      {refundOrderInfo.refund?.bankInfo?.bankName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mono-500">Số tài khoản:</span>
                    <span className="font-bold text-mono-900 text-base">
                      {refundOrderInfo.refund?.bankInfo?.accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mono-500">Chủ tài khoản:</span>
                    <span className="font-medium text-mono-800">
                      {refundOrderInfo.refund?.bankInfo?.accountName}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 mt-2 border-t border-teal-200">
                    <span className="text-mono-500">Số tiền hoàn:</span>
                    <span className="font-bold text-teal-700 text-lg">
                      {refundOrderInfo.refund?.amount?.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes Input */}
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-1">
                  Mã giao dịch / Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  placeholder="VD: Mã GD: 123456789 - Đã chuyển khoản lúc 10:30..."
                  rows={3}
                  className="w-full px-3 py-2 border border-mono-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>

              {/* Warning */}
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  ⚠️ Vui lòng đảm bảo đã chuyển khoản thành công trước khi xác
                  nhận. Hành động này không thể hoàn tác.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-4 border-t border-mono-200">
              <button
                onClick={handleCloseRefundModal}
                className="flex-1 px-4 py-2.5 border border-mono-300 text-mono-700 rounded-lg hover:bg-mono-100 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmRefund}
                disabled={refundLoading}
                className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {refundLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <FiCheck />
                    Xác nhận đã hoàn tiền
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListOrderPage;
