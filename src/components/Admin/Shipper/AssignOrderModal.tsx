import { useState, useEffect, useCallback } from "react";
import { adminShipperService } from "../../../services/ShipperService";
import { adminOrderService } from "../../../services/OrderService";
import { toast } from "react-hot-toast";
import {
  FiX,
  FiPackage,
  FiUser,
  FiTruck,
  FiCheck,
  FiMapPin,
  FiPhone,
  FiSearch,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  preSelectedShipperId?: string;
  onAssignSuccess: () => void;
}

interface AssignableOrder {
  _id: string;
  code: string;
  customerName: string;
  address: string;
  phone: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
}

interface ShipperData {
  _id: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  isAvailable: boolean;
  activeOrders: number;
  maxOrders: number;
  deliveredCount: number;
}

const AssignOrderModal = ({
  isOpen,
  onClose,
  preSelectedShipperId,
  onAssignSuccess,
}: Props) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [selectedShipperId, setSelectedShipperId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingShippers, setLoadingShippers] = useState(true);
  const [assignableOrders, setAssignableOrders] = useState<AssignableOrder[]>(
    []
  );
  const [shippers, setShippers] = useState<ShipperData[]>([]);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [shipperSearchQuery, setShipperSearchQuery] = useState("");

  // Fetch confirmed orders
  const fetchConfirmedOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await adminOrderService.getAllOrders();
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const ordersData = (res.data as any).orders || [];
      const orders = ordersData
        .filter((o: any) => o.status === "confirmed")
        .map((o: any) => ({
          _id: o._id as string,
          code: (o.code || o._id) as string,
          customerName: o.user?.name || o.shippingAddress?.name || "N/A",
          address: [
            o.shippingAddress?.detail,
            o.shippingAddress?.ward,
            o.shippingAddress?.district,
            o.shippingAddress?.province,
          ]
            .filter(Boolean)
            .join(", "),
          phone: o.shippingAddress?.phone || "",
          totalAmount: o.totalAfterDiscountAndShipping || o.totalAmount || 0,
          paymentMethod: o.payment?.method || "",
          paymentStatus: o.payment?.paymentStatus || "",
        }));
      /* eslint-enable @typescript-eslint/no-explicit-any */
      setAssignableOrders(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Không thể tải danh sách đơn hàng");
      setAssignableOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  // Fetch available shippers
  const fetchShippers = useCallback(async () => {
    setLoadingShippers(true);
    try {
      const res = await adminShipperService.getShippers({ available: true });
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const data = res.data as any;
      const shipperList = data.data?.shippers || data.shippers || [];

      // Map BE data - shipper info is in nested `shipper` object
      const filteredShippers = shipperList
        .map((s: any) => {
          const shipperInfo = s.shipper || {};
          const isAvailable = shipperInfo.isAvailable === true;
          const activeOrders = shipperInfo.activeOrders || 0;
          const maxOrders = shipperInfo.maxOrders || 20;
          const deliveryStats = shipperInfo.deliveryStats || { successful: 0 };

          return {
            _id: s._id as string,
            name: (s.name as string) || "Không xác định",
            phone: (s.phone as string) || "",
            email: (s.email as string) || "",
            avatar: s.avatar?.url as string | undefined,
            isAvailable,
            activeOrders,
            maxOrders,
            deliveredCount: deliveryStats.successful || 0,
          };
        })
        .filter(
          (s: ShipperData) => s.isAvailable && s.activeOrders < s.maxOrders
        );
      /* eslint-enable @typescript-eslint/no-explicit-any */
      setShippers(filteredShippers);
    } catch (error) {
      console.error("Error fetching shippers:", error);
      toast.error("Không thể tải danh sách shipper");
      setShippers([]);
    } finally {
      setLoadingShippers(false);
    }
  }, []);

  // Fetch all data
  const fetchData = useCallback(async () => {
    await Promise.all([fetchConfirmedOrders(), fetchShippers()]);
  }, [fetchConfirmedOrders, fetchShippers]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedOrderId("");
      setSelectedShipperId(preSelectedShipperId || "");
      setOrderSearchQuery("");
      setShipperSearchQuery("");
      fetchData();
    }
  }, [isOpen, preSelectedShipperId, fetchData]);

  // Filter orders by search
  const filteredOrders = assignableOrders.filter((order) => {
    if (!orderSearchQuery) return true;
    const query = orderSearchQuery.toLowerCase();
    return (
      order.code.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.phone.includes(query)
    );
  });

  // Filter shippers by search
  const filteredShippers = shippers.filter((shipper) => {
    if (!shipperSearchQuery) return true;
    const query = shipperSearchQuery.toLowerCase();
    return (
      shipper.name.toLowerCase().includes(query) ||
      shipper.phone.includes(query)
    );
  });

  const selectedOrder = assignableOrders.find((o) => o._id === selectedOrderId);
  const selectedShipper = shippers.find((s) => s._id === selectedShipperId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOrderId) {
      toast.error("Vui lòng chọn đơn hàng");
      return;
    }

    if (!selectedShipperId) {
      toast.error("Vui lòng chọn shipper");
      return;
    }

    try {
      setLoading(true);
      await adminShipperService.assignOrderToShipper(selectedOrderId, {
        shipperId: selectedShipperId,
      });
      toast.success("Gán đơn hàng cho shipper thành công!");
      onAssignSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi gán đơn hàng"
      );
    } finally {
      setLoading(false);
    }
  };

  const getCapacityPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 80) return "bg-rose-500";
    if (percentage >= 50) return "bg-amber-500";
    return "bg-emerald-500";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-mono-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <FiTruck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                Gán đơn hàng cho Shipper
              </h2>
              <p className="text-white/60 text-sm">
                Chọn đơn hàng đã xác nhận và shipper để gán
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <FiX size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col h-[calc(90vh-80px)]"
        >
          <div className="flex-1 overflow-hidden flex">
            {/* Left: Order Selection */}
            <div className="flex-1 border-r border-mono-200 flex flex-col min-w-0">
              <div className="p-4 border-b border-mono-200 bg-mono-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FiPackage className="text-mono-600" size={18} />
                    <h3 className="font-semibold text-mono-800">
                      Chọn đơn hàng
                    </h3>
                  </div>
                  <span className="text-xs bg-mono-200 text-mono-700 px-2 py-1 rounded-full">
                    {assignableOrders.length} đơn chờ gán
                  </span>
                </div>
                <div className="relative">
                  <FiSearch
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Tìm mã đơn, tên KH, SĐT..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-mono-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mono-300"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {loadingOrders ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FiRefreshCw
                      className="animate-spin text-mono-400 mb-3"
                      size={24}
                    />
                    <span className="text-mono-500 text-sm">
                      Đang tải đơn hàng...
                    </span>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <FiPackage
                      className="mx-auto text-mono-300 mb-3"
                      size={40}
                    />
                    <p className="text-mono-600 font-medium">
                      Không có đơn hàng
                    </p>
                    <p className="text-mono-400 text-sm mt-1">
                      {orderSearchQuery
                        ? "Thử thay đổi từ khóa tìm kiếm"
                        : "Không có đơn hàng nào cần gán shipper"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredOrders.map((order) => (
                      <label
                        key={order._id}
                        className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedOrderId === order._id
                            ? "border-mono-900 bg-mono-50 shadow-md"
                            : "border-mono-200 hover:border-mono-300 hover:bg-mono-50/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="order"
                          value={order._id}
                          checked={selectedOrderId === order._id}
                          onChange={(e) => setSelectedOrderId(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono font-bold text-mono-900">
                                #{order.code.slice(-8).toUpperCase()}
                              </span>
                              {selectedOrderId === order._id && (
                                <span className="bg-mono-900 text-white rounded-full p-0.5">
                                  <FiCheck size={12} />
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-mono-700 font-medium mb-1.5">
                              {order.customerName}
                            </div>
                            <div className="flex items-start gap-1.5 text-xs text-mono-500">
                              <FiMapPin
                                size={12}
                                className="mt-0.5 flex-shrink-0"
                              />
                              <span className="line-clamp-2">
                                {order.address}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-mono-500 mt-1">
                              <FiPhone size={12} />
                              <span>{order.phone}</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-bold text-mono-900 text-sm">
                              {order.totalAmount.toLocaleString("vi-VN")}₫
                            </div>
                            <div
                              className={`text-xs mt-1.5 px-2 py-0.5 rounded-full inline-block ${
                                order.paymentStatus === "paid"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {order.paymentStatus === "paid"
                                ? "Đã thanh toán"
                                : "COD"}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Shipper Selection */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="p-4 border-b border-mono-200 bg-mono-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FiUser className="text-mono-600" size={18} />
                    <h3 className="font-semibold text-mono-800">
                      Chọn Shipper
                    </h3>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                    {shippers.length} khả dụng
                  </span>
                </div>
                <div className="relative">
                  <FiSearch
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Tìm tên, SĐT shipper..."
                    value={shipperSearchQuery}
                    onChange={(e) => setShipperSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-mono-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mono-300"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {loadingShippers ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FiRefreshCw
                      className="animate-spin text-mono-400 mb-3"
                      size={24}
                    />
                    <span className="text-mono-500 text-sm">
                      Đang tải shipper...
                    </span>
                  </div>
                ) : filteredShippers.length === 0 ? (
                  <div className="text-center py-12">
                    <FiAlertCircle
                      className="mx-auto text-mono-300 mb-3"
                      size={40}
                    />
                    <p className="text-mono-600 font-medium">
                      Không có shipper khả dụng
                    </p>
                    <p className="text-mono-400 text-sm mt-1">
                      {shipperSearchQuery
                        ? "Thử thay đổi từ khóa tìm kiếm"
                        : "Tất cả shipper đang bận hoặc đã đạt giới hạn"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredShippers.map((shipper) => {
                      const capacityPct = getCapacityPercentage(
                        shipper.activeOrders,
                        shipper.maxOrders
                      );
                      return (
                        <label
                          key={shipper._id}
                          className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            selectedShipperId === shipper._id
                              ? "border-mono-900 bg-mono-50 shadow-md"
                              : "border-mono-200 hover:border-mono-300 hover:bg-mono-50/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="shipper"
                            value={shipper._id}
                            checked={selectedShipperId === shipper._id}
                            onChange={(e) =>
                              setSelectedShipperId(e.target.value)
                            }
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="w-12 h-12 bg-mono-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                              {shipper.avatar ? (
                                <img
                                  src={shipper.avatar}
                                  alt={shipper.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FiUser size={20} className="text-mono-500" />
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-semibold text-mono-900 truncate">
                                  {shipper.name}
                                </span>
                                {selectedShipperId === shipper._id && (
                                  <span className="bg-mono-900 text-white rounded-full p-0.5">
                                    <FiCheck size={12} />
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-mono-500 mb-2">
                                {shipper.phone}
                              </div>

                              {/* Capacity bar */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-mono-500 whitespace-nowrap">
                                  {shipper.activeOrders}/{shipper.maxOrders} đơn
                                </span>
                                <div className="flex-1 bg-mono-200 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full transition-all ${getCapacityColor(
                                      capacityPct
                                    )}`}
                                    style={{ width: `${capacityPct}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="text-right flex-shrink-0">
                              <div className="text-xs text-mono-500">
                                <span className="text-emerald-600 font-medium">
                                  {shipper.deliveredCount}
                                </span>{" "}
                                đã giao
                              </div>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary & Actions */}
          <div className="border-t border-mono-200 bg-mono-50 p-4">
            {/* Selection Summary */}
            {(selectedOrder || selectedShipper) && (
              <div className="bg-white rounded-xl p-4 mb-4 border border-mono-200">
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <FiPackage className="text-mono-400" size={16} />
                    <span className="text-mono-500">Đơn hàng:</span>
                    {selectedOrder ? (
                      <span className="font-bold text-mono-900 bg-mono-100 px-2 py-0.5 rounded">
                        #{selectedOrder.code.slice(-8).toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-mono-400 italic">Chưa chọn</span>
                    )}
                  </div>
                  <span className="text-mono-300 text-lg">→</span>
                  <div className="flex items-center gap-2">
                    <FiTruck className="text-mono-400" size={16} />
                    <span className="text-mono-500">Shipper:</span>
                    {selectedShipper ? (
                      <span className="font-bold text-mono-900 bg-mono-100 px-2 py-0.5 rounded">
                        {selectedShipper.name}
                      </span>
                    ) : (
                      <span className="text-mono-400 italic">Chưa chọn</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-white hover:bg-mono-100 text-mono-700 border border-mono-200 rounded-xl font-medium transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading || !selectedOrderId || !selectedShipperId}
                className="flex-1 py-3 px-4 bg-mono-900 hover:bg-mono-800 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FiRefreshCw className="animate-spin" size={18} />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <FiCheck size={18} />
                    Xác nhận gán đơn
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignOrderModal;
