import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/User/Sidebar";
import OrderCard from "../../../components/User/OrderCard";
import CancelOrderModal from "../../../components/Modal/CancelOrderModal";
import RepayOrderModal from "../../../components/Modal/RepayOrderModal";
import {
  userOrderService,
  Order,
  OrderQueryParams,
} from "../../../services/OrderService";
type OrderQuery = OrderQueryParams;
// Thay đổi từ react-toastify sang react-hot-toast
import toast from "react-hot-toast";

const UserManageOrder: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    shipping: 0,
    delivered: 0,
    cancelled: 0,
    total: 0,
  });
  const [activeTab, setActiveTab] = useState<string>("all");
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [repayLoading, setRepayLoading] = useState<string | null>(null);

  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] =
    useState<Order | null>(null);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [selectedOrderForRepay, setSelectedOrderForRepay] =
    useState<Order | null>(null);

  const fetchOrders = async (status?: string) => {
    setLoading(true);
    try {
      const query: OrderQuery = {
        page: 1,
        limit: 50,
      };

      if (status && status !== "all") {
        query.status = status as any;
      }

      const res = await userOrderService.getOrders(query);
      setOrders(res.data.orders || []);
      setStats(res.data.stats || stats);
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error);
      setOrders([]);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  const handleCancelOrder = async (orderId: string) => {
    const order = orders.find((o) => o._id === orderId);
    if (!order) return;

    setSelectedOrderForCancel(order);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!selectedOrderForCancel) return;

    setCancelLoading(selectedOrderForCancel._id);
    try {
      const response = await userOrderService.cancelOrder(
        selectedOrderForCancel._id,
        {
          reason: reason,
        }
      );

      // Hiển thị thông báo thành công từ response
      if (response.data && response.data.success) {
        toast.success(
          response.data.message ||
            "Yêu cầu hủy đơn hàng đã được gửi thành công",
          {
            duration: 5000, // Tuong duong với autoClose: 5000 trong react-toastify
          }
        );
      }

      // Refresh danh sách đơn hàng
      fetchOrders(activeTab);
      setShowCancelModal(false);
      setSelectedOrderForCancel(null);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể hủy đơn hàng";
      toast.error(errorMessage);
    } finally {
      setCancelLoading(null);
    }
  };

  const handleCloseCancelModal = () => {
    if (cancelLoading) return;
    setShowCancelModal(false);
    setSelectedOrderForCancel(null);
  };

  const handleRepayOrder = async (orderId: string) => {
    const order = orders.find((o) => o._id === orderId);
    if (!order) return;

    setSelectedOrderForRepay(order);
    setShowRepayModal(true);
  };

  const handleConfirmRepay = async () => {
    if (!selectedOrderForRepay) return;

    setRepayLoading(selectedOrderForRepay._id);
    try {
      const response = await userOrderService.repayOrder(
        selectedOrderForRepay._id
      );
      if (response.data.data.paymentUrl) {
        window.location.href = response.data.data.paymentUrl;
      } else {
        toast.success("Đã gửi yêu cầu thanh toán lại");
        fetchOrders(activeTab);
      }
      setShowRepayModal(false);
      setSelectedOrderForRepay(null);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể thanh toán lại đơn hàng";
      toast.error(errorMessage);
    } finally {
      setRepayLoading(null);
    }
  };

  const handleCloseRepayModal = () => {
    if (repayLoading) return;
    setShowRepayModal(false);
    setSelectedOrderForRepay(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-mono-700 bg-mono-100";
      case "confirmed":
        return "text-mono-black bg-mono-100";
      case "shipping":
        return "text-mono-700 bg-mono-200";
      case "delivered":
        return "text-mono-800 bg-mono-100";
      case "cancelled":
        return "text-mono-900 bg-mono-200";
      default:
        return "text-mono-600 bg-mono-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "shipping":
        return "Đang giao";
      case "delivered":
        return "Đã giao";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const canCancelOrder = (order: Order) => {
    return (
      ["pending", "confirmed"].includes(order.status) && !order.hasCancelRequest
    );
  };

  const canRepayOrder = (order: Order) => {
    return (
      order.payment.method === "VNPAY" &&
      order.payment.paymentStatus === "pending" &&
      order.status === "pending"
    );
  };

  const handleViewDetail = (orderId: string) => {
    navigate(`/user-order/${orderId}`);
  };

  const statusTabs = [
    { key: "all", label: "Tất cả", count: stats.total },
    { key: "pending", label: "Chờ xác nhận", count: stats.pending },
    { key: "confirmed", label: "Đã xác nhận", count: stats.confirmed },
    { key: "shipping", label: "Đang giao", count: stats.shipping },
    { key: "delivered", label: "Đã giao", count: stats.delivered },
    { key: "cancelled", label: "Đã hủy", count: stats.cancelled },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-mono-100">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-10">
          <h1 className="text-3xl font-bold mb-6">Quản lý đơn hàng</h1>

          {/* Tab filter */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="flex border-b">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.key
                      ? "text-mono-black border-b-2 border-mono-black"
                      : "text-mono-600 hover:text-mono-black"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-mono-black"></div>
              <p className="mt-2">Đang tải...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-mono-500">Không có đơn hàng nào.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order._id}
                className="bg-white shadow-md p-6 rounded-lg mb-6"
              >
                {/* Header đơn hàng */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Mã đơn hàng: {order.code}
                    </h2>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  {/* Nút hành động */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetail(order._id)}
                      className="px-4 py-2 bg-mono-500 text-white rounded hover:bg-mono-600"
                    >
                      Xem chi tiết
                    </button>

                    {canCancelOrder(order) && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={cancelLoading === order._id}
                        className="px-4 py-2 bg-mono-800 text-white rounded hover:bg-mono-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancelLoading === order._id
                          ? "Đang xử lý..."
                          : "Hủy đơn"}
                      </button>
                    )}

                    {canRepayOrder(order) && (
                      <button
                        onClick={() => handleRepayOrder(order._id)}
                        disabled={repayLoading === order._id}
                        className="px-4 py-2 bg-mono-500 text-white rounded hover:bg-mono-black disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {repayLoading === order._id
                          ? "Đang xử lý..."
                          : "Thanh toán lại"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Thông tin đơn hàng */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-mono-700">
                      <strong>Người đặt:</strong> {order.shippingAddress?.name}
                    </p>
                    <p className="text-mono-700">
                      <strong>SĐT:</strong> {order.shippingAddress?.phone}
                    </p>
                    <p className="text-mono-700">
                      <strong>Địa chỉ:</strong> {order.shippingAddress?.detail},{" "}
                      {order.shippingAddress?.ward},{" "}}
                      {order.shippingAddress?.district},{" "}
                      {order.shippingAddress?.province}
                    </p>
                  </div>
                  <div>
                    <p className="text-mono-700">
                      <strong>Thanh toán:</strong> {order.payment?.method}
                    </p>
                    <p className="text-mono-700">
                      <strong>Khuyến mãi:</strong>{" "}
                      {order.couponDetail?.code
                        ? `${
                            order.couponDetail.code
                          } (-${order.discount?.toLocaleString()}đ)`
                        : "Không"}
                    </p>
                    <p className="text-mono-700">
                      <strong>Thời gian:</strong>{" "}
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    {order.hasCancelRequest && (
                      <p className="text-mono-700 font-medium">
                        ⚠️ Có yêu cầu hủy đang chờ xử lý
                      </p>
                    )}
                  </div>
                </div>

                {/* Danh sách sản phẩm */}
                <div className="border-t pt-4">
                  {order.orderItems.map((item, idx) => (
                    <div key={item._id || idx}>
                      <OrderCard
                        name={item.productName}
                        quantity={item.quantity}
                        price={item.price}
                        image={item.image}
                        size={item.size?.value}
                        color={item.variant?.color?.name}
                      />
                      {idx < order.orderItems.length - 1 && (
                        <hr className="my-4 border-mono-300" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Tổng cẩng */}
                <div className="flex justify-end mt-4 pt-4 border-t">
                  <p className="text-lg font-bold text-mono-900">
                    Tổng cẩng:{" "}
                    {order.totalAfterDiscountAndShipping?.toLocaleString()}d
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
        orderCode={selectedOrderForCancel?.code || ""}
        loading={!!cancelLoading}
      />

      {/* Repay Order Modal */}
      <RepayOrderModal
        isOpen={showRepayModal}
        onClose={handleCloseRepayModal}
        onConfirm={handleConfirmRepay}
        orderCode={selectedOrderForRepay?.code || ""}
        orderAmount={selectedOrderForRepay?.totalAfterDiscountAndShipping || 0}
        loading={!!repayLoading}
      />
    </div>
  );
};

export default UserManageOrder;
