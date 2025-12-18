/**
 * OrderDetailPage - Chi tiết đơn hàng của Shipper
 * SYNCED WITH BE: shipper.service.js - updateDeliveryStatus()
 *
 * BE Allowed Transitions:
 * - assigned_to_shipper → [out_for_delivery]
 * - out_for_delivery → [delivered, delivery_failed]
 * - delivery_failed → [out_for_delivery, delivery_failed]
 */
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiPackage,
  FiDollarSign,
  FiRefreshCw,
  FiAlertCircle,
  FiEdit3,
  FiNavigation,
  FiRotateCw,
} from "react-icons/fi";
import { shipperService } from "../../services/ShipperService";
import { toast } from "react-hot-toast";
import type {
  Order,
  OrderStatus,
  OrderItem,
  DeliveryAttempt,
} from "../../types/order";
import type { UpdateDeliveryStatusData } from "../../types/shipper";

// ===== STATUS CONFIG - ĐÚNG THEO BE =====
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  assigned_to_shipper: {
    label: "Chờ lấy hàng",
    color: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: <FiClock size={16} />,
  },
  out_for_delivery: {
    label: "Đang giao",
    color: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: <FiTruck size={16} />,
  },
  delivered: {
    label: "Đã giao thành công",
    color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: <FiCheckCircle size={16} />,
  },
  delivery_failed: {
    label: "Giao thất bại",
    color: "bg-rose-50 text-rose-700 border border-rose-200",
    icon: <FiXCircle size={16} />,
  },
  returning_to_warehouse: {
    label: "Đang trả về kho",
    color: "bg-orange-50 text-orange-700 border border-orange-200",
    icon: <FiRotateCw size={16} />,
  },
  // DeliveryAttempts status mapping từ BE (success, failed, out_for_delivery)
  success: {
    label: "Giao thành công",
    color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: <FiCheckCircle size={16} />,
  },
  cancelled: {
    label: "Giao thất bại",
    color: "bg-rose-50 text-rose-700 border border-rose-200",
    icon: <FiXCircle size={16} />,
  },
  returned: {
    label: "Giao thành công",
    color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: <FiCheckCircle size={16} />,
  },
};

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    note: "",
    images: [] as string[],
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    status: UpdateDeliveryStatusData["status"];
    message: string;
  } | null>(null);

  const fetchOrderDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await shipperService.getMyOrders();
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const responseData = (response.data as any)?.data || response.data;
      const ordersData = responseData?.orders || responseData || [];
      const orders: Order[] = Array.isArray(ordersData) ? ordersData : [];
      const foundOrder = orders.find((o) => o._id === orderId);
      /* eslint-enable @typescript-eslint/no-explicit-any */
      if (foundOrder) {
        setOrder(foundOrder);
      }
    } catch (error) {
      console.error("Error fetching order detail:", error);
      toast.error("Không thể tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  /**
   * Update delivery status theo đúng BE logic
   */
  const handleUpdateStatus = async (
    newStatus: UpdateDeliveryStatusData["status"]
  ) => {
    if (!orderId) return;

    const confirmMessages: Record<string, string> = {
      out_for_delivery: "Bạn có chắc chắn muốn bắt đầu giao hàng không?",
      delivered: "Bạn có chắc chắn đã giao hàng thành công không?",
      delivery_failed: "Bạn có chắc chắn giao hàng thất bại không?",
    };

    // Hiển thị modal xác nhận
    setPendingAction({
      status: newStatus,
      message: confirmMessages[newStatus],
    });
    setShowConfirmModal(true);
  };

  const confirmUpdateStatus = async () => {
    if (!orderId || !pendingAction) return;

    try {
      setUpdating(true);
      setShowConfirmModal(false);
      await shipperService.updateDeliveryStatus(orderId, {
        status: pendingAction.status,
        note: formData.note || undefined,
        images: formData.images.length > 0 ? formData.images : undefined,
      });
      toast.success("Cập nhật trạng thái thành công!");
      fetchOrderDetail();
      setFormData({ note: "", images: [] });
      setPendingAction(null);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái"
      );
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || {
      label: status,
      color: "bg-mono-100 text-mono-600 border border-mono-200",
      icon: <FiAlertCircle size={16} />,
    };

    return (
      <span
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${config.color}`}
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
    return new Date(dateStr).toLocaleString("vi-VN");
  };

  const openGoogleMaps = () => {
    if (!order) return;
    const address = [
      order.shippingAddress?.detail,
      order.shippingAddress?.ward,
      order.shippingAddress?.district,
      order.shippingAddress?.province,
    ]
      .filter(Boolean)
      .join(", ");
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        address
      )}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <FiRefreshCw className="animate-spin text-mono-400" size={32} />
          <span className="text-mono-500">Đang tải thông tin đơn hàng...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border border-mono-200 p-12 text-center">
          <FiAlertCircle className="mx-auto text-mono-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-mono-700 mb-2">
            Không tìm thấy đơn hàng
          </h3>
          <p className="text-mono-500 text-sm mb-6">
            Đơn hàng này có thể đã bị xóa hoặc không tồn tại
          </p>
          <button
            onClick={() => navigate("/shipper/orders")}
            className="inline-flex items-center gap-2 bg-mono-900 hover:bg-mono-800 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            <FiArrowLeft size={16} />
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  // Các trạng thái shipper có thể cập nhật theo BE
  const canUpdateStatus: OrderStatus[] = [
    "assigned_to_shipper",
    "out_for_delivery",
    "delivery_failed",
  ];
  const isUpdatable = canUpdateStatus.includes(order.status);

  return (
    <div className="p-6 bg-mono-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/shipper/orders")}
            className="inline-flex items-center gap-2 text-mono-600 hover:text-mono-900 font-medium transition-colors"
          >
            <FiArrowLeft size={18} />
            Quay lại danh sách
          </button>
        </div>

        {/* Order Header Card */}
        <div className="bg-white rounded-xl border border-mono-200 shadow-sm overflow-hidden">
          <div className="bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-mono-500 text-sm mb-1">Mã đơn hàng</p>
                <h1 className="text-2xl font-bold text-mono-900 font-mono">
                  #{order.code.slice(-8).toUpperCase()}
                </h1>
              </div>
              {getStatusBadge(order.status)}
            </div>
          </div>

          {/* Status Actions - Theo BE allowed transitions */}
          {isUpdatable && (
            <div className="p-6 border-b border-mono-100">
              <h3 className="font-semibold text-mono-900 mb-4">
                Cập nhật trạng thái
              </h3>

              {/* Hướng dẫn luồng giao hàng */}
              <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-sm text-blue-800">
                  <strong>📋 Luồng giao hàng:</strong>{" "}
                  {order.status === "assigned_to_shipper" && (
                    <>
                      Nhấn <strong>"Bắt đầu giao"</strong> khi bạn đã lấy hàng
                      và bắt đầu đến địa chỉ giao.
                    </>
                  )}
                  {order.status === "out_for_delivery" && (
                    <>
                      Chọn <strong>"Giao thành công"</strong> hoặc{" "}
                      <strong>"Giao thất bại"</strong> sau khi đến địa chỉ
                      khách.
                    </>
                  )}
                  {order.status === "delivery_failed" && (
                    <>
                      Nhấn <strong>"Giao lại"</strong> để thử giao lần nữa.
                      {order.deliveryAttempts &&
                        order.deliveryAttempts.filter(
                          (a) => a.status === "failed"
                        ).length >= 2 && (
                          <span className="text-rose-600 ml-1">
                            (Cảnh báo: Còn 1 lần thử cuối!)
                          </span>
                        )}
                    </>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* assigned_to_shipper → out_for_delivery */}
                {order.status === "assigned_to_shipper" && (
                  <button
                    onClick={() => handleUpdateStatus("out_for_delivery")}
                    disabled={updating}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium disabled:opacity-50 transition-colors"
                  >
                    <FiTruck size={18} />
                    Bắt đầu giao hàng
                  </button>
                )}

                {/* out_for_delivery → delivered | delivery_failed */}
                {order.status === "out_for_delivery" && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus("delivered")}
                      disabled={updating}
                      className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium disabled:opacity-50 transition-colors"
                    >
                      <FiCheckCircle size={18} />
                      Giao thành công
                    </button>
                    <button
                      onClick={() => handleUpdateStatus("delivery_failed")}
                      disabled={updating}
                      className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium disabled:opacity-50 transition-colors"
                    >
                      <FiXCircle size={18} />
                      Giao thất bại
                    </button>
                  </>
                )}

                {/* delivery_failed → out_for_delivery (Giao lại) */}
                {order.status === "delivery_failed" && (
                  <button
                    onClick={() => handleUpdateStatus("out_for_delivery")}
                    disabled={updating}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium disabled:opacity-50 transition-colors"
                  >
                    <FiRotateCw size={18} />
                    Giao lại
                  </button>
                )}
              </div>

              {/* Note Input */}
              <div className="mt-4">
                <label className="flex items-center gap-2 text-sm font-medium text-mono-700 mb-2">
                  <FiEdit3 size={14} />
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  className="w-full border border-mono-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-mono-300 focus:border-mono-300 focus:outline-none text-sm"
                  rows={3}
                  placeholder="Nhập ghi chú về đơn hàng (lý do thất bại, ghi chú giao hàng...)"
                />
              </div>
            </div>
          )}
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-mono-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-mono-100 flex items-center gap-3">
            <div className="p-2 bg-mono-100 rounded-lg">
              <FiUser className="text-mono-700" size={18} />
            </div>
            <h2 className="font-semibold text-mono-900">
              Thông tin khách hàng
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-mono-500 uppercase tracking-wide mb-1">
                  Họ tên
                </p>
                <p className="font-semibold text-mono-900">
                  {order.user?.name || order.shippingAddress?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-mono-500 uppercase tracking-wide mb-1">
                  Số điện thoại
                </p>
                <a
                  href={`tel:${
                    order.user?.phone || order.shippingAddress?.phone
                  }`}
                  className="inline-flex items-center gap-2 font-semibold text-mono-900 hover:text-blue-600 transition-colors"
                >
                  <FiPhone size={14} />
                  {order.user?.phone || order.shippingAddress?.phone || "N/A"}
                </a>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-mono-500 uppercase tracking-wide mb-1">
                  Địa chỉ giao hàng
                </p>
                <p className="font-semibold text-mono-900 mb-2">
                  {[
                    order.shippingAddress?.detail,
                    order.shippingAddress?.ward,
                    order.shippingAddress?.district,
                    order.shippingAddress?.province,
                  ]
                    .filter(Boolean)
                    .join(", ") || "N/A"}
                </p>
                <button
                  onClick={openGoogleMaps}
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <FiNavigation size={14} />
                  Mở trên Google Maps
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl border border-mono-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-mono-100 flex items-center gap-3">
            <div className="p-2 bg-mono-100 rounded-lg">
              <FiPackage className="text-mono-700" size={18} />
            </div>
            <h2 className="font-semibold text-mono-900">
              Sản phẩm ({order.orderItems?.length || 0})
            </h2>
          </div>

          <div className="divide-y divide-mono-100">
            {order.orderItems?.map((item: OrderItem, index: number) => (
              <div key={index} className="p-4 flex items-center gap-4">
                {item.variant?.product?.images?.[0]?.url ? (
                  <img
                    src={item.variant.product.images[0].url}
                    alt={item.productName}
                    className="w-20 h-20 object-cover rounded-lg border border-mono-200"
                  />
                ) : (
                  <div className="w-20 h-20 bg-mono-100 rounded-lg flex items-center justify-center">
                    <FiPackage className="text-mono-400" size={24} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-mono-900 truncate">
                    {item.productName || item.variant?.product?.name || "N/A"}
                  </p>
                  <p className="text-sm text-mono-500 mt-0.5">
                    Màu: {item.variant?.color?.name || "N/A"} | Size:{" "}
                    {item.size?.value || "N/A"}
                  </p>
                  <p className="text-sm text-mono-500">
                    Số lượng: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-mono-900">
                    {formatCurrency(item.price)}
                  </p>
                  <p className="text-xs text-mono-500 mt-0.5">
                    x{item.quantity} ={" "}
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="px-6 py-4 bg-mono-50 border-t border-mono-100">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-mono-600">
                <span>Tạm tính</span>
                <span>{formatCurrency(order.subTotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Giảm giá</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-mono-600">
                <span>Phí vận chuyển</span>
                <span>{formatCurrency(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-mono-900 pt-3 border-t border-mono-200">
                <span>Tổng cộng</span>
                <span>
                  {formatCurrency(order.totalAfterDiscountAndShipping)}
                </span>
              </div>
              <div className="pt-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
                    order.payment?.paymentStatus === "paid"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  <FiDollarSign size={12} />
                  {order.payment?.paymentStatus === "paid"
                    ? "Đã thanh toán"
                    : "Thu tiền khi giao (COD)"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery History */}
        {order.deliveryAttempts && order.deliveryAttempts.length > 0 && (
          <div className="bg-white rounded-xl border border-mono-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-mono-100 flex items-center gap-3">
              <div className="p-2 bg-mono-100 rounded-lg">
                <FiClock className="text-mono-700" size={18} />
              </div>
              <h2 className="font-semibold text-mono-900">Lịch sử giao hàng</h2>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {/* FIX: Nhóm attempts theo cặp (out_for_delivery + result) để hiển thị đúng số lần giao */}
                {(() => {
                  const groupedAttempts: Array<{
                    startAttempt: DeliveryAttempt;
                    resultAttempt?: DeliveryAttempt;
                  }> = [];

                  for (let i = 0; i < order.deliveryAttempts.length; i++) {
                    const current = order.deliveryAttempts[i];

                    // Nếu là out_for_delivery, tìm result tiếp theo
                    if (current.status === "out_for_delivery") {
                      const next = order.deliveryAttempts[i + 1];
                      if (
                        next &&
                        (next.status === "success" || next.status === "failed")
                      ) {
                        groupedAttempts.push({
                          startAttempt: current,
                          resultAttempt: next,
                        });
                        i++; // Skip next vì đã lấy rồi
                      } else {
                        // Chỉ có out_for_delivery, chưa có kết quả
                        groupedAttempts.push({ startAttempt: current });
                      }
                    } else if (
                      current.status === "success" ||
                      current.status === "failed"
                    ) {
                      // Result không có out_for_delivery đi kèm (edge case)
                      groupedAttempts.push({
                        startAttempt: current,
                      });
                    }
                  }

                  return groupedAttempts.map((group, index) => {
                    const displayAttempt =
                      group.resultAttempt || group.startAttempt;
                    const config =
                      STATUS_CONFIG[displayAttempt.status] ||
                      STATUS_CONFIG.assigned_to_shipper;

                    return (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              displayAttempt.status === "success"
                                ? "bg-emerald-500"
                                : displayAttempt.status === "failed"
                                ? "bg-rose-500"
                                : "bg-amber-400"
                            }`}
                          />
                          {index < groupedAttempts.length - 1 && (
                            <div className="w-0.5 flex-1 bg-mono-200 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-mono-900">
                              Lần {index + 1}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${config.color}`}
                            >
                              {config.label}
                            </span>
                          </div>

                          {/* Hiển thị thời gian bắt đầu giao */}
                          {group.startAttempt && (
                            <p className="text-sm text-mono-500">
                              Bắt đầu: {formatDate(group.startAttempt.time)}
                            </p>
                          )}

                          {/* Hiển thị kết quả nếu có */}
                          {group.resultAttempt &&
                            group.resultAttempt !== group.startAttempt && (
                              <p className="text-sm text-mono-500">
                                Kết quả: {formatDate(group.resultAttempt.time)}
                              </p>
                            )}

                          {displayAttempt.note && (
                            <p className="text-sm text-mono-600 mt-1 bg-mono-50 rounded-lg px-3 py-2">
                              {displayAttempt.note}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && pendingAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    pendingAction.status === "delivered"
                      ? "bg-emerald-100"
                      : pendingAction.status === "delivery_failed"
                      ? "bg-rose-100"
                      : "bg-amber-100"
                  }`}
                >
                  {pendingAction.status === "delivered" ? (
                    <FiCheckCircle className="text-emerald-600" size={24} />
                  ) : pendingAction.status === "delivery_failed" ? (
                    <FiXCircle className="text-rose-600" size={24} />
                  ) : (
                    <FiTruck className="text-amber-600" size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-mono-900">
                    Xác nhận hành động
                  </h3>
                  <p className="text-sm text-mono-500">
                    Vui lòng xác nhận để tiếp tục
                  </p>
                </div>
              </div>

              <p className="text-mono-700 mb-6">{pendingAction.message}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setPendingAction(null);
                  }}
                  disabled={updating}
                  className="flex-1 px-4 py-2.5 bg-mono-100 hover:bg-mono-200 text-mono-700 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={confirmUpdateStatus}
                  disabled={updating}
                  className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium transition-colors disabled:opacity-50 ${
                    pendingAction.status === "delivered"
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : pendingAction.status === "delivery_failed"
                      ? "bg-rose-500 hover:bg-rose-600"
                      : "bg-amber-500 hover:bg-amber-600"
                  }`}
                >
                  {updating ? "Đang xử lý..." : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
