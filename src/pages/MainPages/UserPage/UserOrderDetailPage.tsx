import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/User/Sidebar";
import OrderCard from "../../../components/User/OrderCard";
import CancelOrderModal from "../../../components/Modal/CancelOrderModal";
import RepayOrderModal from "../../../components/Modal/RepayOrderModal";
import RefundBankInfoModal from "../../../components/Modal/RefundBankInfoModal";
import { userOrderService, Order } from "../../../services/OrderService";
// Thay đổi từ react-toastify sang react-hot-toast
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCreditCard,
  FaTag,
  FaExchangeAlt,
  FaUniversity,
} from "react-icons/fa";

const UserOrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [repayLoading, setRepayLoading] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);

  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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
          duration: 5000, // Tuong duong với autoClose: 5000 trong react-toastify
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
        return "text-amber-700 bg-amber-50";
      case "confirmed":
        return "text-blue-700 bg-blue-50";
      case "assigned_to_shipper":
        return "text-indigo-700 bg-indigo-50";
      case "out_for_delivery":
      case "shipping":
        return "text-violet-700 bg-violet-50";
      case "delivered":
        return "text-emerald-700 bg-emerald-50";
      case "delivery_failed":
        return "text-rose-700 bg-rose-50";
      case "returning_to_warehouse":
        return "text-orange-700 bg-orange-50";
      case "cancelled":
        return "text-mono-600 bg-mono-100";
      case "returned":
        return "text-pink-700 bg-pink-50";
      case "refunded":
        return "text-teal-700 bg-teal-50";
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
      case "assigned_to_shipper":
        return "Đã gán shipper";
      case "out_for_delivery":
        return "Đang giao hàng";
      case "shipping":
        return "Đang giao";
      case "delivered":
        return "Giao thành công";
      case "delivery_failed":
        return "Giao hàng thất bại";
      case "returning_to_warehouse":
        return "Đang trả về kho";
      case "cancelled":
        return "Đã hủy";
      case "returned":
        return "Đã hoàn trả";
      case "refunded":
        return "Đã hoàn tiền";
      default:
        return status;
    }
  };

  // Chuyển đổi mã lý do trả hàng và trạng thái sang tiếng Việt
  const formatNoteWithVietnameseReason = (note: string) => {
    if (!note) return note;

    const reasonLabels: Record<string, string> = {
      wrong_size: "Sai kích cỡ",
      wrong_product: "Sai sản phẩm (giao nhầm)",
      defective: "Sản phẩm lỗi/hư hỏng",
      not_as_described: "Không giống mô tả",
      changed_mind: "Đổi ý (không muốn nữa)",
      other: "Lý do khác",
    };

    // Map trạng thái tiếng Anh sang tiếng Việt
    const statusLabels: Record<string, string> = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      assigned_to_shipper: "Đã gán shipper",
      out_for_delivery: "Đang giao hàng",
      shipping: "Đang giao",
      delivered: "Giao thành công",
      delivery_failed: "Giao hàng thất bại",
      returning_to_warehouse: "Đang trả về kho",
      cancelled: "Đã hủy",
      returned: "Đã hoàn trả",
      refunded: "Đã hoàn tiền",
    };

    // Thay thế các mã lý do trong note bằng tiếng Việt
    let formattedNote = note;
    Object.entries(reasonLabels).forEach(([code, label]) => {
      formattedNote = formattedNote.replace(new RegExp(code, "g"), label);
    });

    // Thay thế các trạng thái tiếng Anh trong note bằng tiếng Việt
    Object.entries(statusLabels).forEach(([code, label]) => {
      formattedNote = formattedNote.replace(new RegExp(code, "g"), label);
    });

    return formattedNote;
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

  // Check if order can request return/exchange (delivered within 7 days, no existing return request)
  const canRequestReturn = (order: Order) => {
    if (order.status !== "delivered" || !order.deliveredAt) return false;

    // FIXED: Hide button if already has return request (any status)
    if (order.hasReturnRequest) return false;

    const deliveredDate = new Date(order.deliveredAt);
    const now = new Date();
    const daysDiff = Math.floor(
      (now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysDiff <= 7;
  };

  const handleRequestReturn = () => {
    if (!order) return;
    navigate(`/returns/create?orderId=${order._id}`);
  };

  // Check if user can submit bank info for refund
  // - Order is returning_to_warehouse or cancelled (giao thất bại 3 lần)
  // - Payment was made (VNPAY paid)
  // - No bank info submitted yet
  const canSubmitRefundBankInfo = (order: Order) => {
    const eligibleStatuses = ["returning_to_warehouse", "cancelled"];
    const isPaid = order.payment?.paymentStatus === "paid";
    const noBankInfo = !order.refund?.bankInfo?.accountNumber;
    const notRefunded = order.refund?.status !== "completed";

    return (
      eligibleStatuses.includes(order.status) &&
      isPaid &&
      noBankInfo &&
      notRefunded
    );
  };

  // Check if refund is pending (bank info submitted, waiting for admin)
  const isRefundPending = (order: Order) => {
    return (
      order.refund?.status === "pending" &&
      order.refund?.bankInfo?.accountNumber
    );
  };

  // Check if refund is completed
  const isRefundCompleted = (order: Order) => {
    return order.refund?.status === "completed";
  };

  const handleOpenRefundModal = () => {
    if (!order) return;
    setShowRefundModal(true);
  };

  const handleCloseRefundModal = () => {
    if (refundLoading) return;
    setShowRefundModal(false);
  };

  const handleConfirmRefundBankInfo = async (bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  }) => {
    if (!order) return;

    setRefundLoading(true);
    try {
      const response = await userOrderService.submitRefundBankInfo(
        order._id,
        bankInfo
      );
      if (response.data.success) {
        toast.success(
          "Đã gửi thông tin ngân hàng thành công. Chúng tôi sẽ xử lý hoàn tiền sớm nhất!"
        );
        fetchOrderDetail();
        setShowRefundModal(false);
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        err?.response?.data?.message || "Không thể gửi thông tin ngân hàng";
      toast.error(errorMessage);
    } finally {
      setRefundLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-mono-100">
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 p-10">
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-mono-black"></div>
              <p className="mt-2">Đang tải...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen bg-mono-100">
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 p-10">
            <div className="text-center py-8">
              <p className="text-mono-500">Không tìm thấy đơn hàng.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-mono-100">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-10">
          {/* Header với nút quay lỗi */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/user-manage-order")}
              className="flex items-center gap-2 px-4 py-2 text-mono-black hover:bg-mono-50 rounded-lg transition-colors"
            >
              <FaArrowLeft />
              <span>Quay lại</span>
            </button>
            <h1 className="text-3xl font-bold">Chi tiết đơn hàng</h1>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Header đơn hàng */}
            <div className="border-b border-mono-300 p-6 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2 font-mono">
                    {order.code}
                  </h2>
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                  {order.hasCancelRequest && (
                    <div className="mt-2">
                      <span className="inline-block px-3 py-1 bg-mono-200 text-mono-800 rounded-full text-sm font-medium">
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
                      className="px-4 py-2 bg-mono-800 text-white rounded hover:bg-mono-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancelLoading ? "Đang xử lý..." : "Hủy đơn"}
                    </button>
                  )}

                  {canRepayOrder(order) && (
                    <button
                      onClick={handleRepayOrder}
                      disabled={repayLoading}
                      className="px-4 py-2 bg-mono-700 text-white rounded hover:bg-mono-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {repayLoading ? "Đang xử lý..." : "Thanh toán lại"}
                    </button>
                  )}

                  {canRequestReturn(order) && (
                    <button
                      onClick={handleRequestReturn}
                      className="px-4 py-2 bg-mono-600 text-white rounded hover:bg-mono-700 flex items-center gap-2"
                    >
                      <FaExchangeAlt />
                      Trả hàng/Hoàn tiền
                    </button>
                  )}

                  {/* Nút điền thông tin hoàn tiền */}
                  {canSubmitRefundBankInfo(order) && (
                    <button
                      onClick={handleOpenRefundModal}
                      disabled={refundLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <FaUniversity />
                      {refundLoading
                        ? "Đang xử lý..."
                        : "Điền thông tin hoàn tiền"}
                    </button>
                  )}
                </div>
              </div>

              {/* Thông báo trạng thái hoàn tiền */}
              {isRefundPending(order) && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaUniversity className="text-yellow-600" />
                    <span className="font-semibold text-yellow-800">
                      Đang chờ hoàn tiền
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Chúng tôi đã nhận được thông tin ngân hàng của bạn. Tiền sẽ
                    được hoàn trong 3-5 ngày làm việc.
                  </p>
                  <div className="mt-2 text-sm text-yellow-600">
                    <p>• Ngân hàng: {order.refund?.bankInfo?.bankName}</p>
                    <p>• Số TK: {order.refund?.bankInfo?.accountNumber}</p>
                    <p>• Chủ TK: {order.refund?.bankInfo?.accountName}</p>
                  </div>
                </div>
              )}

              {isRefundCompleted(order) && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaUniversity className="text-green-600" />
                    <span className="font-semibold text-green-800">
                      Đã hoàn tiền thành công
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Số tiền {order.refund?.amount?.toLocaleString()}đ đã được
                    hoàn trả.
                  </p>
                  {order.refund?.completedAt && (
                    <p className="text-sm text-green-600 mt-1">
                      Ngày hoàn tiền:{" "}
                      {new Date(order.refund.completedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="p-6">
              {/* Thông tin chung */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Thông tin giao hàng */}
                <div className="bg-mono-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <FaMapMarkerAlt className="text-mono-500" />
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
                    <p className="text-mono-600 pl-2">
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
                <div className="bg-mono-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <FaCreditCard className="text-mono-700" />
                    <h3 className="font-semibold">Thông tin thanh toán</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Phuong thực:</strong> {order.payment?.method}
                    </p>
                    <p>
                      <strong>Trạng thái:</strong>
                      <span
                        className={`ml-1 px-2 py-1 rounded text-xs ${
                          order.payment?.paymentStatus === "paid"
                            ? "bg-mono-100 text-mono-800"
                            : order.payment?.paymentStatus === "failed"
                            ? "bg-mono-200 text-mono-900"
                            : "bg-mono-100 text-mono-800"
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
                <div className="bg-mono-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <FaCalendarAlt className="text-mono-600" />
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
                        <strong>Ngày nhơn:</strong>{" "}
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
                <div className="bg-gradient-to-r from-mono-100 to-mono-100 border border-mono-300 p-4 rounded-lg mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <FaTag className="text-mono-600" />
                    <h3 className="font-semibold text-mono-800">
                      Mã giảm giá dã áp dụng
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="bg-mono-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {order.couponDetail.code}
                      </span>
                      <span className="ml-3 text-mono-600">
                        {order.couponDetail.type === "percent"
                          ? `Giảm ${order.couponDetail.value}%`
                          : `Giảm ${order.couponDetail.value.toLocaleString()}d`}
                        {order.couponDetail.maxDiscount &&
                          order.couponDetail.type === "percent" &&
                          ` (tại đã ${order.couponDetail.maxDiscount.toLocaleString()}d)`}
                      </span>
                    </div>
                    <span className="text-mono-800 font-semibold">
                      -{order.discount?.toLocaleString()}d
                    </span>
                  </div>
                </div>
              )}

              {/* Ghi chú */}
              {order.note && (
                <div className="bg-mono-50 border border-mono-200 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-mono-800 mb-2">
                    Ghi chú đơn hàng:
                  </h3>
                  <p className="text-mono-700">{order.note}</p>
                </div>
              )}

              {/* Lý do hủy */}
              {order.cancelReason && (
                <div className="bg-mono-100 border border-mono-300 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-mono-900 mb-2">
                    Lý do hủy đơn:
                  </h3>
                  <p className="text-mono-700">{order.cancelReason}</p>
                </div>
              )}

              {/* Danh sách sản phẩm */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Sản phẩm đã đặt</h3>
                <div className="space-y-4">
                  {order.orderItems.map((item, idx) => (
                    <div
                      key={item._id || idx}
                      className="border border-mono-200 rounded-lg p-4"
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
                <div className="bg-mono-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Tạm tính:</span>
                      <span>{order.subTotal.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phí vẩn chuyện:</span>
                      <span>{order.shippingFee?.toLocaleString()}đ</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-mono-800">
                        <span>Giảm giá:</span>
                        <span>-{order.discount?.toLocaleString()}đ</span>
                      </div>
                    )}
                    <hr />
                    <div className="flex justify-between text-lg font-bold text-mono-900">
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
                        className="flex items-start gap-4 p-3 bg-mono-50 rounded-lg"
                      >
                        <div className="w-3 h-3 bg-mono-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-medium">
                                {getStatusText(history.status)}
                              </span>
                              {history.note && (
                                <p className="text-sm text-mono-600 mt-1">
                                  {formatNoteWithVietnameseReason(history.note)}
                                </p>
                              )}
                            </div>
                            <span className="text-sm text-mono-500">
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

      <RefundBankInfoModal
        isOpen={showRefundModal}
        onClose={handleCloseRefundModal}
        onConfirm={handleConfirmRefundBankInfo}
        orderCode={order?.code || ""}
        refundAmount={order?.totalAfterDiscountAndShipping || 0}
        loading={refundLoading}
      />
    </div>
  );
};

export default UserOrderDetailPage;
