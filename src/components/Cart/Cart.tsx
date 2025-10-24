import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { cartService } from "../../services/CartService";
import { toast } from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import {
  FiMinus,
  FiPlus,
  FiTrash2,
  FiShoppingBag,
  FiTag,
  FiTruck,
  FiLoader,
  FiShoppingCart,
  FiArrowLeft,
} from "react-icons/fi";
import { debounce } from "lodash";
import type { Cart as CartType, CartItem } from "../../types/cart";

const Cart: React.FC = () => {
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null); // TODO: Add Coupon type
  const [couponLoading, setCouponLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null); // TODO: Add OrderPreview type

  // Thay đổi: Sử dụng Map để track quantity chính xác hơn
  const [optimisticQuantities, setOptimisticQuantities] = useState<
    Map<string, number>
  >(new Map());
  const updateTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const lastUpdateTime = useRef<Map<string, number>>(new Map());

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Memoize selected items với optimistic quantities
  const selectedItems = useMemo(() => {
    if (!cart?.cartItems) return [];

    return cart.cartItems
      .filter((item: CartItem) => {
        return item.isSelected && item.isAvailable;
      })
      .map((item: CartItem) => {
        const optimisticQty = optimisticQuantities.get(item._id);
        return {
          ...item,
          quantity: optimisticQty ?? item.quantity,
        };
      });
  }, [cart?.cartItems, optimisticQuantities]);

  const availableItems = useMemo(
    () => cart?.cartItems?.filter((item: CartItem) => item.isAvailable) || [],
    [cart?.cartItems]
  );

  // Tính tổng tiền real-time từ optimistic quantities
  const calculateOptimisticTotal = useCallback(() => {
    if (!selectedItems.length) return { subTotal: 0, totalQuantity: 0 };

    let subTotal = 0;
    let totalQuantity = 0;

    selectedItems.forEach((item: CartItem) => {
      const qty = optimisticQuantities.get(item._id) ?? item.quantity;
      subTotal += item.price * qty;
      totalQuantity += qty;
    });

    return { subTotal, totalQuantity };
  }, [selectedItems, optimisticQuantities]);

  const optimisticTotals = useMemo(
    () => calculateOptimisticTotal(),
    [calculateOptimisticTotal]
  );

  // Fetch cart data
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();

      if (response.data.success) {
        const cartData = response.data.cart || null;
        setCart(cartData);

        // Reset optimistic quantities khi fetch mới
        setOptimisticQuantities(new Map());
      } else {
        toast.error(response.data.message || "Không thể tải giỏ hàng");
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        return;
      }
      const errorMessage =
        error.response?.data?.message || "Không thể tải giỏ hàng";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Preview order với optimistic data
  const previewOrder = useCallback(
    async (couponCode?: string) => {
      try {
        const response = await cartService.previewBeforeOrder(
          couponCode ? { couponCode } : {}
        );

        if (response.data.success && response.data.preview) {
          let preview = response.data.preview;

          // Áp dụng optimistic quantities vào preview
          if (optimisticQuantities.size > 0) {
            const optimisticTotals = calculateOptimisticTotal();
            preview = {
              ...preview,
              subTotal: optimisticTotals.subTotal,
              totalQuantity: optimisticTotals.totalQuantity,
              totalPrice:
                optimisticTotals.subTotal +
                (preview.shippingFee || 0) -
                (preview.discount || 0),
            };
          }

          setPreviewData(preview);
          if (couponCode && preview?.couponApplied) {
            setAppliedCoupon(preview.couponDetail);
          }
        }
      } catch (error: any) {
        if (couponCode) {
          toast.error(
            error.response?.data?.message || "Mã giảm giá không hợp lệ"
          );
          setAppliedCoupon(null);
        }
      }
    },
    [optimisticQuantities, calculateOptimisticTotal]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, [isAuthenticated, navigate, fetchCart]);

  // Preview khi cart thay đổi
  useEffect(() => {
    if (cart) {
      previewOrder(appliedCoupon?.code);
    }
  }, [cart, appliedCoupon?.code, previewOrder]);

  // Cải thiện debounced update với cancel cũ
  const debouncedUpdateQuantity = useCallback(
    debounce(async (itemId: string, newQuantity: number) => {
      if (newQuantity < 1 || newQuantity > 99) return;

      const now = Date.now();
      lastUpdateTime.current.set(itemId, now);

      try {
        const response = await cartService.updateCartItemQuantity(itemId, {
          quantity: newQuantity,
        }); // Chỉ update nếu đây là request mới nhất
        if (lastUpdateTime.current.get(itemId) === now) {
          if (response.data.success) {
            const updatedCart = response.data.cart;
            if (updatedCart) {
              setCart(updatedCart);

              // Clear optimistic quantity sau khi server confirm
              setOptimisticQuantities((prev) => {
                const newMap = new Map(prev);
                newMap.delete(itemId);
                return newMap;
              });
            }

            if (response.data.productInfo?.exceededInventory) {
              toast.error(response.data.message || "Số lượng vượt quá tồn kho");
            }
          }
        }
      } catch (error: any) {
        // Chỉ xử lý error nếu đây là request mới nhất
        if (
          lastUpdateTime.current.get(itemId) === now &&
          error.response?.status !== 401
        ) {
          toast.error(
            error.response?.data?.message || "Không thể cập nhật số lượng"
          );

          // Revert optimistic update
          setOptimisticQuantities((prev) => {
            const newMap = new Map(prev);
            newMap.delete(itemId);
            return newMap;
          });
        }
      }
    }, 400),
    []
  );

  // Optimized quantity update - vẫn gọi setUpdating cho logic nhưng không hiển thị trên UI
  const updateQuantity = useCallback(
    (itemId: string, newQuantity: number, isImmediate = false) => {
      if (newQuantity < 1 || newQuantity > 99) return;

      const currentItem = cart?.cartItems.find((item) => item._id === itemId);
      if (!currentItem) return;

      // Cancel timeout cũ nếu có
      const existingTimeout = updateTimeouts.current.get(itemId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      } // Optimistic update ngay lập tức
      setOptimisticQuantities((prev) => {
        const newMap = new Map(prev);
        newMap.set(itemId, newQuantity);
        return newMap;
      });

      if (isImmediate) {
        // Cancel debounce và gọi trực tiếp cho button click
        debouncedUpdateQuantity.cancel();
        debouncedUpdateQuantity(itemId, newQuantity);
      } else {
        // Debounce cho input change
        debouncedUpdateQuantity(itemId, newQuantity);
      }
    },
    [cart?.cartItems, debouncedUpdateQuantity]
  );

  // Cải tiến: Thêm một state để theo dõi input hiện tại
  const [inputValues, setInputValues] = useState<Map<string, string>>(
    new Map()
  );

  // Handle input change
  const handleQuantityInputChange = useCallback(
    (itemId: string, value: string) => {
      // Lưu giá trị hiện tại của input để hiển thị ngay lập tức
      setInputValues((prev) => {
        const newMap = new Map(prev);
        // Chỉ giữ các ký tự số
        const sanitizedValue = value.replace(/[^0-9]/g, "");
        newMap.set(itemId, sanitizedValue);
        return newMap;
      });

      // Xử lý cập nhật số lượng nếu là giá trị hợp lệ
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= 1 && numValue <= 99) {
        updateQuantity(itemId, numValue, false);
      }
    },
    [updateQuantity]
  );

  // Cải tiến: Làm rõ hơn xử lý giá trị hiển thị
  const getDisplayQuantity = useCallback(
    (item: CartItem) => {
      // Nếu đang có giá trị nhập vào, ưu tiên hiển thị giá trị đó
      const inputValue = inputValues.get(item._id);
      if (inputValue !== undefined) {
        return inputValue;
      }

      // Nếu đang có optimistic quantity, hiển thị giá trị đó
      const optimisticQty = optimisticQuantities.get(item._id);
      if (optimisticQty !== undefined) {
        return optimisticQty.toString();
      }

      // Mặc định là giá trị từ server
      return item.quantity.toString();
    },
    [optimisticQuantities, inputValues]
  );

  // Thêm hàm xử lý nút tăng/giảm số lượng - không hiển thị loading
  const handleQuantityButtonClick = useCallback(
    (itemId: string, change: number) => {
      const currentItem = cart?.cartItems.find((item) => item._id === itemId);
      if (!currentItem) return;

      const currentQty =
        optimisticQuantities.get(itemId) ?? currentItem.quantity;
      const newQuantity = currentQty + change;

      if (newQuantity >= 1 && newQuantity <= 99) {
        updateQuantity(itemId, newQuantity, true);
      }
    },
    [cart?.cartItems, optimisticQuantities, updateQuantity]
  );

  // Thêm hàm tính tổng giá trị cho mỗi sản phẩm
  const getItemTotalPrice = useCallback(
    (item: CartItem) => {
      const quantity = optimisticQuantities.get(item._id) ?? item.quantity;
      return item.price * quantity;
    },
    [optimisticQuantities]
  );

  // Cải tiến: Xử lý focus và blur cho input
  const handleInputFocus = useCallback(
    (itemId: string) => {
      // Khi focus vào input, lưu giá trị hiện tại
      const currentItem = cart?.cartItems.find((item) => item._id === itemId);
      if (currentItem) {
        const qty = optimisticQuantities.get(itemId) ?? currentItem.quantity;
        setInputValues((prev) => {
          const newMap = new Map(prev);
          newMap.set(itemId, qty.toString());
          return newMap;
        });
      }
    },
    [cart?.cartItems, optimisticQuantities]
  );

  const handleInputBlur = useCallback(
    (itemId: string) => {
      // Khi blur khỏi input, xử lý giá trị cuối cùng
      const inputValue = inputValues.get(itemId);
      if (inputValue !== undefined) {
        const numValue = parseInt(inputValue);

        if (isNaN(numValue) || numValue < 1) {
          // Nếu giá trị không hợp lệ, đặt về 1
          updateQuantity(itemId, 1, true);
          setInputValues((prev) => {
            const newMap = new Map(prev);
            newMap.delete(itemId);
            return newMap;
          });
        } else if (numValue > 99) {
          // Nếu vượt quá 99, giới hạn là 99
          updateQuantity(itemId, 99, true);
          setInputValues((prev) => {
            const newMap = new Map(prev);
            newMap.delete(itemId);
            return newMap;
          });
        }
      }
    },
    [inputValues, updateQuantity]
  );

  // Toggle item selection
  const toggleItemSelection = useCallback(
    async (itemId: string) => {
      const currentItem = cart?.cartItems.find((item) => item._id === itemId);
      if (!currentItem) return;

      // Optimistic update
      setCart((prevCart) => {
        if (!prevCart) return prevCart;
        return {
          ...prevCart,
          cartItems: prevCart.cartItems.map((item) =>
            item._id === itemId
              ? { ...item, isSelected: !item.isSelected }
              : item
          ),
        };
      });

      try {
        const response = await cartService.toggleCartItem(itemId);
        if (response.data.success) {
          const updatedCart = response.data.cart;
          if (updatedCart) {
            setCart(updatedCart);
          }
        }
      } catch (error: any) {
        if (error.response?.status !== 401) {
          toast.error("Không thể thay đổi trạng thái sản phẩm");
        }
        await fetchCart(); // Revert on error
      }
    },
    [cart?.cartItems, fetchCart]
  );

  // Remove selected items
  const removeSelectedItems = useCallback(async () => {
    if (!selectedItems?.length) {
      toast.error("Vui lòng chọn sản phẩm để xóa");
      return;
    }

    try {
      const response = await cartService.removeSelectedItems();
      if (response.data.success) {
        const updatedCart = response.data.cart;
        if (updatedCart) {
          setCart(updatedCart);
          // Clear optimistic quantities cho items đã xóa
          setOptimisticQuantities(new Map());
        }
        toast.success(`Đã xóa ${selectedItems.length} sản phẩm`);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn");
        navigate("/login");
        return;
      }
      toast.error("Không thể xóa sản phẩm");
    }
  }, [selectedItems, navigate]);

  // Apply coupon
  const applyCoupon = useCallback(async () => {
    if (!couponCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    setCouponLoading(true);
    try {
      const response = await cartService.previewBeforeOrder({ couponCode });

      if (response.data.success) {
        if (response.data.preview?.couponApplied) {
          setPreviewData(response.data.preview);
          setAppliedCoupon(response.data.preview.couponDetail);
          toast.success("Đã áp dụng mã giảm giá thành công");
        } else {
          toast.error("Mã giảm giá không hợp lệ hoặc không áp dụng được");
          setAppliedCoupon(null);
        }
      } else {
        toast.error(response.data.message || "Mã giảm giá không hợp lệ");
        setAppliedCoupon(null);
      }
    } catch (error: any) {
      setAppliedCoupon(null);
      toast.error(error.response?.data?.message || "Mã giảm giá không hợp lệ");
    } finally {
      setCouponLoading(false);
    }
  }, [couponCode]);

  // Remove coupon
  const removeCoupon = useCallback(async () => {
    setCouponCode("");
    setAppliedCoupon(null);
    toast.success("Đã hủy mã giảm giá");
  }, []);

  // Select all items
  const selectAllItems = useCallback(async () => {
    if (!availableItems.length) return;

    const allSelected = availableItems.every(
      (item: CartItem) => item.isSelected
    );

    // Optimistic update
    setCart((prevCart) => {
      if (!prevCart) return prevCart;
      return {
        ...prevCart,
        cartItems: prevCart.cartItems.map((item) =>
          item.isAvailable ? { ...item, isSelected: !allSelected } : item
        ),
      };
    });

    try {
      for (const item of availableItems) {
        if (item.isSelected === allSelected) {
          await cartService.toggleCartItem(item._id);
        }
      }
      await fetchCart();
    } catch (error) {
      toast.error("Không thể thay đổi trạng thái sản phẩm");
      fetchCart();
    }
  }, [availableItems, fetchCart]);

  // Proceed to checkout
  const proceedToCheckout = useCallback(() => {
    if (!selectedItems?.length) {
      toast.error("Vui lòng chọn sản phẩm để thanh toán");
      return;
    }
    navigate("/order-confirmation");
  }, [selectedItems, navigate]);

  // Cleanup
  useEffect(() => {
    return () => {
      debouncedUpdateQuantity.cancel();
      updateTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, [debouncedUpdateQuantity]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <FiLoader className="animate-spin text-2xl text-blue-600" />
          <span className="text-lg">Đang tải giỏ hàng...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FiArrowLeft />
              <span>Tiếp tục mua sắm</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <FiShoppingCart />
            <span>Giỏ hàng ({cart?.cartItems?.length || 0})</span>
          </h1>
        </div>

        {!cart?.cartItems?.length ? (
          // Empty cart
          <div className="text-center py-16">
            <FiShoppingBag className="mx-auto text-6xl text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Giỏ hàng của bạn đang trống
            </h2>
            <p className="text-gray-600 mb-6">
              Hãy thêm một số sản phẩm vào giỏ hàng của bạn
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Bắt đầu mua sắm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm">
                {/* Cart Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={
                          availableItems.length > 0 &&
                          availableItems.every(
                            (item: CartItem) => item.isSelected
                          )
                        }
                        onChange={selectAllItems}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="font-medium text-gray-900">
                        Chọn tất cả ({availableItems.length} sản phẩm)
                      </span>
                    </label>
                    {selectedItems.length > 0 && (
                      <button
                        onClick={removeSelectedItems}
                        className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <FiTrash2 />
                        <span>Xóa đã chọn</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Cart Items List */}
                <div className="divide-y divide-gray-200">
                  {cart.cartItems.map((item: CartItem) => (
                    <div key={item._id} className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={item.isSelected || false}
                          onChange={() => toggleItemSelection(item._id)}
                          disabled={!item.isAvailable}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-2"
                        />

                        {/* Product Image */}
                        <div
                          className="flex-shrink-0 cursor-pointer"
                          onClick={() =>
                            navigate(
                              `/product/${
                                item.variant.product?.slug ||
                                item.variant.product?._id ||
                                item.variant._id
                              }`
                            )
                          }
                        >
                          <img
                            src={item.image || "/placeholder.jpg"}
                            alt={item.productName || "Product"}
                            className="w-20 h-20 rounded-lg object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder.jpg";
                            }}
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3
                                className="text-lg font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600"
                                onClick={() =>
                                  navigate(
                                    `/product/${
                                      item.variant.product?.slug ||
                                      item.variant.product?._id ||
                                      item.variant._id
                                    }`
                                  )
                                }
                              >
                                {item.productName || "Tên sản phẩm"}
                              </h3>
                              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                                <span>
                                  Màu: {item.variant?.color?.name || "N/A"}
                                </span>
                                <span>Size: {item.size?.value || "N/A"}</span>
                              </div>
                              {!item.isAvailable && (
                                <p className="mt-1 text-sm text-red-600">
                                  {item.unavailableReason ||
                                    "Sản phẩm không có sẵn"}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col items-end space-y-2">
                              <div className="text-lg font-semibold text-gray-900">
                                {(item.price || 0).toLocaleString()}đ
                              </div>
                              {item.variant?.price !==
                                item.variant?.priceFinal && (
                                <div className="text-sm text-gray-500 line-through">
                                  {(item.variant?.price || 0).toLocaleString()}đ
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() =>
                                  handleQuantityButtonClick(item._id, -1)
                                }
                                disabled={
                                  parseInt(getDisplayQuantity(item)) <= 1 ||
                                  !item.isAvailable
                                }
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <FiMinus className="w-4 h-4" />
                              </button>

                              <div className="relative">
                                <input
                                  type="text"
                                  value={getDisplayQuantity(item)}
                                  onChange={(e) =>
                                    handleQuantityInputChange(
                                      item._id,
                                      e.target.value
                                    )
                                  }
                                  onFocus={() => handleInputFocus(item._id)}
                                  onBlur={() => handleInputBlur(item._id)}
                                  disabled={!item.isAvailable}
                                  className="px-2 py-1 border border-gray-300 rounded-lg w-[60px] text-center disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  min="1"
                                  max="99"
                                />
                                {/* Xóa hiệu ứng loading */}
                              </div>

                              <button
                                onClick={() =>
                                  handleQuantityButtonClick(item._id, 1)
                                }
                                disabled={
                                  parseInt(getDisplayQuantity(item)) >= 99 ||
                                  !item.isAvailable
                                }
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <FiPlus className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="text-lg font-semibold text-blue-600">
                              {getItemTotalPrice(item).toLocaleString()}đ
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm sticky top-8">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Tóm tắt đơn hàng
                  </h2>

                  {/* Coupon Section */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <FiTag className="text-green-600" />
                      <span className="font-medium text-gray-900">
                        Mã giảm giá
                      </span>
                    </div>

                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div>
                          <div className="font-medium text-green-800">
                            {appliedCoupon.code}
                          </div>
                          <div className="text-sm text-green-600">
                            Giảm{" "}
                            {appliedCoupon.type === "percentage"
                              ? `${appliedCoupon.value}%`
                              : `${appliedCoupon.value.toLocaleString()}đ`}
                          </div>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Nhập mã giảm giá"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={applyCoupon}
                          disabled={couponLoading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {couponLoading ? (
                            <FiLoader className="animate-spin" />
                          ) : (
                            "Áp dụng"
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Order Details với optimistic totals */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>
                        Tạm tính ({optimisticTotals.totalQuantity} sản phẩm)
                      </span>
                      <span>{optimisticTotals.subTotal.toLocaleString()}đ</span>
                    </div>

                    {selectedItems.length > 0 && previewData?.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá</span>
                        <span>
                          -{(previewData.discount || 0).toLocaleString()}đ
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-600">
                      <span className="flex items-center space-x-1">
                        <FiTruck />
                        <span>Phí vận chuyển</span>
                      </span>
                      <span>
                        {(selectedItems.length > 0
                          ? previewData?.shippingFee || 0
                          : 0
                        ).toLocaleString()}
                        đ
                      </span>
                    </div>
                  </div>

                  {/* Total với optimistic calculation */}
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <span>Tổng cộng</span>
                      <span className="text-blue-600">
                        {selectedItems.length > 0
                          ? (
                              optimisticTotals.subTotal +
                              (previewData?.shippingFee || 0) -
                              (previewData?.discount || 0)
                            ).toLocaleString()
                          : "0"}
                        đ
                      </span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={proceedToCheckout}
                    disabled={selectedItems.length === 0}
                    className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Thanh toán ({selectedItems.length} sản phẩm)
                  </button>

                  <div className="mt-4 text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center space-x-1">
                      <span>🛡️</span>
                      <span>Thanh toán an toàn và bảo mật</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
