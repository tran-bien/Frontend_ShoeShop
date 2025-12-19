/**
 * ShipperDashboardPage - Tổng quan hoạt động của Shipper
 * SYNCED WITH BE: shipper.service.js - getShipperOrders(), getMyStats()
 */
import { useState, useEffect } from "react";
import {
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiMapPin,
  FiPhone,
  FiPackage,
  FiRefreshCw,
  FiChevronRight,
  FiCalendar,
  FiTrendingUp,
  FiAlertCircle,
  FiUser,
  FiRotateCw,
} from "react-icons/fi";
import { shipperService } from "../../services/ShipperService";
import { useNavigate } from "react-router-dom";
import type { Order, OrderStatus } from "../../types/order";

// ===== STATUS CONFIG =====
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
  // ✅ returned cũng hiển thị như "Đã giao"
  returned: {
    label: "Đã giao",
    color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: <FiCheckCircle size={14} />,
  },
  delivery_failed: {
    label: "Thất bại",
    color: "bg-rose-50 text-rose-700 border border-rose-200",
    icon: <FiXCircle size={14} />,
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

// Stats theo API getMyStats (giống ShipperProfilePage)
interface ShipperStats {
  totalOrders: number;
  completedOrders: number;
  failedOrders: number;
  activeOrders: number;
  successRate: string; // backend trả string "0" / "55.5"
}

const ShipperDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ShipperStats | null>(null);
  const [todayOrders, setTodayOrders] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // ✅ Lấy orders + stats song song
      const [ordersRes, statsRes] = await Promise.all([
        shipperService.getMyOrders(),
        shipperService.getMyStats(),
      ]);

      /* eslint-disable @typescript-eslint/no-explicit-any */
      const ordersResponseData =
        (ordersRes.data as any)?.data || (ordersRes.data as any);
      const ordersData = ordersResponseData?.orders || ordersResponseData || [];
      const orders: Order[] = Array.isArray(ordersData) ? ordersData : [];

      const statsData =
        (statsRes.data as any)?.data?.stats ||
        (statsRes.data as any)?.stats ||
        (statsRes.data as any)?.data ||
        {};
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // ===== TODAY ORDERS =====
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrdersList = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });

      // ===== ACTIVE ORDERS (shipper can action) =====
      const activeOrdersList = orders.filter(
        (order) =>
          order.status === "assigned_to_shipper" ||
          order.status === "out_for_delivery"
      );

      setTodayOrders(todayOrdersList);
      setActiveOrders(activeOrdersList);

      // ===== STATS FROM API =====
      setStats({
        totalOrders: statsData.totalOrders || 0,
        completedOrders: statsData.completedOrders || 0,
        failedOrders: statsData.failedOrders || 0,
        activeOrders: statsData.activeOrders || 0,
        successRate: statsData.successRate || "0",
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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
    });
  };

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-mono-900">Tổng quan</h1>
          <p className="text-mono-500 text-sm mt-1">
            Xin chào! Đây là tổng quan hoạt động giao hàng của bạn
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 bg-white hover:bg-mono-50 text-mono-700 border border-mono-200 px-4 py-2.5 rounded-lg transition-all font-medium text-sm"
        >
          <FiRefreshCw size={16} />
          Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Orders */}
        <div className="bg-white rounded-xl p-5 border border-mono-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-mono-100 rounded-xl">
              <FiPackage className="text-mono-700" size={22} />
            </div>
            <div>
              <p className="text-xs text-mono-500 font-medium uppercase tracking-wide">
                Tổng đơn
              </p>
              <p className="text-2xl font-bold text-mono-900">
                {stats?.totalOrders || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-xl p-5 border border-mono-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <FiCheckCircle className="text-emerald-600" size={22} />
            </div>
            <div>
              <p className="text-xs text-mono-500 font-medium uppercase tracking-wide">
                Đã giao
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                {stats?.completedOrders || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Failed */}
        <div className="bg-white rounded-xl p-5 border border-mono-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-50 rounded-xl">
              <FiXCircle className="text-rose-600" size={22} />
            </div>
            <div>
              <p className="text-xs text-mono-500 font-medium uppercase tracking-wide">
                Thất bại
              </p>
              <p className="text-2xl font-bold text-rose-600">
                {stats?.failedOrders || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white rounded-xl p-5 border border-mono-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <FiTrendingUp className="text-blue-600" size={22} />
            </div>
            <div>
              <p className="text-xs text-mono-500 font-medium uppercase tracking-wide">
                Tỷ lệ thành công
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {stats?.successRate || "0"}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Active Orders */}
        <div className="bg-white rounded-xl border border-mono-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-mono-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <FiTruck className="text-amber-600" size={18} />
              </div>
              <div>
                <h2 className="font-semibold text-mono-900">
                  Đơn hàng đang giao
                </h2>
                <p className="text-xs text-mono-500">
                  {activeOrders.length} đơn cần xử lý
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/shipper/orders")}
              className="text-sm text-mono-600 hover:text-mono-900 font-medium inline-flex items-center gap-1"
            >
              Xem tất cả
              <FiChevronRight size={16} />
            </button>
          </div>

          <div className="p-5">
            {activeOrders.length === 0 ? (
              <div className="text-center py-8">
                <FiPackage className="mx-auto text-mono-300 mb-3" size={40} />
                <p className="text-mono-500 font-medium">
                  Không có đơn hàng nào đang giao
                </p>
                <p className="text-mono-400 text-sm mt-1">
                  Các đơn hàng mới sẽ hiển thị ở đây
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeOrders.slice(0, 4).map((order) => (
                  <div
                    key={order._id}
                    onClick={() => navigate(`/shipper/orders/${order._id}`)}
                    className="border border-mono-200 rounded-xl p-4 hover:border-mono-300 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-mono font-bold text-mono-900">
                          {order.code}
                        </p>
                        <div className="flex items-center gap-1.5 text-sm text-mono-600 mt-0.5">
                          <FiUser size={12} />
                          <span>
                            {order.user?.name ||
                              order.shippingAddress?.name ||
                              "N/A"}
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-start gap-2 text-mono-500">
                        <FiMapPin size={14} className="mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">
                          {[
                            order.shippingAddress?.detail,
                            order.shippingAddress?.ward,
                            order.shippingAddress?.district,
                            order.shippingAddress?.province,
                          ]
                            .filter(Boolean)
                            .join(", ") || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-mono-500">
                        <FiPhone size={14} />
                        <span>{order.shippingAddress?.phone || "N/A"}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-mono-100 flex items-center justify-between">
                      <span className="font-bold text-mono-900">
                        {formatCurrency(order.totalAfterDiscountAndShipping)}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-mono-400">
                        <FiClock size={12} />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Today's Orders */}
        <div className="bg-white rounded-xl border border-mono-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-mono-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-mono-100 rounded-lg">
                <FiCalendar className="text-mono-700" size={18} />
              </div>
              <div>
                <h2 className="font-semibold text-mono-900">
                  Đơn hàng hôm nay
                </h2>
                <p className="text-xs text-mono-500">
                  {todayOrders.length} đơn trong ngày
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {todayOrders.length === 0 ? (
              <div className="text-center py-12">
                <FiCalendar className="mx-auto text-mono-300 mb-3" size={40} />
                <p className="text-mono-500 font-medium">
                  Chưa có đơn hàng nào hôm nay
                </p>
                <p className="text-mono-400 text-sm mt-1">
                  Đơn hàng mới sẽ xuất hiện ở đây
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-mono-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-mono-500 uppercase tracking-wide">
                      Mã đơn
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-mono-500 uppercase tracking-wide">
                      Khách hàng
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-mono-500 uppercase tracking-wide">
                      Tổng tiền
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-mono-500 uppercase tracking-wide">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mono-100">
                  {todayOrders.slice(0, 6).map((order) => (
                    <tr
                      key={order._id}
                      onClick={() => navigate(`/shipper/orders/${order._id}`)}
                      className="hover:bg-mono-50 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-semibold text-mono-900">
                          {order.code}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-mono-600">
                        {order.user?.name ||
                          order.shippingAddress?.name ||
                          "N/A"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-mono-900 text-sm">
                          {formatCurrency(order.totalAfterDiscountAndShipping)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {getStatusBadge(order.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipperDashboardPage;
