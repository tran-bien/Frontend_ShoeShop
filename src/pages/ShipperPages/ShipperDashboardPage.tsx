import { useState, useEffect } from "react";
import {
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";
import ShipperService from "../../services/ShipperService";

const ShipperDashboardPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [todayOrders, setTodayOrders] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch my orders
      const ordersResponse = await ShipperService.getMyOrders();
      const orders = ordersResponse.data || [];

      // Filter today's orders
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrdersList = orders.filter((order: any) => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });

      // Filter active orders (assigned or out_for_delivery)
      const activeOrdersList = orders.filter(
        (order: any) =>
          order.status === "assigned_to_shipper" ||
          order.status === "out_for_delivery"
      );

      setTodayOrders(todayOrdersList);
      setActiveOrders(activeOrdersList);

      // Calculate stats
      const totalOrders = orders.length;
      const completed = orders.filter(
        (o: any) => o.status === "delivered"
      ).length;
      const failed = orders.filter(
        (o: any) => o.status === "delivery_failed"
      ).length;
      const successRate =
        totalOrders > 0 ? ((completed / totalOrders) * 100).toFixed(1) : 0;

      setStats({
        totalOrders,
        completed,
        failed,
        active: activeOrdersList.length,
        successRate,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      assigned_to_shipper: {
        label: "Đã gán",
        color: "bg-blue-100 text-blue-800",
        icon: <FaHourglassHalf />,
      },
      out_for_delivery: {
        label: "Đang giao",
        color: "bg-yellow-100 text-yellow-800",
        icon: <FaTruck />,
      },
      delivered: {
        label: "Đã giao",
        color: "bg-green-100 text-green-800",
        icon: <FaCheckCircle />,
      },
      delivery_failed: {
        label: "Thất bại",
        color: "bg-red-100 text-red-800",
        icon: <FaTimesCircle />,
      },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      color: "bg-gray-100 text-gray-800",
      icon: null,
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusInfo.color}`}
      >
        {statusInfo.icon}
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Tổng đơn hàng</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats?.totalOrders || 0}
              </p>
            </div>
            <div className="bg-blue-100 p-4 rounded-full">
              <FaTruck size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Đã giao</p>
              <p className="text-3xl font-bold text-green-600">
                {stats?.completed || 0}
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-full">
              <FaCheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Failed */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Thất bại</p>
              <p className="text-3xl font-bold text-red-600">
                {stats?.failed || 0}
              </p>
            </div>
            <div className="bg-red-100 p-4 rounded-full">
              <FaTimesCircle size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Tỷ lệ thành công</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats?.successRate}%
              </p>
            </div>
            <div className="bg-purple-100 p-4 rounded-full">
              <FaCheckCircle size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaTruck className="text-blue-600" />
            Đơn hàng đang giao ({activeOrders.length})
          </h2>
        </div>
        <div className="p-6">
          {activeOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Không có đơn hàng nào đang giao
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <div
                  key={order._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">
                        #{order.orderNumber || order._id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.user?.name || "N/A"}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaMapMarkerAlt className="text-red-500" />
                      <span className="truncate">
                        {order.shippingAddress?.address || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaClock className="text-blue-500" />
                      <span>
                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-bold text-blue-600">
                      {order.finalTotal?.toLocaleString("vi-VN")}₫
                    </p>
                    <button
                      onClick={() =>
                        (window.location.href = `/shipper/orders/${order._id}`)
                      }
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Today's Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaClock className="text-green-600" />
            Đơn hàng hôm nay ({todayOrders.length})
          </h2>
        </div>
        <div className="p-6">
          {todayOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Không có đơn hàng nào hôm nay
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Mã đơn
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Khách hàng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Địa chỉ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tổng tiền
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {todayOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        #{order.orderNumber || order._id.slice(-8)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {order.user?.name || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {order.shippingAddress?.address || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                        {order.finalTotal?.toLocaleString("vi-VN")}₫
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getStatusBadge(order.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShipperDashboardPage;
