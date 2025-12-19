import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { userOrderService } from "../../services/OrderService";
import { profileService } from "../../services/ProfileService";
import { cartService } from "../../services/CartService";
import { userCouponService } from "../../services/CouponService";
import type { UserAddress } from "../../types/user";
import type { CartItem } from "../../types/cart";
import type { Coupon } from "../../types/coupon";
import {
  FaPlus,
  FaMapMarkerAlt,
  FaCreditCard,
  FaStickyNote,
  FaPercent,
  FaSpinner,
  FaExclamationTriangle,
  FaTimes,
  FaGift,
  FaTrash,
  FaCheck,
  FaCopy,
  FaChevronRight,
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

  // Coupon modal state
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [collectedCoupons, setCollectedCoupons] = useState<Coupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<
    PreviewData["couponDetail"] | null
  >(null);

  // Fetch collected coupons
  const fetchCoupons = useCallback(async () => {
    setCouponsLoading(true);
    try {
      const collectedRes = await userCouponService.getCollectedCoupons({
        status: "active",
      });
      if (collectedRes.data.success) {
        setCollectedCoupons(collectedRes.data.coupons || []);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setCouponsLoading(false);
    }
  }, []);

  // Select coupon from modal
  const selectCoupon = useCallback(async (coupon: Coupon) => {
    setShowCouponModal(false);

    try {
      const response = await cartService.previewBeforeOrder({
        couponCode: coupon.code,
      });

      if (response.data.success) {
        if (response.data.preview?.couponApplied) {
          setPreviewData(response.data.preview);
          setAppliedCoupon(response.data.preview.couponDetail);
          setCouponCode(coupon.code);
          localStorage.setItem("appliedCouponCode", coupon.code);
          toast.success("Đã áp dụng mã giảm giá thành công");
        } else {
          toast.error(
            response.data.message ||
              "Mã giảm giá không đủ điều kiện áp dụng cho các sản phẩm đã chọn"
          );
        }
      } else {
        toast.error(response.data.message || "Mã giảm giá không hợp lệ");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "Mã giảm giá không đủ điều kiện áp dụng"
      );
    }
  }, []);

  // Remove coupon
  const removeCoupon = useCallback(async () => {
    setCouponCode("");
    setAppliedCoupon(null);
    localStorage.removeItem("appliedCouponCode");

    // Re-preview without coupon
    try {
      const previewRes = await cartService.previewBeforeOrder({});
      if (previewRes.data.success && previewRes.data.preview) {
        setPreviewData(previewRes.data.preview);
      }
    } catch (error) {
      console.error("Error re-preview:", error);
    }

    toast.success("Đã hủy mã giảm giá");
  }, []);

  // Lấy giỏ hàng và preview đơn hàng
  useEffect(() => {
    const fetchCartAndPreview = async () => {
      try {
        setCartLoading(true);

        // Lấy giỏ hàng
        const cartRes = await cartService.getCart();
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

        // Kiểm tra xem có mã giảm giá đã áp dụng từ cart không
        const savedCouponCode = localStorage.getItem("appliedCouponCode");

        if (savedCouponCode) {
          // Preview với coupon đã lưu
          try {
            const previewRes = await cartService.previewBeforeOrder({
              couponCode: savedCouponCode,
            });

            if (previewRes.data.success && previewRes.data.preview) {
              setPreviewData(previewRes.data.preview);
              if (previewRes.data.preview.couponApplied) {
                setAppliedCoupon(previewRes.data.preview.couponDetail);
                setCouponCode(savedCouponCode);
              } else {
                // Mã không còn hợp lệ, xóa và preview lại không có coupon
                localStorage.removeItem("appliedCouponCode");
                const rePreviewRes = await cartService.previewBeforeOrder({});
                if (rePreviewRes.data.success && rePreviewRes.data.preview) {
                  setPreviewData(rePreviewRes.data.preview);
                }
              }
            }
          } catch {
            // Nếu lỗi, preview không có coupon
            localStorage.removeItem("appliedCouponCode");
            const previewRes = await cartService.previewBeforeOrder({});
            if (previewRes.data.success && previewRes.data.preview) {
              setPreviewData(previewRes.data.preview);
            }
          }
        } else {
          // Preview đơn hàng KHÔNG có mã giảm giá
          const previewRes = await cartService.previewBeforeOrder({});
          if (previewRes.data.success && previewRes.data.preview) {
            setPreviewData(previewRes.data.preview);
          }
        }
      } catch (error: unknown) {
        console.error("Lỗi khi tải giỏ hàng:", error);
        toast.error("Không thể tải thông tin giỏ hàng");
        navigate("/cart");
      } finally {
        setCartLoading(false);
      }
    };

    fetchCartAndPreview();
  }, [navigate]); // Lo?i bỏ couponCode kh?i dependency array

  // Lấy danh sách địa chỉ từ API user
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await profileService.getProfile();
        const userAddresses = res.data.data.addresses || [];
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

  // Áp dụng mã giảm giá (nhập tay)
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
          setAppliedCoupon(previewRes.data.preview.couponDetail);
          localStorage.setItem("appliedCouponCode", couponCode.trim());
          toast.success("Áp dụng mã giảm giá thành công!");
        } else {
          toast.error(
            previewRes.data.message ||
              "Mã giảm giá không đủ điều kiện áp dụng cho các sản phẩm đã chọn"
          );
        }
      } else {
        toast.error(previewRes.data.message || "Mã giảm giá không hợp lệ");
      }
    } catch (error: unknown) {
      const errMsg = error as { response?: { data?: { message?: string } } };
      toast.error(
        errMsg?.response?.data?.message ||
          "Mã giảm giá không đủ điều kiện áp dụng"
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
        // Xóa coupon đã lưu sau khi đặt hàng thành công
        localStorage.removeItem("appliedCouponCode");

        // Nếu chọn VNPAY và có paymentUrl thì chuyển hướng
        if (paymentMethod === "VNPAY" && res.data.data?.paymentUrl) {
          window.location.href = res.data.data.paymentUrl;
          return;
        }

        toast.success("Đặt hàng thành công!");
        navigate("/user-manage-order");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage =
        err?.response?.data?.message || "Đặt hàng thất bại! Vui lòng thử lại.";
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
          <p className="text-mono-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-mono-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-white text-black p-6 border border-mono-300 rounded-lg">
          <h1 className="text-2xl font-bold">Xác nhận đơn hàng</h1>
          <p className="text-mono-700 mt-1">
            Vui lòng kiểm tra thông tin trước khi đặt hàng
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Cột trái - Thông tin đơn hàng */}
          <div className="lg:col-span-2 space-y-6">
            {/* Danh sách sản phẩm */}
            <div className="bg-mono-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <FaCreditCard className="mr-2 text-mono-black" />
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
                      <div className="flex items-center space-x-4 text-xs text-mono-600 mt-1">
                        <span>Màu: {item.variant.color.name}</span>
                        <span>Size: {item.size.value}</span>
                        <span>SL: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-mono-black">
                        {(item.price * item.quantity).toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Địa chỉ giao hàng */}
            <div className="bg-mono-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-mono-900" />
                Địa chỉ giao hàng
              </h3>
              {addresses.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-mono-300 rounded-lg">
                  <FaExclamationTriangle className="text-mono-600 text-3xl mx-auto mb-2" />
                  <p className="text-mono-600 mb-3">
                    Bạn chưa có địa chỉ giao hàng
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
                    <option value="">Chọn địa chỉ giao hàng</option>
                    {addresses.map((addr) => (
                      <option key={addr._id} value={addr._id}>
                        {addr.name} - {addr.phone} | {addr.detail}, {addr.ward},{" "}
                        {addr.district}, {addr.province}
                        {addr.isDefault ? " [Mặc định]" : ""}
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
                Ghi chú đơn hàng
              </h3>
              <textarea
                className="w-full border border-mono-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-mono-500 focus:border-transparent"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú cho đơn hàng (không bắt buộc)..."
              />
            </div>
          </div>

          {/* Cột phải - Tóm tắt đơn hàng */}
          <div className="lg:col-span-1">
            <div className="bg-mono-50 rounded-lg p-4 sticky top-6">
              <h3 className="font-semibold text-lg mb-4">Tóm tắt đơn hàng</h3>

              {/* Mã giảm giá */}
              <div className="mb-4 p-3 border border-mono-200 rounded-lg bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center">
                    <FaPercent className="mr-2 text-mono-700" />
                    Mã giảm giá
                  </h4>
                  <button
                    onClick={() => {
                      setShowCouponModal(true);
                      fetchCoupons();
                    }}
                    className="text-sm text-mono-700 hover:text-mono-900 flex items-center space-x-1"
                  >
                    <FaGift className="w-3 h-3" />
                    <span>Chọn mã</span>
                    <FaChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-mono-50 border border-mono-200 rounded-lg">
                    <div>
                      <div className="font-medium text-mono-800">
                        {appliedCoupon.code}
                      </div>
                      <div className="text-sm text-mono-600">
                        Giảm{" "}
                        {appliedCoupon.type === "percent"
                          ? `${appliedCoupon.value}%`
                          : `${appliedCoupon.value.toLocaleString()}đ`}
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-mono-900 hover:text-mono-800 p-1"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
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
                        ? `${previewData.shippingFee.toLocaleString()}đ`
                        : "Miễn phí"}
                    </span>
                  </div>
                  <hr className="border-mono-300" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Tổng cộng:</span>
                    <span className="text-mono-900">
                      {previewData.totalPrice.toLocaleString()}đ
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
                    Đang xử lý...
                  </>
                ) : (
                  "XÁC NHẬN ĐẶT HÀNG"
                )}
              </button>

              {paymentMethod === "VNPAY" && (
                <p className="text-xs text-mono-600 mt-2 text-center">
                  Bạn sẽ được chuyển đến trang thanh toán VNPAY
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Coupon Selection Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-mono-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-mono-900">
                Chọn mã giảm giá
              </h3>
              <button
                onClick={() => setShowCouponModal(false)}
                className="p-2 hover:bg-mono-100 rounded-full transition-colors"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            {/* Info */}
            <div className="px-4 py-2 bg-mono-50 text-sm text-mono-600">
              Chọn mã giảm giá đã thu thập để áp dụng
            </div>

            {/* Coupon List */}
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              {couponsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <FaSpinner className="animate-spin text-2xl text-mono-500" />
                </div>
              ) : collectedCoupons.length === 0 ? (
                <div className="text-center py-8 text-mono-500">
                  <FaGift className="mx-auto text-4xl mb-2" />
                  <p>Chưa có mã giảm giá nào</p>
                  <button
                    onClick={() => {
                      setShowCouponModal(false);
                      navigate("/coupons");
                    }}
                    className="mt-2 text-mono-900 underline hover:no-underline"
                  >
                    Thu thập ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {collectedCoupons.map((coupon) => {
                    const isExpired = new Date(coupon.endDate) < new Date();
                    const meetsMinOrder =
                      (previewData?.subTotal || 0) >= coupon.minOrderValue;
                    const canApply = !isExpired && meetsMinOrder;

                    return (
                      <OrderCouponCard
                        key={coupon._id}
                        coupon={coupon}
                        isApplied={appliedCoupon?.code === coupon.code}
                        disabled={!canApply}
                        disabledReason={
                          isExpired
                            ? "Mã đã hết hạn"
                            : !meetsMinOrder
                            ? `Đơn tối thiểu ${coupon.minOrderValue.toLocaleString()}đ`
                            : undefined
                        }
                        onSelect={() => canApply && selectCoupon(coupon)}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-mono-200 flex justify-between items-center">
              <button
                onClick={() => {
                  setShowCouponModal(false);
                  navigate("/my-coupons");
                }}
                className="text-mono-600 hover:text-mono-900 text-sm flex items-center space-x-1"
              >
                <FaGift className="w-3 h-3" />
                <span>Xem kho voucher</span>
              </button>
              <button
                onClick={() => setShowCouponModal(false)}
                className="px-4 py-2 bg-mono-black text-white rounded-lg hover:bg-mono-800 transition-colors"
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

// Coupon Card Component for Modal
interface OrderCouponCardProps {
  coupon: Coupon;
  isApplied: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onSelect: () => void;
}

const OrderCouponCard: React.FC<OrderCouponCardProps> = ({
  coupon,
  isApplied,
  disabled = false,
  disabledReason,
  onSelect,
}) => {
  const [copied, setCopied] = useState(false);

  const copyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDiscount = () => {
    if (coupon.type === "percent") {
      return `${coupon.value}%`;
    }
    return `${coupon.value.toLocaleString()}đ`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div
      onClick={disabled ? undefined : onSelect}
      className={`relative p-4 border rounded-lg transition-all ${
        isApplied
          ? "border-green-500 bg-green-50"
          : disabled
          ? "border-mono-200 bg-mono-50 opacity-60"
          : "border-mono-200 hover:border-mono-400 cursor-pointer"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-bold text-mono-900 text-lg">
              {formatDiscount()}
            </span>
            {coupon.maxDiscount && coupon.type === "percent" && (
              <span className="text-xs text-mono-500">
                (Tối đa {coupon.maxDiscount.toLocaleString()}đ)
              </span>
            )}
          </div>
          <p className="text-sm text-mono-600 mb-2">{coupon.description}</p>

          <div className="flex items-center space-x-3 text-xs text-mono-500">
            <span>
              Mã: <span className="font-mono font-semibold">{coupon.code}</span>
            </span>
            <span>•</span>
            <span>HSD: {formatDate(coupon.endDate)}</span>
          </div>

          {coupon.minOrderValue > 0 && (
            <div className="mt-1 text-xs text-mono-500">
              Đơn tối thiểu: {coupon.minOrderValue.toLocaleString()}đ
            </div>
          )}

          {coupon.scope && coupon.scope !== "ALL" && (
            <div className="mt-1 text-xs text-blue-600">
              Áp dụng cho{" "}
              {coupon.scope === "PRODUCTS"
                ? "sản phẩm"
                : coupon.scope === "CATEGORIES"
                ? "danh mục"
                : ""}{" "}
              cụ thể
            </div>
          )}

          {disabledReason && (
            <div className="mt-1 text-xs text-red-500 font-medium">
              {disabledReason}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end space-y-2">
          <button
            onClick={copyCode}
            className="p-2 hover:bg-mono-100 rounded transition-colors"
            title="Sao chép mã"
          >
            {copied ? (
              <FaCheck className="w-3 h-3 text-green-500" />
            ) : (
              <FaCopy className="w-3 h-3 text-mono-500" />
            )}
          </button>

          {isApplied && (
            <span className="text-xs font-medium text-green-600 flex items-center space-x-1">
              <FaCheck className="w-3 h-3" />
              <span>Đang dùng</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
