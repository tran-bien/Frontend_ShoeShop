import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaTruck,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import ShipperService from "../../services/ShipperService";

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
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

  useEffect(() => {
    fetchOrderDetail();
    getCurrentLocation();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await ShipperService.getMyOrders();
      const foundOrder = response.data.find((o: any) => o._id === orderId);
      if (foundOrder) {
        setOrder(foundOrder);
        setFormData((prev) => ({ ...prev, status: foundOrder.status }));
      }
    } catch (error) {
      console.error("Error fetching order detail:", error);
    } finally {
      setLoading(false);
    }
  };

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
      await ShipperService.updateDeliveryStatus(orderId, {
        status: newStatus,
        note: formData.note || undefined,
        images: formData.images.length > 0 ? formData.images : undefined,
        location: formData.location.latitude ? formData.location : undefined,
      });
      alert("Cập nhật trạng thái thành công!");
      fetchOrderDetail();
      setFormData((prev) => ({ ...prev, note: "", images: [] }));
    } catch (error: any) {
      alert(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái"
      );
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      assigned_to_shipper: "bg-blue-100 text-blue-800",
      out_for_delivery: "bg-yellow-100 text-yellow-800",
      delivered: "bg-green-100 text-green-800",
      delivery_failed: "bg-red-100 text-red-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      assigned_to_shipper: "Đã gán",
      out_for_delivery: "Đang giao",
      delivered: "Đã giao",
      delivery_failed: "Thất bại",
    };
    return labelMap[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6 text-center">
          <p className="mb-4">Không tìm thấy đơn hàng</p>
          <button
            onClick={() => navigate("/shipper/orders")}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/shipper/orders")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <FaArrowLeft />
          <span>Quay lại</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Chi tiết đơn hàng #{order.orderNumber || order._id.slice(-8)}
        </h1>
      </div>

      {/* Order Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Trạng thái đơn hàng
          </h2>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
              order.status
            )}`}
          >
            {getStatusLabel(order.status)}
          </span>
        </div>

        {/* Status Update Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {order.status === "assigned_to_shipper" && (
            <button
              onClick={() => handleUpdateStatus("out_for_delivery")}
              disabled={updating}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              <FaTruck />
              Bắt đầu giao hàng
            </button>
          )}

          {(order.status === "assigned_to_shipper" ||
            order.status === "out_for_delivery") && (
            <>
              <button
                onClick={() => handleUpdateStatus("delivered")}
                disabled={updating}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                <FaCheckCircle />
                Giao thành công
              </button>
              <button
                onClick={() => handleUpdateStatus("delivery_failed")}
                disabled={updating}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                <FaTimesCircle />
                Giao thất bại
              </button>
            </>
          )}
        </div>

        {/* Note Input */}
        {(order.status === "assigned_to_shipper" ||
          order.status === "out_for_delivery") && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Nhập ghi chú về đơn hàng..."
            />
          </div>
        )}
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaUser className="text-blue-600" />
          Thông tin khách hàng
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Họ tên</p>
            <p className="font-semibold text-gray-800">
              {order.user?.name || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <FaPhone size={12} />
              Số điện thoại
            </p>
            <p className="font-semibold text-gray-800">
              {order.user?.phone || order.shippingAddress?.phone || "N/A"}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <FaMapMarkerAlt className="text-red-500" size={12} />
              Địa chỉ giao hàng
            </p>
            <p className="font-semibold text-gray-800">
              {order.shippingAddress?.address || "N/A"}
            </p>
            {order.shippingAddress?.ward && (
              <p className="text-sm text-gray-600">
                {order.shippingAddress.ward}, {order.shippingAddress.district},{" "}
                {order.shippingAddress.province}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Sản phẩm ({order.items?.length || 0})
        </h2>
        <div className="space-y-4">
          {order.items?.map((item: any, index: number) => (
            <div
              key={index}
              className="flex items-center gap-4 border-b border-gray-200 pb-4 last:border-0"
            >
              {item.variant?.images?.[0] && (
                <img
                  src={item.variant.images[0]}
                  alt={item.product?.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-800">
                  {item.product?.name || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Màu: {item.variant?.color?.name || "N/A"} | Size:{" "}
                  {item.size?.value || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Số lượng: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">
                  {item.finalPrice?.toLocaleString("vi-VN")}₫
                </p>
                <p className="text-xs text-gray-500">
                  x{item.quantity} ={" "}
                  {(item.finalPrice * item.quantity).toLocaleString("vi-VN")}₫
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Tạm tính</span>
              <span>{order.subtotal?.toLocaleString("vi-VN")}₫</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá</span>
                <span>-{order.discount?.toLocaleString("vi-VN")}₫</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Phí vận chuyển</span>
              <span>{order.shippingFee?.toLocaleString("vi-VN")}₫</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
              <span>Tổng cộng</span>
              <span className="text-blue-600">
                {order.finalTotal?.toLocaleString("vi-VN")}₫
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery History */}
      {order.deliveryAttempts && order.deliveryAttempts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Lịch sử giao hàng
          </h2>
          <div className="space-y-3">
            {order.deliveryAttempts.map((attempt: any, index: number) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="font-semibold text-gray-800">
                  Lần {attempt.attemptNumber}: {getStatusLabel(attempt.status)}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(attempt.timestamp).toLocaleString("vi-VN")}
                </p>
                {attempt.note && (
                  <p className="text-sm text-gray-600 mt-1">
                    Ghi chú: {attempt.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
