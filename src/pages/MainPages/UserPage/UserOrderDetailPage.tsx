import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/User/Sidebar";
import OrderCard from "../../../components/User/OrderCard";
import CancelOrderModal from "../../../components/Modal/CancelOrderModal";
import RepayOrderModal from "../../../components/Modal/RepayOrderModal";
import { userOrderService, Order } from "../../../services/OrderServiceV2";
// Thay đổi từ react-toastify sang react-hot-toast
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCreditCard,
  FaTag,
} from "react-icons/fa";

const UserOrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [repayLoading, setRepayLoading] = useState(false);

  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRepayModal, setShowRepayModal] = useState(false);

  const fetchOrderDetail = async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      const res = await userOrderService.getOrderById(orderId);
      setOrder(res.data.data);
    } catch (error: any) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", error);
      toast.error("Không thể tải chi tiết đơn hàng");
      navigate("/user-manage-order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!order) return;
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!order) return;

    setCancelLoading(true);
    try {
      const response = await userOrderService.cancelOrder(order._id, {
        reason: reason,
      });

      // Hiển thị thông báo chi tiết hơn từ response
      if (response.data && response.data.success) {
        const orderNumber = order.code || orderId;
        const statusMessage =
          response.data.message ||
          "Yêu cầu hủy đơn hàng đã được gửi thành công";

        // Hiển thị toast với số đơn hàng để người dùng dễ nhận biết
        toast.success(`Đơn hàng #${orderNumber}: ${statusMessage}`, {
          duration: 5000, // Tương đương với autoClose: 5000 trong react-toastify
        });
      }

      fetchOrderDetail(); // Refresh order data
      setShowCancelModal(false);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể hủy đơn hàng";
      toast.error(errorMessage);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCloseCancelModal = () => {
    if (cancelLoading) return;
    setShowCancelModal(false);
  };

  const handleRepayOrder = async () => {
    if (!order) return;
    setShowRepayModal(true);
  };

  const handleConfirmRepay = async () => {
    if (!order) return;

    setRepayLoading(true);
    try {
      const response = await userOrderService.repayOrder(order._id);
      if (response.data.data.paymentUrl) {
        window.location.href = response.data.data.paymentUrl;
      } else {
        toast.success("Đã gửi yêu cầu thanh toán lại");
        fetchOrderDetail();
      }
      setShowRepayModal(false);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể thanh toán lại đơn hàng";
      toast.error(errorMessage);
    } finally {
      setRepayLoading(false);
    }
  };

  const handleCloseRepayModal = () => {
    if (repayLoading) return;
    setShowRepayModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "confirmed":
        return "text-blue-600 bg-blue-100";
      case "shipping":
        return "text-purple-600 bg-purple-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
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

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 p-10">
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2">Đang tải...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 p-10">
            <div className="text-center py-8">
              <p className="text-gray-500">Không tìm thấy đơn hàng.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-10">
          {/* Header với nút quay lại */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/user-manage-order")}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <FaArrowLeft />
              <span>Quay lại</span>
            </button>
            <h1 className="text-3xl font-bold">Chi tiết đơn hàng</h1>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Header đơn hàng */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Đơn hàng {order.code}
                  </h2>
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                      order.status
                    )}`}
                    style={{
                      color: "#374151",
                      backgroundColor: "rgba(255,255,255,0.9)",
                    }}
                  >
                    {getStatusText(order.status)}
                  </span>
                  {order.hasCancelRequest && (
                    <div className="mt-2">
                      <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                        ⚠️ Có yêu cầu hủy đang chờ xử lý
                      </span>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  {canCancelOrder(order) && (
                    <button
                      onClick={handleCancelOrder}
                      disabled={cancelLoading}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancelLoading ? "Đang xử lý..." : "Hủy đơn"}
                    </button>
                  )}

                  {canRepayOrder(order) && (
                    <button
                      onClick={handleRepayOrder}
                      disabled={repayLoading}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {repayLoading ? "Đang xử lý..." : "Thanh toán lại"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Thông tin chung */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Thông tin giao hàng */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <FaMapMarkerAlt className="text-blue-500" />
                    <h3 className="font-semibold">Thông tin giao hàng</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Người nhận:</strong> {order.shippingAddress?.name}
                    </p>
                    <p>
                      <strong>SĐT:</strong> {order.shippingAddress?.phone}
                    </p>
                    <p>
                      <strong>Địa chỉ:</strong>
                    </p>
                    <p className="text-gray-600 pl-2">
                      {order.shippingAddress?.detail}
                      <br />
                      {order.shippingAddress?.ward},{" "}
                      {order.shippingAddress?.district}
                      <br />
                      {order.shippingAddress?.province}
                    </p>
                  </div>
                </div>

                {/* Thông tin thanh toán */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <FaCreditCard className="text-green-500" />
                    <h3 className="font-semibold">Thông tin thanh toán</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Phương thức:</strong> {order.payment?.method}
                    </p>
                    <p>
                      <strong>Trạng thái:</strong>
                      <span
                        className={`ml-1 px-2 py-1 rounded text-xs ${
                          order.payment?.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : order.payment?.paymentStatus === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.payment?.paymentStatus === "paid"
                          ? "Đã thanh toán"
                          : order.payment?.paymentStatus === "failed"
                          ? "Thất bại"
                          : "Chờ thanh toán"}
                      </span>
                    </p>
                    {order.payment?.transactionId && (
                      <p>
                        <strong>Mã GD:</strong> {order.payment.transactionId}
                      </p>
                    )}
                    {order.payment?.paidAt && (
                      <p>
                        <strong>Ngày TT:</strong>{" "}
                        {new Date(order.payment.paidAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Thông tin đơn hàng */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <FaCalendarAlt className="text-purple-500" />
                    <h3 className="font-semibold">Thông tin đơn hàng</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Ngày đặt:</strong>{" "}
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    {order.confirmedAt && (
                      <p>
                        <strong>Ngày xác nhận:</strong>{" "}
                        {new Date(order.confirmedAt).toLocaleString()}
                      </p>
                    )}
                    {order.shippingAt && (
                      <p>
                        <strong>Ngày giao:</strong>{" "}
                        {new Date(order.shippingAt).toLocaleString()}
                      </p>
                    )}
                    {order.deliveredAt && (
                      <p>
                        <strong>Ngày nhận:</strong>{" "}
                        {new Date(order.deliveredAt).toLocaleString()}
                      </p>
                    )}
                    {order.cancelledAt && (
                      <p>
                        <strong>Ngày hủy:</strong>{" "}
                        {new Date(order.cancelledAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Mã giảm giá */}
              {order.couponDetail && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 p-4 rounded-lg mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <FaTag className="text-orange-500" />
                    <h3 className="font-semibold text-orange-800">
                      Mã giảm giá đã áp dụng
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {order.couponDetail.code}
                      </span>
                      <span className="ml-3 text-gray-600">
                        {order.couponDetail.type === "percent"
                          ? `Giảm ${order.couponDetail.value}%`
                          : `Giảm ${order.couponDetail.value.toLocaleString()}đ`}
                        {order.couponDetail.maxDiscount &&
                          order.couponDetail.type === "percent" &&
                          ` (tối đa ${order.couponDetail.maxDiscount.toLocaleString()}đ)`}
                      </span>
                    </div>
                    <span className="text-green-600 font-semibold">
                      -{order.discount?.toLocaleString()}đ
                    </span>
                  </div>
                </div>
              )}

              {/* Ghi chú */}
              {order.note && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Ghi chú đơn hàng:
                  </h3>
                  <p className="text-gray-700">{order.note}</p>
                </div>
              )}

              {/* Lý do hủy */}
              {order.cancelReason && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-red-800 mb-2">
                    Lý do hủy đơn:
                  </h3>
                  <p className="text-gray-700">{order.cancelReason}</p>
                </div>
              )}

              {/* Danh sách sản phẩm */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Sản phẩm đã đặt</h3>
                <div className="space-y-4">
                  {order.orderItems.map((item, idx) => (
                    <div
                      key={item._id || idx}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <OrderCard
                        name={item.productName}
                        quantity={item.quantity}
                        price={item.price}
                        image={item.image}
                        size={item.size?.value}
                        color={item.variant?.color?.name}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tổng cộng */}
              <div className="border-t pt-6 mt-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Tạm tính:</span>
                      <span>{order.subTotal?.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phí vận chuyển:</span>
                      <span>{order.shippingFee?.toLocaleString()}đ</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá:</span>
                        <span>-{order.discount?.toLocaleString()}đ</span>
                      </div>
                    )}
                    <hr />
                    <div className="flex justify-between text-lg font-bold text-red-600">
                      <span>Tổng cộng:</span>
                      <span>
                        {order.totalAfterDiscountAndShipping?.toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lịch sử trạng thái */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Lịch sử đơn hàng
                  </h3>
                  <div className="space-y-3">
                    {order.statusHistory.map((history, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-medium">
                                {getStatusText(history.status)}
                              </span>
                              {history.note && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {history.note}
                                </p>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(history.updatedAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
        orderCode={order?.code || ""}
        loading={cancelLoading}
      />

      <RepayOrderModal
        isOpen={showRepayModal}
        onClose={handleCloseRepayModal}
        onConfirm={handleConfirmRepay}
        orderCode={order?.code || ""}
        orderAmount={order?.totalAfterDiscountAndShipping || 0}
        loading={repayLoading}
      />
    </div>
  );
};

export default UserOrderDetailPage;
