import React, { useState, useEffect } from "react";
import { adminOrderService } from "../../../services/OrderService";
import CancelRequestList from "./CancelRequestList";
import { useAuth } from "../../../hooks/useAuth";
import type { Order } from "../../../types/order";
import { toast } from "react-hot-toast";

// Simplified order interface for list display
interface OrderListItem {
  _id: string;
  orderCode: string;
  customerName: string;
  address: string;
  phone: string;
  price: string;
  paymentStatus: string;
  paymentStatusRaw?: string;
  paymentMethod?: string;
  orderStatus: string;
  orderStatusRaw?: string;
}

const ListOrderPage: React.FC = () => {
  const { canProcessOrders, hasAdminOnlyAccess } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderListItem | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"orders" | "cancel">("orders");

  // Lấy danh sách đơn hàng từ API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminOrderService.getAllOrders();
      setOrders(
        (res.data.orders || []).map((o: any) => ({
          _id: o._id,
          orderCode: o.code || o.orderCode || o._id,
          customerName: o.user?.name || o.shippingAddress?.name || "",
          address: [
            o.shippingAddress?.detail,
            o.shippingAddress?.ward,
            o.shippingAddress?.district,
            o.shippingAddress?.province,
          ]
            .filter(Boolean)
            .join(", "),
          phone: o.shippingAddress?.phone || o.user?.phone || "",
          price: o.totalAfterDiscountAndShipping
            ? o.totalAfterDiscountAndShipping.toLocaleString("vi-VN") + " (VND)"
            : "",
          paymentStatus:
            o.payment?.paymentStatus === "paid"
              ? "Đã thanh toán"
              : "Chưa thanh toán",
          paymentStatusRaw: o.payment?.paymentStatus,
          paymentMethod:
            o.payment?.method === "VNPAY"
              ? "VNPAY"
              : o.payment?.method === "COD"
              ? "Thanh toán khi nhận hàng"
              : o.payment?.method || "",
          orderStatus:
            o.status === "pending"
              ? "Chờ xác nhận"
              : o.status === "confirmed"
              ? "Đã xác nhận"
              : o.status === "shipping"
              ? "Đang giao hàng"
              : o.status === "delivered"
              ? "Giao hàng thành công"
              : o.status === "cancelled"
              ? "Đã hủy"
              : o.status === "returning"
              ? "Đang trả hàng"
              : o.status || "",
          orderStatusRaw: o.status,
        }))
      );
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "orders") fetchOrders();
  }, [tab]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleViewDetails = async (order: Order) => {
    try {
      const res = await adminOrderService.getOrderDetail(order._id);
      const o = res.data.data; // Remove fallback to res.data.order since it doesn't exist
      setSelectedOrder({
        _id: o._id,
        orderCode: o.code || o._id, // Remove o.orderCode since it doesn't exist in interface
        customerName: o.user?.name || o.shippingAddress?.name || "",
        address: [
          o.shippingAddress?.detail,
          o.shippingAddress?.ward,
          o.shippingAddress?.district,
          o.shippingAddress?.province,
        ]
          .filter(Boolean)
          .join(", "),
        phone: o.shippingAddress?.phone || "", // Remove o.user?.phone since user interface doesn't have phone
        price: o.totalAfterDiscountAndShipping
          ? o.totalAfterDiscountAndShipping.toLocaleString("vi-VN") + " (VND)"
          : "",
        paymentStatus:
          o.payment?.paymentStatus === "paid"
            ? "Đã thanh toán"
            : "Chưa thanh toán",
        paymentStatusRaw: o.payment?.paymentStatus,
        paymentMethod:
          o.payment?.method === "VNPAY"
            ? "VNPAY"
            : o.payment?.method === "COD"
            ? "Thanh toán khi nhận hàng"
            : o.payment?.method || "",
        orderStatus:
          o.status === "pending"
            ? "Chờ xác nhận"
            : o.status === "confirmed"
            ? "Đã xác nhận"
            : o.status === "shipping"
            ? "Đang giao hàng"
            : o.status === "delivered"
            ? "Giao hàng thành công"
            : o.status === "cancelled"
            ? "Đã hủy"
            : o.status === "returning"
            ? "Đang trả hàng"
            : o.status || "",
        orderStatusRaw: o.status,
      });
    } catch {
      // Fallback - just use empty object to prevent crash
      setSelectedOrder(null);
    }
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const handlePaymentFilter = (status: string) => {
    setPaymentFilter(status);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  const filteredOrders = orders.filter((order) => {
    return (
      (order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.orderCode.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (paymentFilter ? order.paymentStatus === paymentFilter : true) &&
      (statusFilter ? order.orderStatus === statusFilter : true)
    );
  });

  // Xử lý cập nhật trạng thái đơn hàng
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    // Type assertion to match the expected union type
    const validStatus = status as "confirmed" | "shipping" | "delivered";
    await adminOrderService.updateOrderStatus(orderId, { status: validStatus });
    fetchOrders();
  };

  // Xác nhận nhận hàng trả về (khi khách trả hàng)
  const handleConfirmReturn = async (orderId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xác nhận đã nhận hàng trả về?")) return;

    try {
      await adminOrderService.confirmReturn(orderId);
      toast.success("Đã xác nhận nhận hàng trả về");
      fetchOrders();
    } catch (error) {
      console.error("Error confirming return:", error);
      toast.error("Không thể xác nhận nhận hàng trả về");
    }
  };

  // Force xác nhận thanh toán cho VNPAY failed callbacks (Admin Only)
  const handleForceConfirmPayment = async (orderId: string) => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn xác nhận thanh toán cho đơn hàng này? Hành động này chỉ nên dùng khi VNPAY callback failed."
      )
    )
      return;

    try {
      await adminOrderService.forceConfirmPayment(orderId);
      toast.success("Đã xác nhận thanh toán thành công");
      fetchOrders();
    } catch (error) {
      console.error("Error forcing payment confirmation:", error);
      toast.error("Không thể xác nhận thanh toán");
    }
  };

  return (
    <div className="p-6 w-full font-sans">
      <h2 className="text-3xl font-bold text-mono-800 tracking-tight leading-snug mb-4">
        Quản Lý Đơn Hàng
      </h2>

      {/* Tab chuyển đổi */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setTab("orders")}
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
            tab === "orders"
              ? "text-mono-black border-mono-black"
              : "text-mono-500 border-transparent hover:text-mono-black"
          }`}
        >
          Danh sách đơn hàng
        </button>
        <button
          onClick={() => setTab("cancel")}
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
            tab === "cancel"
              ? "text-mono-black border-mono-black"
              : "text-mono-500 border-transparent hover:text-mono-black"
          }`}
        >
          Yêu cầu hủy đơn
        </button>
      </div>

      {/* Danh sách đơn hàng */}
      {tab === "orders" && (
        <>
          <div className="mb-4 flex items-center gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Tìm mã đơn hàng hoặc tên khách hàng"
              className="px-4 py-2 w-1/3 border border-mono-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-mono-600"
            />
          </div>
          <div className="overflow-x-auto shadow rounded-lg">
            <table className="min-w-full bg-white rounded-md overflow-hidden border">
              <thead className="bg-mono-50 text-mono-700 text-sm font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4 text-left border-b">Mã đơn hàng</th>
                  <th className="py-3 px-4 text-left border-b">Khách hàng</th>
                  <th className="py-3 px-4 text-left border-b">Địa chỉ</th>
                  <th className="py-3 px-4 text-left border-b">
                    Số điện thoại
                  </th>
                  <th className="py-3 px-4 text-left border-b">Giá</th>
                  <th className="py-3 px-4 text-left border-b">
                    Thanh toán
                    <select
                      className=" py-1 px-1 border rounded-md"
                      onChange={(e) => handlePaymentFilter(e.target.value)}
                      value={paymentFilter}
                    >
                      <option value="">Tất cả</option>
                      <option value="Đã thanh toán">Đã thanh toán</option>
                      <option value="Chưa thanh toán">Chưa thanh toán</option>
                    </select>
                  </th>
                  <th className="py-3 px-4 text-left border-b">
                    Phương thức thanh toán
                  </th>
                  <th className="py-3 px-4 text-left border-b">
                    Trạng thái
                    <select
                      className=" py-1 px-1 border rounded-md"
                      onChange={(e) => handleStatusFilter(e.target.value)}
                      value={statusFilter}
                    >
                      <option value="">Tất cả</option>
                      <option value="Đang giao hàng">Đang giao hàng</option>
                      <option value="Giao hàng thành công">
                        Giao hàng thành công
                      </option>
                      <option value="Đã hủy">Đã hủy</option>
                      <option value="Chờ xác nhận">Chờ xác nhận</option>
                    </select>
                  </th>
                  <th className="py-3 px-4 text-center border-b">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4">
                      Đang tải...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4">
                      Không có đơn hàng
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-mono-50 border-t">
                      <td className="py-2 px-4 border-b text-sm">
                        {order.orderCode}
                      </td>
                      <td className="py-2 px-4 border-b text-sm">
                        {order.customerName}
                      </td>
                      <td className="py-2 px-4 border-b text-sm">
                        {order.address}
                      </td>
                      <td className="py-2 px-4 border-b text-sm">
                        {order.phone}
                      </td>
                      <td className="py-2 px-4 border-b text-sm">
                        {order.price}
                      </td>
                      <td className="py-2 px-4 border-b text-sm">
                        {order.paymentStatus}
                      </td>
                      <td className="py-2 px-4 border-b text-sm">
                        {order.paymentMethod}
                      </td>
                      <td className="py-2 px-4 border-b text-sm">
                        {order.orderStatus}
                      </td>
                      <td className="py-2 px-4 border-b text-center text-sm">
                        <div className="flex flex-col gap-2 min-w-[120px] items-center">
                          <button
                            className="inline-flex items-center justify-center bg-mono-500 hover:bg-mono-black text-white text-xs px-3 py-1 rounded-full shadow-sm transition-all mb-1 w-32"
                            onClick={async () => {
                              try {
                                const res =
                                  await adminOrderService.getOrderDetail(
                                    order._id
                                  );
                                handleViewDetails(res.data.data);
                              } catch (err) {
                                console.error("Error fetching order:", err);
                              }
                            }}
                          >
                            Xem chi tiết
                          </button>
                          {canProcessOrders() ? (
                            <select
                              className="py-1 px-2 border rounded-full text-xs w-32"
                              value=""
                              onChange={(e) => {
                                const statusRaw = e.target.value;
                                if (statusRaw)
                                  handleUpdateOrderStatus(order._id, statusRaw);
                              }}
                            >
                              <option value="">Chọn trạng thái</option>
                              {order.orderStatusRaw === "pending" && (
                                <option value="confirmed">Đã xác nhận</option>
                              )}
                              {order.orderStatusRaw === "confirmed" && (
                                <option value="shipping">Đang giao hàng</option>
                              )}
                              {order.orderStatusRaw === "shipping" && (
                                <option value="delivered">
                                  Giao hàng thành công
                                </option>
                              )}
                            </select>
                          ) : (
                            <span className="py-1 px-2 text-xs text-mono-600">
                              Chờ xem
                            </span>
                          )}

                          {/* Nút xác nhận nhận hàng trả về - cho đơn đang trong quá trình đổi trả */}
                          {canProcessOrders() &&
                            order.orderStatusRaw === "returning" && (
                              <button
                                className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow-sm transition-all w-32"
                                onClick={() => handleConfirmReturn(order._id)}
                              >
                                Xác nhận trả hàng
                              </button>
                            )}

                          {/* Nút force xác nhận thanh toán - Admin Only, cho đơn VNPAY chưa thanh toán */}
                          {hasAdminOnlyAccess() &&
                            order.paymentMethod === "VNPAY" &&
                            order.paymentStatusRaw !== "paid" && (
                              <button
                                className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1 rounded-full shadow-sm transition-all w-32"
                                onClick={() =>
                                  handleForceConfirmPayment(order._id)
                                }
                                title="Force xác nhận thanh toán khi VNPAY callback failed"
                              >
                                Xác nhận TT
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Danh sách yêu cầu hủy đơn */}
      {tab === "cancel" && (
        <div className="mt-6">
          <CancelRequestList />
        </div>
      )}

      {/* Modal for Order Details */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-mono-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 shadow-2xl rounded-2xl w-full max-w-lg relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-4 text-2xl text-mono-400 hover:text-mono-700"
              title="Đóng"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-6 text-mono-700 text-center">
              Chi tiết đơn hàng
            </h3>
            <div className="grid grid-cols-1 gap-y-3">
              <div className="flex justify-between">
                <span className="font-semibold text-mono-600">
                  Mã đơn hàng:
                </span>
                <span className="text-mono-900">{selectedOrder.orderCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-mono-600">Khách hàng:</span>
                <span className="text-mono-900">
                  {selectedOrder.customerName}
                </span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="font-semibold text-mono-600 min-w-max">
                  Địa chỉ:
                </span>
                <span className="text-mono-900 text-right break-words max-w-[60%]">
                  {selectedOrder.address}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-mono-600">
                  Số điện thoại:
                </span>
                <span className="text-mono-900">{selectedOrder.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-mono-600">Giá:</span>
                <span className="text-mono-black font-bold">
                  {selectedOrder.price}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-mono-600">Thanh toán:</span>
                <span className="text-mono-900">
                  {selectedOrder.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-mono-600">
                  Phương thức thanh toán:
                </span>
                <span className="text-mono-900">
                  {selectedOrder.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-mono-600">Trạng thái:</span>
                <span className="text-mono-900">
                  {selectedOrder.orderStatus}
                </span>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="bg-mono-500 hover:bg-mono-black text-white px-6 py-2 rounded-lg font-medium shadow"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListOrderPage;
