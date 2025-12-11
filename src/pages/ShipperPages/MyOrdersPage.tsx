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
} from "react-icons/fi";
import { shipperService } from "../../services/ShipperService";

// Use local interface to avoid type conflicts with global Order type
interface DeliveryAttempt {
  time?: string; // BE field name
  status: string;
  note?: string;
}

interface ShipperOrder {
  _id: string;
  orderNumber?: string;
  code?: string;
  status: string;
  createdAt: string;
  user?: { name: string; phone?: string };
  shippingAddress?: {
    name?: string;
    phone?: string;
    detail?: string;
    ward?: string;
    district?: string;
    province?: string;
    address?: string;
  };
  totalAfterDiscountAndShipping?: number;
  finalTotal?: number;
  totalAmount?: number;
  items?: { _id: string }[];
  payment?: {
    method?: string;
    paymentStatus?: string;
  };
  deliveryAttempts?: DeliveryAttempt[];
}

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ShipperOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ShipperOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

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
          (o.orderNumber || o.code || o._id).toLowerCase().includes(query) ||
          (o.user?.name || "").toLowerCase().includes(query) ||
          (o.shippingAddress?.phone || "").includes(query)
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
      const mappedOrders: ShipperOrder[] = (
        Array.isArray(ordersData) ? ordersData : []
      ).map((o: any) => ({
        _id: o._id,
        orderNumber: o.orderNumber,
        code: o.code,
        status: o.status,
        createdAt: o.createdAt,
        user: o.user,
        shippingAddress: o.shippingAddress,
        totalAfterDiscountAndShipping: o.totalAfterDiscountAndShipping,
        finalTotal: o.finalTotal,
        totalAmount: o.totalAmount,
        items: o.orderItems || o.items,
        payment: o.payment,
        deliveryAttempts: o.deliveryAttempts,
      }));
      /* eslint-enable @typescript-eslint/no-explicit-any */
      setOrders(mappedOrders);
      setFilteredOrders(mappedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const STATUS_CONFIG: Record<
    string,
    { label: string; color: string; icon: JSX.Element }
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
    delivery_failed: {
      label: "Thất bại",
      color: "bg-rose-50 text-rose-700 border border-rose-200",
      icon: <FiXCircle size={14} />,
    },
  };

  const getStatusBadge = (status: string) => {
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
      delivery_failed: orders.filter((o) => o.status === "delivery_failed")
        .length,
    };
  };

  const counts = getStatusCounts();

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

      {/* Stats Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
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
            key: "delivery_failed",
            label: "Thất bại",
            count: counts.delivery_failed,
          },
        ].map((tab) => (
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

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-mono-200 shadow-sm mb-6">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
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
        </div>

        {/* Results count */}
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
                      #
                      {(order.orderNumber || order.code || order._id)
                        .toString()
                        .slice(-8)
                        .toUpperCase()}
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
                        .join(", ") ||
                        order.shippingAddress?.address ||
                        "N/A"}
                    </p>
                  </div>
                </div>

                {/* Order Info */}
                <div className="flex items-center justify-between py-3 border-t border-mono-100">
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-mono-500">
                      <span className="font-medium text-mono-700">
                        {order.items?.length || 0}
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
                      {formatCurrency(
                        order.totalAfterDiscountAndShipping ||
                          order.finalTotal ||
                          order.totalAmount ||
                          0
                      )}
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
                          {new Date(
                            order.deliveryAttempts[
                              order.deliveryAttempts.length - 1
                            ].time || order.createdAt
                          ).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  )}
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 bg-mono-50 border-t border-mono-100">
                <button
                  onClick={() => navigate(`/shipper/orders/${order._id}`)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-mono-900 hover:bg-mono-800 text-white py-2.5 rounded-lg font-medium text-sm transition-colors"
                >
                  Xem chi tiết & Cập nhật
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
