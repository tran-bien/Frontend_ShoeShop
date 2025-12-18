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
import { FiPackage, FiRefreshCw } from "react-icons/fi";
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
    failed: 0, // delivery_failed + returning_to_warehouse + cancelled
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
      // Merge stats with defaults to ensure 'failed' and 'shipping' are available
      setStats((prev) => ({
        ...prev,
        ...(res.data.stats || {}),
      }));
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
          bg: "bg-mono-200",
          text: "text-mono-700",
          label: "Chờ duyệt",
        },
        approved: {
          bg: "bg-mono-100",
          text: "text-mono-black",
          label: "Đã duyệt",
        },
        rejected: { bg: "bg-mono-900", text: "text-white", label: "Từ chối" },
        shipping: {
          bg: "bg-mono-300",
          text: "text-mono-800",
          label: "Đang lấy hàng",
        },
        received: {
          bg: "bg-mono-400",
          text: "text-white",
          label: "Đã nhận hàng",
        },
        refunded: {
          bg: "bg-mono-600",
          text: "text-white",
          label: "Đã hoàn tiền",
        },
        completed: {
          bg: "bg-mono-black",
          text: "text-white",
          label: "Hoàn tất",
        },
        canceled: { bg: "bg-mono-100", text: "text-mono-500", label: "Đã hủy" },
      };
    return styles[status] || styles.pending;
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      wrong_size: "Sai kích cỡ",
      wrong_product: "Sai sản phẩm (giao nhầm)",
      defective: "Sản phẩm lỗi/hư hỏng",
      not_as_described: "Không giống mô tả",
      changed_mind: "Đổi ý (không muốn nữa)",
      other: "Lý do khác",
    };
    return labels[reason] || reason;
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
    { key: "failed", label: "Giao thất bại", count: stats.failed },
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
              <div className="space-y-6">
                {returnRequests.map((request) => {
                  const statusBadge = getReturnStatusBadge(request.status);
                  const items = request.order?.orderItems || [];
                  return (
                    <div
                      key={request._id}
                      className="bg-white shadow-md p-6 rounded-lg"
                    >
                      {/* Header giống đơn hàng */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h2 className="text-lg font-semibold">
                            Mã yêu cầu:{" "}
                            {request.code || `#${request._id.slice(-8)}`}
                          </h2>
                          <p className="text-sm text-mono-500 mt-1">
                            Đơn hàng gốc: {request.order?.code || "N/A"}
                          </p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${statusBadge.bg} ${statusBadge.text}`}
                          >
                            {statusBadge.label}
                          </span>
                        </div>

                        {/* Nút hành động */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/returns/${request._id}`)}
                            className="px-4 py-2 bg-mono-500 text-white rounded hover:bg-mono-600"
                          >
                            Xem chi tiết
                          </button>
                          {request.status === "pending" && (
                            <button
                              onClick={() => handleCancelReturn(request._id)}
                              className="px-4 py-2 bg-mono-800 text-white rounded hover:bg-mono-900"
                            >
                              Hủy yêu cầu
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Thông tin yêu cầu - Grid 2 cột giống đơn hàng */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-mono-700">
                            <strong>Lý do:</strong>{" "}
                            {getReasonLabel(request.reason)}
                          </p>
                          {request.reasonDetail && (
                            <p className="text-mono-600 text-sm italic">
                              "{request.reasonDetail}"
                            </p>
                          )}
                          <p className="text-mono-700 mt-2">
                            <strong>Phương thức hoàn tiền:</strong>{" "}
                            {request.refundMethod === "bank_transfer"
                              ? "Chuyển khoản"
                              : "Tiền mặt (shipper giao)"}
                          </p>
                        </div>
                        <div>
                          <p className="text-mono-700">
                            <strong>Ngày tạo:</strong>{" "}
                            {new Date(request.createdAt).toLocaleString()}
                          </p>
                          {request.approvedAt && (
                            <p className="text-mono-700">
                              <strong>Ngày duyệt:</strong>{" "}
                              {new Date(request.approvedAt).toLocaleString()}
                            </p>
                          )}
                          {request.assignedShipper &&
                            request.status === "shipping" && (
                              <p className="text-mono-700 mt-2">
                                <strong>Shipper:</strong>{" "}
                                {request.assignedShipper.name} -{" "}
                                {request.assignedShipper.phone}
                              </p>
                            )}
                        </div>
                      </div>

                      {/* Danh sách sản phẩm - Dùng OrderCard giống đơn hàng */}
                      <div className="border-t pt-4">
                        {items.map((item, idx) => (
                          <div key={idx}>
                            <OrderCard
                              name={
                                item.productName ||
                                item.variant?.product?.name ||
                                "Sản phẩm"
                              }
                              quantity={item.quantity}
                              price={item.price}
                              image={
                                item.image ||
                                item.variant?.product?.images?.[0]?.url
                              }
                              size={item.size?.value}
                              color={item.variant?.color?.name}
                            />
                            {idx < items.length - 1 && (
                              <hr className="my-4 border-mono-300" />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Tổng tiền hoàn */}
                      <div className="flex justify-end mt-4 pt-4 border-t">
                        <p className="text-lg font-bold text-mono-900">
                          Số tiền hoàn:{" "}
                          {request.refundAmount?.toLocaleString() || 0}đ
                        </p>
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
                        Trả hàng/Hoàn tiền
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
                    {/* Hiển thị thông báo hoàn tiền cho đơn hủy/giao thất bại thanh toán VNPAY */}
                    {["cancelled", "returning_to_warehouse"].includes(
                      order.status
                    ) &&
                      order.payment?.paymentStatus === "paid" &&
                      !order.refund?.bankInfo?.accountNumber && (
                        <p className="text-teal-700 font-medium mt-2">
                          💰 Vui lòng nhấn "Xem chi tiết" để gửi thông tin ngân
                          hàng nhận hoàn tiền
                        </p>
                      )}
                    {order.refund?.status === "pending" &&
                      order.refund?.bankInfo?.accountNumber && (
                        <p className="text-blue-700 font-medium mt-2">
                          ⏳ Đang chờ admin xử lý hoàn tiền
                        </p>
                      )}
                    {order.refund?.status === "completed" && (
                      <p className="text-emerald-700 font-medium mt-2">
                        ✅ Đã hoàn tiền thành công
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
