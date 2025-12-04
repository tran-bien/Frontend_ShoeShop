import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaMapMarkerAlt,
  FaPhone,
  FaClock,
  FaFilter,
} from "react-icons/fa";
import { shipperService } from "../../services/ShipperService";

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (filterStatus === "") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((o) => o.status === filterStatus));
    }
  }, [filterStatus, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await shipperService.getMyOrders();
      // Handle response structure: could be { data: { data: orders } } or { data: orders }
      const ordersData = response.data?.data || response.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setFilteredOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; color: string; icon: JSX.Element }
    > = {
      assigned_to_shipper: {
        label: "Ðã gán",
        color: "bg-mono-100 text-mono-800",
        icon: <FaHourglassHalf />,
      },
      out_for_delivery: {
        label: "Ðang giao",
        color: "bg-mono-100 text-mono-800",
        icon: <FaTruck />,
      },
      delivered: {
        label: "Ðã giao",
        color: "bg-mono-100 text-mono-800",
        icon: <FaCheckCircle />,
      },
      delivery_failed: {
        label: "Thểt b?i",
        color: "bg-mono-200 text-mono-900",
        icon: <FaTimesCircle />,
      },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      color: "bg-mono-100 text-mono-800",
      icon: <FaHourglassHalf />,
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${statusInfo.color}`}
      >
        {statusInfo.icon}
        {statusInfo.label}
      </span>
    );
  };

  const handleViewDetail = (orderId: string) => {
    navigate(`/shipper/orders/${orderId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-mono-500">Ðang tại don hàng...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-mono-800">
          Ðon hàng của tôi ({filteredOrders.length})
        </h1>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-mono-700 font-medium">
            <FaFilter />
            <span>Lọc theo trạng thái:</span>
          </div>
          <button
            onClick={() => setFilterStatus("")}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === ""
                ? "bg-mono-black text-white"
                : "bg-mono-200 text-mono-700 hover:bg-mono-300"
            }`}
          >
            Tất cả ({orders.length})
          </button>
          <button
            onClick={() => setFilterStatus("assigned_to_shipper")}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === "assigned_to_shipper"
                ? "bg-mono-black text-white"
                : "bg-mono-200 text-mono-700 hover:bg-mono-300"
            }`}
          >
            Ðã gán (
            {orders.filter((o) => o.status === "assigned_to_shipper").length})
          </button>
          <button
            onClick={() => setFilterStatus("out_for_delivery")}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === "out_for_delivery"
                ? "bg-mono-700 text-white"
                : "bg-mono-200 text-mono-700 hover:bg-mono-300"
            }`}
          >
            Ðang giao (
            {orders.filter((o) => o.status === "out_for_delivery").length})
          </button>
          <button
            onClick={() => setFilterStatus("delivered")}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === "delivered"
                ? "bg-mono-800 text-white"
                : "bg-mono-200 text-mono-700 hover:bg-mono-300"
            }`}
          >
            Ðã giao ({orders.filter((o) => o.status === "delivered").length})
          </button>
          <button
            onClick={() => setFilterStatus("delivery_failed")}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === "delivery_failed"
                ? "bg-mono-900 text-white"
                : "bg-mono-200 text-mono-700 hover:bg-mono-300"
            }`}
          >
            Thểt b?i (
            {orders.filter((o) => o.status === "delivery_failed").length})
          </button>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FaTruck size={48} className="mx-auto text-mono-400 mb-4" />
          <p className="text-mono-500 text-lg">Không có don hàng nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              {/* Order Header */}
              <div className="bg-gradient-to-r from-mono-500 to-mono-black text-white px-6 py-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">
                      #{order.orderNumber || order._id.slice(-8)}
                    </p>
                    <p className="text-sm text-mono-100">
                      {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Order Body */}
              <div className="p-6 space-y-4">
                {/* Customer Info */}
                <div>
                  <p className="text-sm text-mono-600 mb-1">Khách hàng</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-mono-800">
                      {order.user?.name || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-mono-600 text-sm mt-1">
                    <FaPhone size={12} />
                    <span>
                      {order.user?.phone ||
                        order.shippingAddress?.phone ||
                        "N/A"}
                    </span>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <p className="text-sm text-mono-600 mb-1 flex items-center gap-1">
                    <FaMapMarkerAlt className="text-mono-800" />
                    Ð?a chờ giao hàng
                  </p>
                  <p className="text-mono-800">
                    {order.shippingAddress?.address || "N/A"}
                  </p>
                  {order.shippingAddress?.ward && (
                    <p className="text-sm text-mono-600">
                      {order.shippingAddress.ward},{" "}
                      {order.shippingAddress.district},{" "}
                      {order.shippingAddress.province}
                    </p>
                  )}
                </div>

                {/* Order Items Count */}
                <div className="flex items-center justify-between pt-4 border-t border-mono-200">
                  <div>
                    <p className="text-sm text-mono-600">Số lượng sản phẩm</p>
                    <p className="font-semibold text-mono-800">
                      {order.items?.length || 0} m?t hàng
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-mono-600">Tổng tiền</p>
                    <p className="font-bold text-mono-black text-lg">
                      {order.finalTotalệ.toLocaleString("vi-VN")}?
                    </p>
                  </div>
                </div>

                {/* Delivery Attempts */}
                {order.deliveryAttempts &&
                  order.deliveryAttempts.length > 0 && (
                    <div className="bg-mono-50 rounded-lg p-3">
                      <p className="text-sm text-mono-600 mb-2 flex items-center gap-1">
                        <FaClock />
                        Lẩn giao gẩn nh?t
                      </p>
                      <p className="text-sm text-mono-800">
                        {new Date(
                          order.deliveryAttempts[
                            order.deliveryAttempts.length - 1
                          ].timestamp
                        ).toLocaleString("vi-VN")}
                      </p>
                      {order.deliveryAttempts[order.deliveryAttempts.length - 1]
                        .note && (
                        <p className="text-sm text-mono-600 mt-1">
                          Ghi chú:{" "}
                          {
                            order.deliveryAttempts[
                              order.deliveryAttempts.length - 1
                            ].note
                          }
                        </p>
                      )}
                    </div>
                  )}

                {/* Action Button */}
                <button
                  onClick={() => handleViewDetail(order._id)}
                  className="w-full bg-mono-black hover:bg-mono-800 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Xem chi tiết & Cập nhật
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




