import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { userOrderService } from "../../services/OrderService";
import { profileService } from "../../services/ProfileService";
import { cartService } from "../../services/CartService";
import type { UserAddress } from "../../types/user";
import type { CartItem } from "../../types/cart";
import {
  FaPlus,
  FaMapMarkerAlt,
  FaCreditCard,
  FaStickyNote,
  FaPercent,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";

// Alias for better semantics
type Address = UserAddress;

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

  // L?y giỏ hàng và preview don hàng
  useEffect(() => {
    const fetchCartAndPreview = async () => {
      try {
        setCartLoading(true);

        // L?y giỏ hàng
        const cartRes = await cartService.getCart();
        const cart = cartRes.data.cart;

        if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
          toast.error("Giỏ hàng trống, vui lòng thêm sản phẩm");
          navigate("/cart");
          return;
        }

        // Lọc các sản phẩm dã chơn và có sẩn
        const selected = cart.cartItems.filter(
          (item: CartItem) => item.isSelected && item.isAvailable
        );

        if (selected.length === 0) {
          toast.error("Vui lòng chơn ít nh?t m?t sản phẩm d? thanh toán");
          navigate("/cart");
          return;
        }

        setSelectedItems(selected);

        // Preview don hàng KHÔNG có mã giảm giá ban đầu
        const previewRes = await cartService.previewBeforeOrder({});

        if (previewRes.data.success && previewRes.data.preview) {
          setPreviewData(previewRes.data.preview);
        }
      } catch (error: any) {
        console.error("Lỗi khi tại giỏ hàng:", error);
        toast.error("Không thể tại thông tin giỏ hàng");
        navigate("/cart");
      } finally {
        setCartLoading(false);
      }
    };

    fetchCartAndPreview();
  }, [navigate]); // Lo?i bỏ couponCode kh?i dependency array

  // L?y danh sách địa chỉ từ API user
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await profileService.getProfile();
        const userAddresses = res.data.data.addresses || [];
        setAddresses(userAddresses);

        // Chơn địa chỉ m?c đếnh ho?c địa chỉ đầu tiên
        const defaultAddr = userAddresses.find((a: Address) => a.isDefault);
        setAddressId(defaultAddr?._id || userAddresses[0]?._id || "");
      } catch (error) {
        console.error("Lỗi khi tại địa ch?:", error);
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
      const previewRes = await cartService.previewBeforeOrder({
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
      toast.error("Vui lòng chơn địa chỉ giao hàng");
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
        // N?u chơn VNPAY và có paymentUrl thì chuyện huẩng
        if (paymentMethod === "VNPAY" && res.data.data?.paymentUrl) {
          window.location.href = res.data.data.paymentUrl;
          return;
        }

        toast.success("Ð?t hàng thành công!");
        navigate("/user-manage-order");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Ð?t hàng thểt b?i! Vui lòng thọ lỗi.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <FaSpinner className="animate-spin text-4xl text-mono-500 mx-auto mb-4" />
          <p className="text-mono-600">Ðang tại thông tin don hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-mono-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-mono-900 text-white p-6">
          <h1 className="text-2xl font-bold">Xác nhận don hàng</h1>
          <p className="text-mono-100 mt-1">
            Vui lòng ki?m tra thông tin trước khi đặt hàng
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* C?t trái - Thông tin don hàng */}
          <div className="lg:col-span-2 space-y-6">
            {/* Danh sách sản phẩm */}
            <div className="bg-mono-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <FaCreditCard className="mr-2 text-mono-black" />
                Sản phẩm dã chơn ({selectedItems.length} sản phẩm)
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
                      <div className="flex items-center space-x-4 text-xs text-mono-600 mt-1">
                        <span>Màu: {item.variant.color.name}</span>
                        <span>Size: {item.size.value}</span>
                        <span>SL: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-mono-black">
                        {(item.price * item.quantity).toLocaleString()}d
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ð?a chờ giao hàng */}
            <div className="bg-mono-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-mono-900" />
                Ð?a chờ giao hàng
              </h3>
              {addresses.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-mono-300 rounded-lg">
                  <FaExclamationTriangle className="text-mono-600 text-3xl mx-auto mb-2" />
                  <p className="text-mono-600 mb-3">
                    Bẩn chua có địa chỉ giao hàng
                  </p>
                  <Link
                    to="/user-information"
                    className="inline-flex items-center px-4 py-2 bg-mono-black text-white rounded-lg hover:bg-mono-800 transition-colors"
                  >
                    <FaPlus className="mr-2" />
                    Thêm địa chỉ
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <select
                    className="w-full border border-mono-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-mono-500 focus:border-transparent"
                    value={addressId}
                    onChange={(e) => setAddressId(e.target.value)}
                  >
                    <option value="">Chơn địa chỉ giao hàng</option>
                    {addresses.map((addr) => (
                      <option key={addr._id} value={addr._id}>
                        {addr.name} - {addr.phone} | {addr.detail}, {addr.ward},{" "}
                        {addr.district}, {addr.province}
                        {addr.isDefault ? " [M?c đếnh]" : ""}
                      </option>
                    ))}
                  </select>
                  <Link
                    to="/user-information"
                    className="inline-flex items-center text-mono-black hover:text-mono-800 text-sm"
                  >
                    <FaPlus className="mr-1" />
                    Thêm địa chỉ mới
                  </Link>
                </div>
              )}
            </div>

            {/* Phuong thực thanh toán */}
            <div className="bg-mono-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <FaCreditCard className="mr-2 text-mono-800" />
                Phuong thực thanh toán
              </h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="text-mono-black focus:ring-mono-500"
                  />
                  <span>Thanh toán khi nhơn hàng (COD)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="VNPAY"
                    checked={paymentMethod === "VNPAY"}
                    onChange={() => setPaymentMethod("VNPAY")}
                    className="text-mono-black focus:ring-mono-500"
                  />
                  <span>Thanh toán online (VNPAY)</span>
                </label>
              </div>
            </div>

            {/* Ghi chú */}
            <div className="bg-mono-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <FaStickyNote className="mr-2 text-mono-700" />
                Ghi chú don hàng
              </h3>
              <textarea
                className="w-full border border-mono-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-mono-500 focus:border-transparent"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú cho don hàng (không bắt buộc)..."
              />
            </div>
          </div>

          {/* C?t ph?i - Tóm t?t don hàng */}
          <div className="lg:col-span-1">
            <div className="bg-mono-50 rounded-lg p-4 sticky top-6">
              <h3 className="font-semibold text-lg mb-4">Tóm t?t don hàng</h3>

              {/* Mã giảm giá */}
              <div className="mb-4 p-3 border border-mono-200 rounded-lg bg-white">
                <h4 className="font-medium mb-2 flex items-center">
                  <FaPercent className="mr-2 text-mono-700" />
                  Mã giảm giá
                </h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 border border-mono-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-mono-500 focus:border-transparent"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Nhập mã giảm giá"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-mono-700 text-white rounded hover:bg-mono-800 transition-colors text-sm"
                  >
                    Áp dụng
                  </button>
                </div>
                {previewData?.couponApplied && previewData?.couponDetail && (
                  <div className="mt-2 p-2 bg-mono-50 border border-mono-200 rounded text-sm text-mono-700">
                    Ðã áp dụng mã:{" "}
                    <strong>{previewData.couponDetail.code}</strong>
                  </div>
                )}
              </div>

              {/* Chi tiết giá */}
              {previewData && (
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span>Tạm tính ({previewData.items} sản phẩm):</span>
                    <span>{previewData.subTotal.toLocaleString()}d</span>
                  </div>
                  {previewData.discount > 0 && (
                    <div className="flex justify-between text-sm text-mono-800">
                      <span>Giảm giá:</span>
                      <span>-{previewData.discount.toLocaleString()}d</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Phí vẩn chuyện:</span>
                    <span>
                      {previewData.shippingFee > 0
                        ? `${previewData.shippingFee.toLocaleString()}d`
                        : "Miẩn phí"}
                    </span>
                  </div>
                  <hr className="border-mono-300" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Tổng cẩng:</span>
                    <span className="text-mono-900">
                      {previewData.totalPrice.toLocaleString()}d
                    </span>
                  </div>
                </div>
              )}

              {/* Nút đặt hàng */}
              <button
                onClick={handleOrder}
                disabled={loading || !addressId || selectedItems.length === 0}
                className="w-full bg-mono-900 text-white font-bold py-3 rounded-lg text-lg hover:bg-mono-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Ðang xử lý...
                  </>
                ) : (
                  "XÁC NH?N Ð?T HÀNG"
                )}
              </button>

              {paymentMethod === "VNPAY" && (
                <p className="text-xs text-mono-600 mt-2 text-center">
                  Bẩn số được chuyện đến trang thanh toán VNPAY
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






