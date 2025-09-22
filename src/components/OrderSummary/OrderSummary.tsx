import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { userOrderService } from "../../services/OrderService";
import { inforApi } from "../../services/InforService";
import { cartApi } from "../../services/CartService";
import {
  FaPlus,
  FaMapMarkerAlt,
  FaCreditCard,
  FaStickyNote,
  FaPercent,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";

interface Address {
  _id: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
  isDefault: boolean;
}

interface CartItem {
  _id: string;
  variant: {
    _id: string;
    color: {
      name: string;
      code: string;
    };
    price: number;
    priceFinal: number;
    product?: {
      _id: string;
      name?: string;
    };
  };
  size: {
    _id: string;
    value: string | number;
  };
  quantity: number;
  price: number;
  productName: string;
  image: string;
  isSelected: boolean;
  isAvailable: boolean;
}

interface PreviewData {
  items: number;
  itemsDetail: Array<{
    productName: string;
    color: { name: string; code: string };
    sizeValue: string | number;
    price: number;
    quantity: number;
    image: string;
    totalPrice: number;
  }>;
  totalQuantity: number;
  subTotal: number;
  discount: number;
  shippingFee: number;
  totalPrice: number;
  couponApplied: boolean;
  couponDetail?: {
    code: string;
    type: "percent" | "fixed";
    value: number;
    maxDiscount?: number;
  };
}

const OrderSummary: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "VNPAY">("COD");
  const [note, setNote] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(true);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();

  // Lấy giỏ hàng và preview đơn hàng
  useEffect(() => {
    const fetchCartAndPreview = async () => {
      try {
        setCartLoading(true);

        // Lấy giỏ hàng
        const cartRes = await cartApi.getCart();
        const cart = cartRes.data.cart;

        if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
          toast.error("Giỏ hàng trống, vui lòng thêm sản phẩm");
          navigate("/cart");
          return;
        }

        // Lọc các sản phẩm đã chọn và có sẵn
        const selected = cart.cartItems.filter(
          (item: CartItem) => item.isSelected && item.isAvailable
        );

        if (selected.length === 0) {
          toast.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
          navigate("/cart");
          return;
        }

        setSelectedItems(selected);

        // Preview đơn hàng KHÔNG có mã giảm giá ban đầu
        const previewRes = await cartApi.previewBeforeOrder({});

        if (previewRes.data.success && previewRes.data.preview) {
          setPreviewData(previewRes.data.preview);
        }
      } catch (error: any) {
        console.error("Lỗi khi tải giỏ hàng:", error);
        toast.error("Không thể tải thông tin giỏ hàng");
        navigate("/cart");
      } finally {
        setCartLoading(false);
      }
    };

    fetchCartAndPreview();
  }, [navigate]); // Loại bỏ couponCode khỏi dependency array

  // Lấy danh sách địa chỉ từ API user
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await inforApi.getProfile();
        const userAddresses = res.data.user.addresses || [];
        setAddresses(userAddresses);

        // Chọn địa chỉ mặc định hoặc địa chỉ đầu tiên
        const defaultAddr = userAddresses.find((a: Address) => a.isDefault);
        setAddressId(defaultAddr?._id || userAddresses[0]?._id || "");
      } catch (error) {
        console.error("Lỗi khi tải địa chỉ:", error);
        setAddresses([]);
      }
    };
    fetchAddresses();
  }, []);

  // Áp dụng mã giảm giá
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    try {
      const previewRes = await cartApi.previewBeforeOrder({
        couponCode: couponCode.trim(),
      });

      if (previewRes.data.success && previewRes.data.preview) {
        setPreviewData(previewRes.data.preview);
        if (previewRes.data.preview.couponApplied) {
          toast.success("Áp dụng mã giảm giá thành công!");
        } else {
          toast.error(previewRes.data.message || "Mã giảm giá không hợp lệ");
        }
      } else {
        toast.error(previewRes.data.message || "Mã giảm giá không hợp lệ");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Lỗi khi áp dụng mã giảm giá"
      );
    }
  };

  const handleOrder = async () => {
    if (!addressId) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        addressId,
        paymentMethod,
        note: note.trim(),
        couponCode: couponCode.trim() || undefined,
      };

      const res = await userOrderService.createOrder(orderData);

      if (res.data.success) {
        // Nếu chọn VNPAY và có paymentUrl thì chuyển hướng
        if (paymentMethod === "VNPAY" && res.data.data?.paymentUrl) {
          window.location.href = res.data.data.paymentUrl;
          return;
        }

        toast.success("Đặt hàng thành công!");
        navigate("/user-manage-order");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Đặt hàng thất bại! Vui lòng thử lại.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <h1 className="text-2xl font-bold">Xác nhận đơn hàng</h1>
          <p className="text-blue-100 mt-1">
            Vui lòng kiểm tra thông tin trước khi đặt hàng
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Cột trái - Thông tin đơn hàng */}
          <div className="lg:col-span-2 space-y-6">
            {/* Danh sách sản phẩm */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <FaCreditCard className="mr-2 text-blue-600" />
                Sản phẩm đã chọn ({selectedItems.length} sản phẩm)
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center space-x-3 bg-white p-3 rounded border"
                  >
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {item.productName}
                      </h4>
                      <div className="flex items-center space-x-4 text-xs text-gray-600 mt-1">
                        <span>Màu: {item.variant.color.name}</span>
                        <span>Size: {item.size.value}</span>
                        <span>SL: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">
                        {(item.price * item.quantity).toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Địa chỉ giao hàng */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-red-600" />
                Địa chỉ giao hàng
              </h3>
              {addresses.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <FaExclamationTriangle className="text-yellow-500 text-3xl mx-auto mb-2" />
                  <p className="text-gray-600 mb-3">
                    Bạn chưa có địa chỉ giao hàng
                  </p>
                  <Link
                    to="/user-information"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaPlus className="mr-2" />
                    Thêm địa chỉ
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={addressId}
                    onChange={(e) => setAddressId(e.target.value)}
                  >
                    <option value="">Chọn địa chỉ giao hàng</option>
                    {addresses.map((addr) => (
                      <option key={addr._id} value={addr._id}>
                        {addr.fullName} - {addr.phone} | {addr.addressDetail},{" "}
                        {addr.ward}, {addr.district}, {addr.province}
                        {addr.isDefault ? " [Mặc định]" : ""}
                      </option>
                    ))}
                  </select>
                  <Link
                    to="/user-information"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <FaPlus className="mr-1" />
                    Thêm địa chỉ mới
                  </Link>
                </div>
              )}
            </div>

            {/* Phương thức thanh toán */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <FaCreditCard className="mr-2 text-green-600" />
                Phương thức thanh toán
              </h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="VNPAY"
                    checked={paymentMethod === "VNPAY"}
                    onChange={() => setPaymentMethod("VNPAY")}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Thanh toán online (VNPAY)</span>
                </label>
              </div>
            </div>

            {/* Ghi chú */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <FaStickyNote className="mr-2 text-yellow-600" />
                Ghi chú đơn hàng
              </h3>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú cho đơn hàng (không bắt buộc)..."
              />
            </div>
          </div>

          {/* Cột phải - Tóm tắt đơn hàng */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-4 sticky top-6">
              <h3 className="font-semibold text-lg mb-4">Tóm tắt đơn hàng</h3>

              {/* Mã giảm giá */}
              <div className="mb-4 p-3 border border-gray-200 rounded-lg bg-white">
                <h4 className="font-medium mb-2 flex items-center">
                  <FaPercent className="mr-2 text-orange-600" />
                  Mã giảm giá
                </h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Nhập mã giảm giá"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm"
                  >
                    Áp dụng
                  </button>
                </div>
                {previewData?.couponApplied && previewData?.couponDetail && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                    Đã áp dụng mã:{" "}
                    <strong>{previewData.couponDetail.code}</strong>
                  </div>
                )}
              </div>

              {/* Chi tiết giá */}
              {previewData && (
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span>Tạm tính ({previewData.items} sản phẩm):</span>
                    <span>{previewData.subTotal.toLocaleString()}đ</span>
                  </div>
                  {previewData.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá:</span>
                      <span>-{previewData.discount.toLocaleString()}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Phí vận chuyển:</span>
                    <span>
                      {previewData.shippingFee > 0
                        ? `${previewData.shippingFee.toLocaleString()}đ`
                        : "Miễn phí"}
                    </span>
                  </div>
                  <hr className="border-gray-300" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Tổng cộng:</span>
                    <span className="text-red-600">
                      {previewData.totalPrice.toLocaleString()}đ
                    </span>
                  </div>
                </div>
              )}

              {/* Nút đặt hàng */}
              <button
                onClick={handleOrder}
                disabled={loading || !addressId || selectedItems.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-lg text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Đang xử lý...
                  </>
                ) : (
                  "XÁC NHẬN ĐẶT HÀNG"
                )}
              </button>

              {paymentMethod === "VNPAY" && (
                <p className="text-xs text-gray-600 mt-2 text-center">
                  Bạn sẽ được chuyển đến trang thanh toán VNPAY
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
