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
import { customerReturnService } from "../../../services/ReturnService";
import type { ReturnRequest } from "../../../types/return";
import { FiPackage, FiRefreshCw, FiEye, FiXCircle } from "react-icons/fi";
type OrderQuery = OrderQueryParams;
// Thay đổi từ react-toastify sang react-hot-toast
import toast from "react-hot-toast";

const UserManageOrder: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnLoading, setReturnLoading] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    shipping: 0,
    delivered: 0,
    cancelled: 0,
    total: 0,
  });
  const [returnStats, setReturnStats] = useState({ total: 0 });
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
    if (status === "returns") {
      // Fetch return requests instead
      fetchReturnRequests();
      return;
    }

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

  const fetchReturnRequests = async () => {
    setReturnLoading(true);
    try {
      const res = await customerReturnService.getReturnRequests({
        page: 1,
        limit: 50,
      });
      if (res.data.success) {
        setReturnRequests(res.data.data?.requests || []);
        setReturnStats({ total: res.data.data?.pagination?.total || 0 });
      }
    } catch (error) {
      console.error("Lỗi khi tải yêu cầu trả hàng:", error);
      setReturnRequests([]);
      toast.error("Không thể tải danh sách yêu cầu trả hàng");
    } finally {
      setReturnLoading(false);
    }
  };

  // Fetch return count on mount
  useEffect(() => {
    customerReturnService
      .getReturnRequests({ page: 1, limit: 1 })
      .then((res) => {
        if (res.data.success) {
          setReturnStats({ total: res.data.data?.pagination?.total || 0 });
        }
      })
      .catch(() => {});
  }, []);

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

  // Check if order can request return/exchange (delivered within 7 days)
  const canRequestReturn = (order: Order) => {
    if (order.status !== "delivered" || !order.deliveredAt) return false;
    const deliveredDate = new Date(order.deliveredAt);
    const now = new Date();
    const daysDiff = Math.floor(
      (now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysDiff <= 7;
  };

  const handleRequestReturn = (orderId: string) => {
    navigate(`/returns/create?orderId=${orderId}`);
  };

  const handleViewDetail = (orderId: string) => {
    navigate(`/user-order/${orderId}`);
  };

  const getReturnStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> =
      {
        pending: {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          label: "Chờ duyệt",
        },
        approved: {
          bg: "bg-blue-100",
          text: "text-blue-800",
          label: "Đã duyệt",
        },
        rejected: { bg: "bg-red-100", text: "text-red-800", label: "Từ chối" },
        shipping: {
          bg: "bg-purple-100",
          text: "text-purple-800",
          label: "Đang lấy hàng",
        },
        received: {
          bg: "bg-indigo-100",
          text: "text-indigo-800",
          label: "Đã nhận hàng",
        },
        refunded: {
          bg: "bg-teal-100",
          text: "text-teal-800",
          label: "Đã hoàn tiền",
        },
        completed: {
          bg: "bg-green-100",
          text: "text-green-800",
          label: "Hoàn tất",
        },
        canceled: { bg: "bg-gray-100", text: "text-gray-800", label: "Đã hủy" },
      };
    return styles[status] || styles.pending;
  };

  const handleCancelReturn = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn hủy yêu cầu trả hàng này?")) return;
    try {
      await customerReturnService.cancelReturnRequest(id);
      toast.success("Đã hủy yêu cầu trả hàng");
      fetchReturnRequests();
    } catch (error) {
      toast.error("Không thể hủy yêu cầu");
    }
  };

  const statusTabs = [
    { key: "all", label: "Tất cả", count: stats.total },
    { key: "pending", label: "Chờ xác nhận", count: stats.pending },
    { key: "confirmed", label: "Đã xác nhận", count: stats.confirmed },
    { key: "shipping", label: "Đang giao", count: stats.shipping },
    { key: "delivered", label: "Đã giao", count: stats.delivered },
    { key: "cancelled", label: "Đã hủy", count: stats.cancelled },
    { key: "returns", label: "Trả hàng", count: returnStats.total },
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

          {/* Content based on active tab */}
          {activeTab === "returns" ? (
            // Return requests tab
            returnLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-mono-black"></div>
                <p className="mt-2">Đang tải...</p>
              </div>
            ) : returnRequests.length === 0 ? (
              <div className="text-center py-8">
                <FiPackage className="w-16 h-16 text-mono-300 mx-auto mb-4" />
                <p className="text-mono-500 mb-4">
                  Chưa có yêu cầu trả hàng nào.
                </p>
                <button
                  onClick={() => navigate("/returns/create")}
                  className="px-6 py-2 bg-mono-800 text-white rounded hover:bg-mono-900"
                >
                  Tạo yêu cầu trả hàng
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {returnRequests.map((request) => {
                  const statusBadge = getReturnStatusBadge(request.status);
                  const items = request.order?.items || [];
                  return (
                    <div
                      key={request._id}
                      className="bg-white shadow-md p-6 rounded-lg"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge.bg} ${statusBadge.text}`}
                          >
                            {statusBadge.label}
                          </span>
                          <span className="text-sm text-mono-600 flex items-center gap-1">
                            <FiPackage className="w-4 h-4" /> Trả hàng
                          </span>
                          {request.code && (
                            <span className="text-sm text-mono-500 font-mono">
                              #{request.code}
                            </span>
                          )}
                          <span className="text-sm text-mono-500">
                            Đơn hàng: {request.order?.code || "N/A"}
                          </span>
                        </div>
                        <span className="text-sm text-mono-500">
                          {new Date(request.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>

                      {/* Items */}
                      {items.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-mono-700 mb-2">
                            Sản phẩm ({items.length}):
                          </p>
                          <div className="space-y-2">
                            {items.slice(0, 2).map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 p-2 bg-mono-50 rounded"
                              >
                                <img
                                  src={
                                    item.product?.images?.[0]?.url ||
                                    "/placeholder.jpg"
                                  }
                                  alt={item.product?.name || "Product"}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {item.product?.name || "Sản phẩm"}
                                  </p>
                                  <p className="text-xs text-mono-600">
                                    {item.variant?.color?.name || "N/A"} -{" "}
                                    {item.size?.value || "N/A"} - SL:{" "}
                                    {item.quantity}
                                  </p>
                                </div>
                              </div>
                            ))}
                            {items.length > 2 && (
                              <p className="text-sm text-mono-500">
                                +{items.length - 2} sản phẩm khác
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Reason */}
                      <div className="mb-4">
                        <p className="text-sm text-mono-600">
                          Lý do: {request.reason}
                        </p>
                      </div>

                      {/* Refund amount */}
                      {request.refundAmount && (
                        <div className="mb-4 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-green-700">
                            Số tiền hoàn:{" "}
                            <span className="text-lg font-bold">
                              {request.refundAmount.toLocaleString("vi-VN")}₫
                            </span>
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            Phương thức:{" "}
                            {request.refundMethod === "bank_transfer"
                              ? "Chuyển khoản"
                              : "Tiền mặt (shipper giao)"}
                          </p>
                        </div>
                      )}

                      {/* Shipper Info */}
                      {request.assignedShipper &&
                        request.status === "shipping" && (
                          <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                            <p className="text-sm text-purple-700">
                              Shipper:{" "}
                              <strong>{request.assignedShipper.name}</strong> -{" "}
                              {request.assignedShipper.phone}
                            </p>
                          </div>
                        )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t">
                        <button
                          onClick={() => navigate(`/returns/${request._id}`)}
                          className="px-4 py-2 bg-mono-500 text-white rounded hover:bg-mono-600 flex items-center gap-2"
                        >
                          <FiEye className="w-4 h-4" /> Chi tiết
                        </button>
                        {request.status === "pending" && (
                          <button
                            onClick={() => handleCancelReturn(request._id)}
                            className="px-4 py-2 bg-mono-200 text-mono-700 rounded hover:bg-mono-300 flex items-center gap-2"
                          >
                            <FiXCircle className="w-4 h-4" /> Hủy yêu cầu
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : loading ? (
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

                    {canRequestReturn(order) && (
                      <button
                        onClick={() => handleRequestReturn(order._id)}
                        className="px-4 py-2 bg-mono-700 text-white rounded hover:bg-mono-800 flex items-center gap-2"
                      >
                        <FiRefreshCw className="w-4 h-4" />
                        Đổi/Trả hàng
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
                      {order.shippingAddress?.ward},{" "}
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

                {/* Tổng cộng */}
                <div className="flex justify-end mt-4 pt-4 border-t">
                  <p className="text-lg font-bold text-mono-900">
                    Tổng cộng:{" "}
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
