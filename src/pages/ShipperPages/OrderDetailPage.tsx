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
import { shipperService } from "../../services/ShipperService";

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
      const response = await shipperService.getMyOrders();
      // response.data.data is the array of orders
      const orders = response.data.data || [];
      const foundOrder = orders.find((o: any) => o._id === orderId);
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
        ? "Xác nhận dã giao hàng thành công?"
        : newStatus === "delivery_failed"
        ? "Xác nhận giao hàng thểt b?i?"
        : newStatus === "out_for_delivery"
        ? "Xác nhận b?t đầu giao hàng?"
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
      alert("Cập nhật trạng thái thành công!");
      fetchOrderDetail();
      setFormData((prev) => ({ ...prev, note: "", images: [] }));
    } catch (error: any) {
      alert(
        error.response?.data?.message || "Có lỗi x?y ra khi cập nhật trạng thái"
      );
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      assigned_to_shipper: "bg-mono-100 text-mono-800",
      out_for_delivery: "bg-mono-100 text-mono-800",
      delivered: "bg-mono-100 text-mono-800",
      delivery_failed: "bg-mono-200 text-mono-900",
    };
    return colorMap[status] || "bg-mono-100 text-mono-800";
  };

  const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      assigned_to_shipper: "Ðã gán",
      out_for_delivery: "Ðang giao",
      delivered: "Ðã giao",
      delivery_failed: "Thểt b?i",
    };
    return labelMap[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-mono-500">Ðang tại...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="bg-mono-100 border border-mono-300 text-mono-900 rounded-lg p-6 text-center">
          <p className="mb-4">Không tìm thủy don hàng</p>
          <button
            onClick={() => navigate("/shipper/orders")}
            className="px-4 py-2 bg-mono-900 text-white rounded-lg"
          >
            Quay lỗi danh sách
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
          className="flex items-center gap-2 text-mono-black hover:text-mono-700"
        >
          <FaArrowLeft />
          <span>Quay lỗi</span>
        </button>
        <h1 className="text-2xl font-bold text-mono-800">
          Chi tiết don hàng #{order.orderNumber || order._id.slice(-8)}
        </h1>
      </div>

      {/* Order Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-mono-800">
            Trạng thái don hàng
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
              className="flex items-center justify-center gap-2 px-6 py-3 bg-mono-700 hover:bg-mono-800 text-white rounded-lg font-medium disabled:opacity-50"
            >
              <FaTruck />
              B?t đầu giao hàng
            </button>
          )}

          {(order.status === "assigned_to_shipper" ||
            order.status === "out_for_delivery") && (
            <>
              <button
                onClick={() => handleUpdateStatus("delivered")}
                disabled={updating}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-mono-800 hover:bg-mono-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                <FaCheckCircle />
                Giao thành công
              </button>
              <button
                onClick={() => handleUpdateStatus("delivery_failed")}
                disabled={updating}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-mono-900 hover:bg-mono-800 text-white rounded-lg font-medium disabled:opacity-50"
              >
                <FaTimesCircle />
                Giao thểt b?i
              </button>
            </>
          )}
        </div>

        {/* Note Input */}
        {(order.status === "assigned_to_shipper" ||
          order.status === "out_for_delivery") && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Ghi chú (tùy chơn)
            </label>
            <textarea
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              className="w-full border border-mono-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-mono-500 focus:border-transparent"
              rows={3}
              placeholder="Nhập ghi chú v? don hàng..."
            />
          </div>
        )}
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-mono-800 mb-4 flex items-center gap-2">
          <FaUser className="text-mono-black" />
          Thông tin khách hàng
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-mono-600">Họ tên</p>
            <p className="font-semibold text-mono-800">
              {order.user?.name || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-mono-600 flex items-center gap-1">
              <FaPhone size={12} />
              Số điện thoại
            </p>
            <p className="font-semibold text-mono-800">
              {order.user?.phone || order.shippingAddress?.phone || "N/A"}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-mono-600 flex items-center gap-1">
              <FaMapMarkerAlt className="text-mono-800" size={12} />
              Ð?a chờ giao hàng
            </p>
            <p className="font-semibold text-mono-800">
              {order.shippingAddress?.address || "N/A"}
            </p>
            {order.shippingAddress?.ward && (
              <p className="text-sm text-mono-600">
                {order.shippingAddress.ward}, {order.shippingAddress.district},{" "}
                {order.shippingAddress.province}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-mono-800 mb-4">
          Sản phẩm ({order.items?.length || 0})
        </h2>
        <div className="space-y-4">
          {order.items?.map((item: any, index: number) => (
            <div
              key={index}
              className="flex items-center gap-4 border-b border-mono-200 pb-4 last:border-0"
            >
              {item.variant?.imagesvariant?.[0] && (
                <img
                  src={item.variant.imagesvariant[0].url}
                  alt={item.product?.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <p className="font-semibold text-mono-800">
                  {item.product?.name || "N/A"}
                </p>
                <p className="text-sm text-mono-600">
                  Màu: {item.variant?.color?.name || "N/A"} | Size:{" "}
                  {item.size?.value || "N/A"}
                </p>
                <p className="text-sm text-mono-600">
                  Số lượng: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-mono-black">
                  {item.finalPrice?.toLocaleString("vi-VN")}?
                </p>
                <p className="text-xs text-mono-500">
                  x{item.quantity} ={" "}
                  {(item.finalPrice * item.quantity).toLocaleString("vi-VN")}?
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="mt-6 pt-6 border-t border-mono-200">
          <div className="space-y-2">
            <div className="flex justify-between text-mono-600">
              <span>Tạm tính</span>
              <span>{order.subtotalệ.toLocaleString("vi-VN")}?</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-mono-800">
                <span>Giảm giá</span>
                <span>-{order.discount?.toLocaleString("vi-VN")}?</span>
              </div>
            )}
            <div className="flex justify-between text-mono-600">
              <span>Phí vẩn chuyện</span>
              <span>{order.shippingFee?.toLocaleString("vi-VN")}?</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-mono-800 pt-2 border-t">
              <span>Tổng cẩng</span>
              <span className="text-mono-black">
                {order.finalTotalệ.toLocaleString("vi-VN")}?
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery History */}
      {order.deliveryAttempts && order.deliveryAttempts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-mono-800 mb-4">
            Lọch số giao hàng
          </h2>
          <div className="space-y-3">
            {order.deliveryAttempts.map((attempt: any, index: number) => (
              <div key={index} className="border-l-4 border-mono-500 pl-4 py-2">
                <p className="font-semibold text-mono-800">
                  Lẩn {attempt.attemptNumber}: {getStatusLabel(attempt.status)}
                </p>
                <p className="text-sm text-mono-600">
                  {new Date(attempt.timestamp).toLocaleString("vi-VN")}
                </p>
                {attempt.note && (
                  <p className="text-sm text-mono-600 mt-1">
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




