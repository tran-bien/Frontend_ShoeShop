import React, { useState, useEffect } from "react";
import { adminOrderService } from "../../../services/OrderService";
import CancelRequestList from "./CancelRequestList";
import { useAuth } from "../../../hooks/useAuth";
import type { Order } from "../../../types/order";

// Simplified order interface for list display
interface OrderListItem {
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
  const { canProcessOrders } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderListItem | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"orders" | "cancel">("orders");

  // L?y danh sï¿½ch don hï¿½ng từ API
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
              ? "ï¿½ï¿½ thanh toï¿½n"
              : "Chua thanh toï¿½n",
          paymentMethod:
            o.payment?.method === "VNPAY"
              ? "VNPAY"
              : o.payment?.method === "COD"
              ? "Thanh toï¿½n khi nhơn hï¿½ng"
              : o.payment?.method || "",
          orderStatus:
            o.status === "pending"
              ? "Chờ xï¿½c nhơn"
              : o.status === "confirmed"
              ? "ï¿½ï¿½ xï¿½c nhơn"
              : o.status === "shipping"
              ? "ï¿½ang giao hï¿½ng"
              : o.status === "delivered"
              ? "Giao hï¿½ng thï¿½nh cï¿½ng"
              : o.status === "cancelled"
              ? "ï¿½ï¿½ hủy"
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
            ? "ï¿½ï¿½ thanh toï¿½n"
            : "Chua thanh toï¿½n",
        paymentMethod:
          o.payment?.method === "VNPAY"
            ? "VNPAY"
            : o.payment?.method === "COD"
            ? "Thanh toï¿½n khi nhơn hï¿½ng"
            : o.payment?.method || "",
        orderStatus:
          o.status === "pending"
            ? "Chờ xï¿½c nhơn"
            : o.status === "confirmed"
            ? "ï¿½ï¿½ xï¿½c nhơn"
            : o.status === "shipping"
            ? "ï¿½ang giao hï¿½ng"
            : o.status === "delivered"
            ? "Giao hï¿½ng thï¿½nh cï¿½ng"
            : o.status === "cancelled"
            ? "ï¿½ï¿½ hủy"
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

  // X? lï¿½ cập nhật trống thï¿½i don hï¿½ng
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    // Type assertion to match the expected union type
    const validStatus = status as "confirmed" | "shipping" | "delivered";
    await adminOrderService.updateOrderStatus(orderId, { status: validStatus });
    fetchOrders();
  };

  return (
    <div className="p-6 w-full font-sans">
      <h2 className="text-3xl font-bold text-mono-800 tracking-tight leading-snug mb-4">
        Quận Lï¿½ ï¿½on Hï¿½ng
      </h2>

      {/* Tab chuyện đổi */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setTab("orders")}
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
            tab === "orders"
              ? "text-mono-black border-mono-black"
              : "text-mono-500 border-transparent hover:text-mono-black"
          }`}
        >
          Danh sï¿½ch don hï¿½ng
        </button>
        <button
          onClick={() => setTab("cancel")}
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
            tab === "cancel"
              ? "text-mono-black border-mono-black"
              : "text-mono-500 border-transparent hover:text-mono-black"
          }`}
        >
          Yï¿½u c?u hủy don
        </button>
      </div>

      {/* Danh sï¿½ch don hï¿½ng */}
      {tab === "orders" && (
        <>
          <div className="mb-4 flex items-center gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Tï¿½m mï¿½ don hï¿½ng ho?c tï¿½n khï¿½ch hï¿½ng"
              className="px-4 py-2 w-1/3 border border-mono-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-mono-600"
            />
          </div>
          <div className="overflow-x-auto shadow rounded-lg">
            <table className="min-w-full bg-white rounded-md overflow-hidden border">
              <thead className="bg-mono-50 text-mono-700 text-sm font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4 text-left border-b">Mï¿½ don hï¿½ng</th>
                  <th className="py-3 px-4 text-left border-b">Khï¿½ch hï¿½ng</th>
                  <th className="py-3 px-4 text-left border-b">ï¿½?a chỉ</th>
                  <th className="py-3 px-4 text-left border-b">
                    Số điện thoại
                  </th>
                  <th className="py-3 px-4 text-left border-b">Giï¿½</th>
                  <th className="py-3 px-4 text-left border-b">
                    Thanh toï¿½n
                    <select
                      className=" py-1 px-1 border rounded-md"
                      onChange={(e) => handlePaymentFilter(e.target.value)}
                      value={paymentFilter}
                    >
                      <option value="">Tất cả</option>
                      <option value="ï¿½ï¿½ thanh toï¿½n">ï¿½ï¿½ thanh toï¿½n</option>
                      <option value="Chua thanh toï¿½n">Chua thanh toï¿½n</option>
                    </select>
                  </th>
                  <th className="py-3 px-4 text-left border-b">
                    Phuong thực thanh toï¿½n
                  </th>
                  <th className="py-3 px-4 text-left border-b">
                    Trống thï¿½i
                    <select
                      className=" py-1 px-1 border rounded-md"
                      onChange={(e) => handleStatusFilter(e.target.value)}
                      value={statusFilter}
                    >
                      <option value="">Tất cả</option>
                      <option value="ï¿½ang giao hï¿½ng">ï¿½ang giao hï¿½ng</option>
                      <option value="Giao hï¿½ng thï¿½nh cï¿½ng">
                        Giao hï¿½ng thï¿½nh cï¿½ng
                      </option>
                      <option value="ï¿½ï¿½ hủy">ï¿½ï¿½ hủy</option>
                      <option value="Chờ xï¿½c nhơn">Chờ xï¿½c nhơn</option>
                    </select>
                  </th>
                  <th className="py-3 px-4 text-center border-b">Thao tï¿½c</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4">
                      ï¿½ang tại...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4">
                      Khï¿½ng cï¿½ don hï¿½ng
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
                              <option value="">Chơn trống thï¿½i</option>
                              {order.orderStatusRaw === "pending" && (
                                <option value="confirmed">ï¿½ï¿½ xï¿½c nhơn</option>
                              )}
                              {order.orderStatusRaw === "confirmed" && (
                                <option value="shipping">ï¿½ang giao hï¿½ng</option>
                              )}
                              {order.orderStatusRaw === "shipping" && (
                                <option value="delivered">
                                  Giao hï¿½ng thï¿½nh cï¿½ng
                                </option>
                              )}
                            </select>
                          ) : (
                            <span className="py-1 px-2 text-xs text-mono-600">
                              Chờ xem
                            </span>
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

      {/* Danh sï¿½ch yï¿½u c?u hủy don */}
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
              title="ï¿½ï¿½ng"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-6 text-mono-700 text-center">
              Chi tiết don hï¿½ng
            </h3>
            <div className="grid grid-cols-1 gap-y-3">
              <div className="flex justify-between">
                <span className="font-semibold text-mono-600">
                  Mï¿½ don hï¿½ng:
                </span>
                <span className="text-mono-900">{selectedOrder.orderCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-mono-600">Khï¿½ch hï¿½ng:</span>
                <span className="text-mono-900">
                  {selectedOrder.customerName}
                </span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="font-semibold text-mono-600 min-w-max">
                  ï¿½?a ch?:
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
                <span className="font-semibold text-mono-600">Giï¿½:</span>
                <span className="text-mono-black font-bold">
                  {selectedOrder.price}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-mono-600">Thanh toï¿½n:</span>
                <span className="text-mono-900">
                  {selectedOrder.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-mono-600">
                  Phuong thực thanh toï¿½n:
                </span>
                <span className="text-mono-900">
                  {selectedOrder.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-mono-600">Trống thï¿½i:</span>
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
                ï¿½ï¿½ng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListOrderPage;


