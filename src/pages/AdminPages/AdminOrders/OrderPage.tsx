import React, { useState, useEffect } from "react";
import { adminOrderService } from "../../../services/OrderServiceV2";
import CancelRequestList from "./CancelRequestList";

interface Order {
  _id: string;
  orderCode: string;
  customerName: string;
  address: string;
  phone: string;
  price: string;
  paymentStatus: string;
  paymentMethod?: string;
  orderStatus: string;
  orderStatusRaw?: string;
}

const ListOrderPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
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
            : o.status || "",
        orderStatusRaw: o.status,
      });
    } catch {
      setSelectedOrder(order);
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

  return (
    <div className="p-6 w-full font-sans">
      <h2 className="text-3xl font-bold text-gray-800 tracking-tight leading-snug mb-4">
        Quản Lý Đơn Hàng
      </h2>

      {/* Tab chuyển đổi */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setTab("orders")}
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
            tab === "orders"
              ? "text-blue-600 border-blue-600"
              : "text-gray-500 border-transparent hover:text-blue-600"
          }`}
        >
          Danh sách đơn hàng
        </button>
        <button
          onClick={() => setTab("cancel")}
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
            tab === "cancel"
              ? "text-blue-600 border-blue-600"
              : "text-gray-500 border-transparent hover:text-blue-600"
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
              className="px-4 py-2 w-1/3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="overflow-x-auto shadow rounded-lg">
            <table className="min-w-full bg-white rounded-md overflow-hidden border">
              <thead className="bg-gray-50 text-gray-700 text-sm font-semibold uppercase">
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
                    <tr key={order._id} className="hover:bg-gray-50 border-t">
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
                            className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow-sm transition-all mb-1 w-32"
                            onClick={() => handleViewDetails(order)}
                          >
                            Xem chi tiết
                          </button>
                          <select
                            className="py-1 px-2 border rounded-full text-xs w-32"
                            value=""
                            onChange={(e) => {
                              let statusRaw = e.target.value;
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
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 shadow-2xl rounded-2xl w-full max-w-lg relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-gray-700"
              title="Đóng"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-6 text-blue-700 text-center">
              Chi tiết đơn hàng
            </h3>
            <div className="grid grid-cols-1 gap-y-3">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">
                  Mã đơn hàng:
                </span>
                <span className="text-gray-900">{selectedOrder.orderCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Khách hàng:</span>
                <span className="text-gray-900">
                  {selectedOrder.customerName}
                </span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="font-semibold text-gray-600 min-w-max">
                  Địa chỉ:
                </span>
                <span className="text-gray-900 text-right break-words max-w-[60%]">
                  {selectedOrder.address}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">
                  Số điện thoại:
                </span>
                <span className="text-gray-900">{selectedOrder.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Giá:</span>
                <span className="text-blue-600 font-bold">
                  {selectedOrder.price}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Thanh toán:</span>
                <span className="text-gray-900">
                  {selectedOrder.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">
                  Phương thức thanh toán:
                </span>
                <span className="text-gray-900">
                  {selectedOrder.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Trạng thái:</span>
                <span className="text-gray-900">
                  {selectedOrder.orderStatus}
                </span>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow"
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
