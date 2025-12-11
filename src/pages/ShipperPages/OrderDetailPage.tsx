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
} from "react-icons/fi";
import { shipperService } from "../../services/ShipperService";
import { toast } from "react-hot-toast";

interface OrderItem {
  _id: string;
  product?: {
    name: string;
    images?: { url: string }[];
  };
  variant?: {
    color?: { name: string };
    size?: { name: string; value?: string };
    imagesvariant?: { url: string }[];
  };
  quantity: number;
  price: number;
  finalPrice?: number;
  size?: { value?: string };
}

interface DeliveryAttempt {
  status: string;
  note?: string;
  createdAt: string;
  timestamp?: string;
  attemptNumber?: number;
}

interface ShipperOrderDetail {
  _id: string;
  orderNumber?: string;
  code?: string;
  status: string;
  createdAt: string;
  user?: { name: string; phone?: string };
  shippingAddress?: {
    name?: string;
    phone?: string;
    detail?: string;
    ward?: string;
    district?: string;
    province?: string;
    address?: string;
  };
  totalAfterDiscountAndShipping?: number;
  finalTotal?: number;
  totalAmount?: number;
  subtotal?: number;
  discount?: number;
  shippingFee?: number;
  items?: OrderItem[];
  deliveryAttempts?: DeliveryAttempt[];
  payment?: {
    method?: string;
    paymentStatus?: string;
  };
}

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<ShipperOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    status: "",
    note: "",
    images: [] as string[],
    location: {
      latitude: 0,
      longitude: 0,
    },
  });

  const fetchOrderDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await shipperService.getMyOrders();
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const ordersData = (response.data as any).data || response.data || [];
      const orders = Array.isArray(ordersData) ? ordersData : [];
      const foundOrder = orders.find(
        (o: ShipperOrderDetail) => o._id === orderId
      );
      /* eslint-enable @typescript-eslint/no-explicit-any */
      if (foundOrder) {
        setOrder(foundOrder);
        setFormData((prev) => ({ ...prev, status: foundOrder.status }));
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
    getCurrentLocation();
  }, [fetchOrderDetail]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const handleUpdateStatus = async (
    newStatus: "out_for_delivery" | "delivery_failed" | "delivered"
  ) => {
    if (!orderId) return;

    const confirmMessage =
      newStatus === "delivered"
        ? "Xác nhận đã giao hàng thành công?"
        : newStatus === "delivery_failed"
        ? "Xác nhận giao hàng thất bại?"
        : newStatus === "out_for_delivery"
        ? "Xác nhận bắt đầu giao hàng?"
        : "Xác nhận cập nhật trạng thái?";

    if (!window.confirm(confirmMessage)) return;

    try {
      setUpdating(true);
      await shipperService.updateDeliveryStatus(orderId, {
        status: newStatus,
        note: formData.note || undefined,
        images: formData.images.length > 0 ? formData.images : undefined,
        location: formData.location.latitude ? formData.location : undefined,
      });
      toast.success("Cập nhật trạng thái thành công!");
      fetchOrderDetail();
      setFormData((prev) => ({ ...prev, note: "", images: [] }));
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái"
      );
    } finally {
      setUpdating(false);
    }
  };

  const STATUS_CONFIG: Record<
    string,
    { label: string; color: string; icon: JSX.Element }
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

  const canUpdateStatus =
    order.status === "assigned_to_shipper" ||
    order.status === "out_for_delivery";

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
          <div className="bg-mono-900 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-mono-400 text-sm mb-1">Mã đơn hàng</p>
                <h1 className="text-2xl font-bold font-mono">
                  #
                  {(order.orderNumber || order.code || order._id)
                    .toString()
                    .slice(-8)
                    .toUpperCase()}
                </h1>
              </div>
              {getStatusBadge(order.status)}
            </div>
          </div>

          {/* Status Actions */}
          {canUpdateStatus && (
            <div className="p-6 border-b border-mono-100">
              <h3 className="font-semibold text-mono-900 mb-4">
                Cập nhật trạng thái
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                {(order.status === "assigned_to_shipper" ||
                  order.status === "out_for_delivery") && (
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
                    .join(", ") ||
                    order.shippingAddress?.address ||
                    "N/A"}
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
              Sản phẩm ({order.items?.length || 0})
            </h2>
          </div>

          <div className="divide-y divide-mono-100">
            {order.items?.map((item: OrderItem, index: number) => (
              <div key={index} className="p-4 flex items-center gap-4">
                {(item as { variant?: { imagesvariant?: { url: string }[] } })
                  .variant?.imagesvariant?.[0] ? (
                  <img
                    src={
                      (
                        item as {
                          variant?: { imagesvariant?: { url: string }[] };
                        }
                      ).variant!.imagesvariant![0].url
                    }
                    alt={item.product?.name}
                    className="w-20 h-20 object-cover rounded-lg border border-mono-200"
                  />
                ) : (
                  <div className="w-20 h-20 bg-mono-100 rounded-lg flex items-center justify-center">
                    <FiPackage className="text-mono-400" size={24} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-mono-900 truncate">
                    {item.product?.name || "N/A"}
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
                    {formatCurrency(item.finalPrice || item.price)}
                  </p>
                  <p className="text-xs text-mono-500 mt-0.5">
                    x{item.quantity} ={" "}
                    {formatCurrency(
                      (item.finalPrice || item.price) * item.quantity
                    )}
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
                <span>
                  {formatCurrency(order.subtotal || order.totalAmount || 0)}
                </span>
              </div>
              {(order.discount || 0) > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Giảm giá</span>
                  <span>-{formatCurrency(order.discount || 0)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-mono-600">
                <span>Phí vận chuyển</span>
                <span>{formatCurrency(order.shippingFee || 0)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-mono-900 pt-3 border-t border-mono-200">
                <span>Tổng cộng</span>
                <span>
                  {formatCurrency(
                    order.totalAfterDiscountAndShipping ||
                      order.finalTotal ||
                      order.totalAmount ||
                      0
                  )}
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
                {order.deliveryAttempts.map(
                  (attempt: DeliveryAttempt, index: number) => {
                    const config =
                      STATUS_CONFIG[attempt.status] ||
                      STATUS_CONFIG.assigned_to_shipper;
                    return (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              attempt.status === "delivered"
                                ? "bg-emerald-500"
                                : attempt.status === "delivery_failed"
                                ? "bg-rose-500"
                                : "bg-mono-400"
                            }`}
                          />
                          {order.deliveryAttempts &&
                            index < order.deliveryAttempts.length - 1 && (
                              <div className="w-0.5 flex-1 bg-mono-200 mt-2" />
                            )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-mono-900">
                              Lần {attempt.attemptNumber || index + 1}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${config.color}`}
                            >
                              {config.label}
                            </span>
                          </div>
                          <p className="text-sm text-mono-500">
                            {formatDate(attempt.timestamp || attempt.createdAt)}
                          </p>
                          {attempt.note && (
                            <p className="text-sm text-mono-600 mt-1 bg-mono-50 rounded-lg px-3 py-2">
                              {attempt.note}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailPage;
