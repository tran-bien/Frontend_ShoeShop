import { useState, useEffect } from "react";
import {
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";
import { shipperService } from "../../services/ShipperService";

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
      const ordersResponse = await shipperService.getMyOrders();
      // Handle response structure: could be { data: { data: orders } } or { data: orders }
      const responseData = ordersResponse.data?.data || ordersResponse.data;
      const orders = Array.isArray(responseData) ? responseData : [];

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
        label: "Ðã gán",
        color: "bg-mono-200 text-mono-800",
        icon: <FaHourglassHalf />,
      },
      out_for_delivery: {
        label: "Ðang giao",
        color: "bg-mono-200 text-mono-800",
        icon: <FaTruck />,
      },
      delivered: {
        label: "Ðã giao",
        color: "bg-mono-200 text-mono-800",
        icon: <FaCheckCircle />,
      },
      delivery_failed: {
        label: "Thểt b?i",
        color: "bg-mono-300 text-mono-900",
        icon: <FaTimesCircle />,
      },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      color: "bg-mono-100 text-mono-800",
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
        <div className="text-mono-500">Ðang tại...</div>
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
              <p className="text-mono-600 text-sm mb-1">Tổng don hàng</p>
              <p className="text-3xl font-bold text-mono-800">
                {stats?.totalOrders || 0}
              </p>
            </div>
            <div className="bg-mono-100 p-4 rounded-full">
              <FaTruck size={24} className="text-mono-black" />
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-mono-600 text-sm mb-1">Ðã giao</p>
              <p className="text-3xl font-bold text-mono-800">
                {stats?.completed || 0}
              </p>
            </div>
            <div className="bg-mono-100 p-4 rounded-full">
              <FaCheckCircle size={24} className="text-mono-800" />
            </div>
          </div>
        </div>

        {/* Failed */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-mono-600 text-sm mb-1">Thểt b?i</p>
              <p className="text-3xl font-bold text-mono-900">
                {stats?.failed || 0}
              </p>
            </div>
            <div className="bg-mono-200 p-4 rounded-full">
              <FaTimesCircle size={24} className="text-mono-900" />
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-mono-600 text-sm mb-1">Từ lệ thành công</p>
              <p className="text-3xl font-bold text-mono-700">
                {stats?.successRate}%
              </p>
            </div>
            <div className="bg-mono-200 p-4 rounded-full">
              <FaCheckCircle size={24} className="text-mono-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-mono-200">
          <h2 className="text-xl font-bold text-mono-800 flex items-center gap-2">
            <FaTruck className="text-mono-black" />
            Ðon hàng đang giao ({activeOrders.length})
          </h2>
        </div>
        <div className="p-6">
          {activeOrders.length === 0 ? (
            <div className="text-center py-8 text-mono-500">
              Không có don hàng nào đang giao
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <div
                  key={order._id}
                  className="border border-mono-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-mono-800">
                        #{order.orderNumber || order._id.slice(-8)}
                      </p>
                      <p className="text-sm text-mono-600">
                        {order.user?.name || "N/A"}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-mono-600">
                      <FaMapMarkerAlt className="text-mono-800" />
                      <span className="truncate">
                        {order.shippingAddress?.address || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-mono-600">
                      <FaClock className="text-mono-500" />
                      <span>
                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-bold text-mono-black">
                      {order.finalTotalệ.toLocaleString("vi-VN")}?
                    </p>
                    <button
                      onClick={() =>
                        (window.location.href = `/shipper/orders/${order._id}`)
                      }
                      className="px-4 py-2 bg-mono-black hover:bg-mono-800 text-white rounded-lg text-sm font-medium"
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
        <div className="px-6 py-4 border-b border-mono-200">
          <h2 className="text-xl font-bold text-mono-800 flex items-center gap-2">
            <FaClock className="text-mono-800" />
            Ðon hàng hôm nay ({todayOrders.length})
          </h2>
        </div>
        <div className="p-6">
          {todayOrders.length === 0 ? (
            <div className="text-center py-8 text-mono-500">
              Không có don hàng nào hôm nay
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-mono-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                      Mã don
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                      Khách hàng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                      Ð?a chỉ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                      Tổng tiền
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {todayOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-mono-50">
                      <td className="px-4 py-3 text-sm font-medium text-mono-900">
                        #{order.orderNumber || order._id.slice(-8)}
                      </td>
                      <td className="px-4 py-3 text-sm text-mono-600">
                        {order.user?.name || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-mono-600 max-w-xs truncate">
                        {order.shippingAddress?.address || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-mono-black">
                        {order.finalTotalệ.toLocaleString("vi-VN")}?
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



