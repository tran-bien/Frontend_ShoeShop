import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiPackage,
  FiAlertCircle,
  FiCheck,
  FiMapPin,
  FiImage,
  FiX,
  FiUpload,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { customerReturnService } from "../services/ReturnService";
import { userOrderService } from "../services/OrderService";
import { addressService } from "../services/ProfileService";
import Sidebar from "../components/User/Sidebar";
import type {
  CreateReturnRequestData,
  RefundMethod,
  BankInfo,
  ReturnReason,
} from "../types/return";
import type { UserAddress } from "../types/user";

interface OrderItem {
  variant: {
    _id: string;
    color?: { _id: string; name: string; code: string };
    product?: { _id: string; name: string; images?: { url: string }[] };
  };
  size: { _id: string; value: string | number };
  quantity: number;
  price: number;
  productName: string;
}

interface Order {
  _id: string;
  code: string;
  status: string;
  deliveredAt?: string;
  orderItems: OrderItem[];
  shippingFee: number;
  totalAfterDiscountAndShipping: number;
}

// Danh sách ngân hàng phổ biến tại Việt Nam
const POPULAR_BANKS = [
  "Vietcombank - Ngân hàng TMCP Ngoại thương Việt Nam",
  "VietinBank - Ngân hàng TMCP Công Thương Việt Nam",
  "BIDV - Ngân hàng TMCP Đầu tư và Phát triển Việt Nam",
  "Agribank - Ngân hàng NN&PTNT Việt Nam",
  "Techcombank - Ngân hàng TMCP Kỹ Thương Việt Nam",
  "MB Bank - Ngân hàng TMCP Quân đội",
  "ACB - Ngân hàng TMCP Á Châu",
  "VPBank - Ngân hàng TMCP Việt Nam Thịnh Vượng",
  "Sacombank - Ngân hàng TMCP Sài Gòn Thương Tín",
  "TPBank - Ngân hàng TMCP Tiên Phong",
  "HDBank - Ngân hàng TMCP Phát triển TP.HCM",
  "SHB - Ngân hàng TMCP Sài Gòn - Hà Nội",
  "OCB - Ngân hàng TMCP Phương Đông",
  "VIB - Ngân hàng TMCP Quốc tế Việt Nam",
  "SeABank - Ngân hàng TMCP Đông Nam Á",
  "MSB - Ngân hàng TMCP Hàng Hải Việt Nam",
  "LPBank - Ngân hàng TMCP Bưu điện Liên Việt",
  "NCB - Ngân hàng TMCP Quốc Dân",
  "PVcomBank - Ngân hàng TMCP Đại Chúng Việt Nam",
  "Khác",
];

// Phí ship khi trả hàng (30.000đ)
const RETURN_SHIPPING_FEE = 30000;

const CreateReturnPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("default");

  // Form state
  const [reason, setReason] = useState<ReturnReason | "">("");
  const [reasonDetail, setReasonDetail] = useState("");
  const [refundMethod, setRefundMethod] =
    useState<RefundMethod>("bank_transfer");
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });

  // Image upload state (1-5 images required)
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const reasons: { value: ReturnReason; label: string }[] = [
    { value: "wrong_size", label: "Sai kích cỡ" },
    { value: "wrong_product", label: "Sai sản phẩm (giao nhầm)" },
    { value: "defective", label: "Sản phẩm lỗi/hư hỏng" },
    { value: "not_as_described", label: "Không giống mô tả" },
    { value: "changed_mind", label: "Đổi ý (không muốn nữa)" },
    { value: "other", label: "Lý do khác" },
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchDeliveredOrders();
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (orderId && orders.length > 0) {
      const order = orders.find((o) => o._id === orderId);
      if (order) {
        setSelectedOrder(order);
      }
    }
  }, [orderId, orders]);

  // Fetch user addresses
  const fetchAddresses = async () => {
    try {
      setAddressesLoading(true);
      const response = await addressService.getAddresses();
      console.log("[CreateReturnPage] Addresses response:", response.data);
      if (response.data.success && response.data.data) {
        setAddresses(response.data.data);
        console.log(
          "[CreateReturnPage] Loaded addresses:",
          response.data.data.length
        );
      }
    } catch (error) {
      console.error("[CreateReturnPage] Error fetching addresses:", error);
      toast.error("Không thể tải danh sách địa chỉ");
    } finally {
      setAddressesLoading(false);
    }
  };

  const fetchDeliveredOrders = async () => {
    try {
      setLoading(true);
      const response = await userOrderService.getOrders({
        status: "delivered",
        limit: 50,
      });
      if (response.data.success) {
        // Filter orders within 7 days
        const now = new Date();
        const eligibleOrders = (response.data.orders || []).filter(
          (order: Order) => {
            if (!order.deliveredAt) return false;
            const deliveredDate = new Date(order.deliveredAt);
            const daysDiff = Math.floor(
              (now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            return daysDiff <= 7;
          }
        );
        setOrders(eligibleOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  // Handle image upload
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Check total number of images (existing + new)
    if (selectedImages.length + files.length > 5) {
      toast.error("Chỉ được tải lên tối đa 5 ảnh");
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} không phải là file ảnh`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} vượt quá 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Add new files
    setSelectedImages((prev) => [...prev, ...validFiles]);

    // Create preview URLs
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Tính toán số tiền hoàn lại
  const calculateRefundAmount = () => {
    if (!selectedOrder) return 0;
    return Math.max(
      0,
      selectedOrder.totalAfterDiscountAndShipping - RETURN_SHIPPING_FEE
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOrder) {
      toast.error("Vui lòng chọn đơn hàng");
      return;
    }

    if (!reason) {
      toast.error("Vui lòng chọn lý do trả hàng");
      return;
    }

    // Validate images - bắt buộc có ít nhất 1 ảnh
    if (selectedImages.length === 0) {
      toast.error("Vui lòng tải lên ít nhất 1 ảnh minh chứng lý do trả hàng");
      return;
    }

    if (selectedImages.length > 5) {
      toast.error("Chỉ được tải lên tối đa 5 ảnh");
      return;
    }

    if (refundMethod === "bank_transfer") {
      if (
        !bankInfo.bankName ||
        !bankInfo.accountNumber ||
        !bankInfo.accountName
      ) {
        toast.error("Vui lòng điền đầy đủ thông tin ngân hàng");
        return;
      }
    }

    try {
      setSubmitting(true);

      // Create FormData for multipart/form-data request
      const formData = new FormData();
      formData.append("orderId", selectedOrder._id);
      formData.append("reason", reason as ReturnReason);
      if (reasonDetail) formData.append("reasonDetail", reasonDetail);
      formData.append("refundMethod", refundMethod);

      if (refundMethod === "bank_transfer" && bankInfo) {
        formData.append("bankInfo[bankName]", bankInfo.bankName);
        formData.append("bankInfo[accountNumber]", bankInfo.accountNumber);
        formData.append("bankInfo[accountName]", bankInfo.accountName);
      }

      if (selectedAddressId !== "default") {
        formData.append("pickupAddressId", selectedAddressId);
      }

      // Append images
      selectedImages.forEach((file) => {
        formData.append("images", file);
      });

      await customerReturnService.createReturnRequest(formData);
      toast.success("Tạo yêu cầu trả hàng thành công!");
      navigate("/user-manage-order?tab=returns");
    } catch (error: unknown) {
      console.error("Error creating return request:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Không thể tạo yêu cầu";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-mono-100">
      <div className="flex flex-1">
        {/* Sidebar - Fixed position */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-10">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/user-manage-order?tab=returns")}
              className="flex items-center gap-2 text-gray-600 hover:text-black mb-4"
            >
              <FiArrowLeft className="w-5 h-5" />
              Quay lại
            </button>
            <h1 className="text-3xl font-bold text-black mb-2">
              Yêu Cầu Trả Hàng / Hoàn Tiền
            </h1>
            <p className="text-gray-600">
              Chọn đơn hàng bạn muốn trả và điền thông tin
            </p>
          </div>

          {/* Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Lưu ý:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    Trả hàng sẽ trả toàn bộ đơn hàng (không hỗ trợ trả từng sản
                    phẩm)
                  </li>
                  <li>
                    Phí trả hàng:{" "}
                    <strong>
                      {RETURN_SHIPPING_FEE.toLocaleString("vi-VN")}đ
                    </strong>{" "}
                    (trừ vào tiền hoàn)
                  </li>
                  <li>Đơn hàng phải được giao trong vòng 7 ngày gần đây</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Selection */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Chọn đơn hàng</h2>
              {orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiPackage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Không có đơn hàng nào đủ điều kiện trả hàng</p>
                  <p className="text-sm mt-1">
                    (Đơn hàng phải đã giao trong vòng 7 ngày)
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      onClick={() => handleSelectOrder(order)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedOrder?._id === order._id
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          {selectedOrder?._id === order._id && (
                            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                              <FiCheck className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{order.code}</p>
                            <p className="text-sm text-gray-600">
                              {order.orderItems.length} sản phẩm
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {order.totalAfterDiscountAndShipping?.toLocaleString(
                              "vi-VN"
                            )}
                            đ
                          </p>
                          <p className="text-sm text-gray-600">
                            Giao ngày:{" "}
                            {order.deliveredAt
                              ? new Date(order.deliveredAt).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Items Preview */}
            {selectedOrder && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">
                  Sản phẩm trong đơn hàng (sẽ trả toàn bộ)
                </h2>
                <div className="space-y-3">
                  {selectedOrder.orderItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={
                          item.variant.product?.images?.[0]?.url ||
                          "/placeholder.jpg"
                        }
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600">
                          {item.variant.color?.name} - Size {item.size.value}
                        </p>
                        <p className="text-sm text-gray-600">
                          SL: {item.quantity} x{" "}
                          {item.price.toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Refund calculation */}
                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tổng đơn hàng:</span>
                    <span>
                      {selectedOrder.totalAfterDiscountAndShipping?.toLocaleString(
                        "vi-VN"
                      )}
                      đ
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí trả hàng:</span>
                    <span className="text-red-600">
                      -{RETURN_SHIPPING_FEE.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>Tiền hoàn lại:</span>
                    <span className="text-green-600">
                      {calculateRefundAmount().toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Pickup Address Selection */}
            {selectedOrder && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiMapPin className="text-gray-600" />
                  Địa chỉ lấy hàng trả
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Shipper sẽ đến địa chỉ này để lấy hàng trả về
                </p>

                <div className="space-y-3">
                  {/* Default option - use order's shipping address */}
                  <label
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedAddressId === "default"
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="pickupAddress"
                      value="default"
                      checked={selectedAddressId === "default"}
                      onChange={() => setSelectedAddressId("default")}
                      className="w-4 h-4 mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium">Địa chỉ giao hàng của đơn</p>
                      <p className="text-sm text-gray-600 mt-1">
                        (Mặc định - Shipper sẽ đến địa chỉ bạn đã nhận hàng)
                      </p>
                    </div>
                  </label>

                  {/* Loading state */}
                  {addressesLoading && (
                    <div className="text-sm text-gray-500 pt-2 flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-black"></div>
                      Đang tải danh sách địa chỉ...
                    </div>
                  )}

                  {/* Addresses from address book */}
                  {!addressesLoading && addresses.length > 0 && (
                    <>
                      <div className="text-sm text-gray-500 pt-2">
                        Hoặc chọn từ sổ địa chỉ ({addresses.length} địa chỉ):
                      </div>
                      {addresses.map((addr) => (
                        <label
                          key={addr._id}
                          className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            selectedAddressId === addr._id
                              ? "border-black bg-gray-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="pickupAddress"
                            value={addr._id}
                            checked={selectedAddressId === addr._id}
                            onChange={() =>
                              setSelectedAddressId(addr._id || "")
                            }
                            className="w-4 h-4 mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{addr.name}</p>
                              {addr.isDefault && (
                                <span className="text-xs bg-black text-white px-2 py-0.5 rounded">
                                  Mặc định
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {addr.phone}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {addr.detail}, {addr.ward}, {addr.district},{" "}
                              {addr.province}
                            </p>
                          </div>
                        </label>
                      ))}
                    </>
                  )}

                  {!addressesLoading && addresses.length === 0 && (
                    <p className="text-sm text-gray-400 italic">
                      Bạn chưa có địa chỉ nào trong sổ địa chỉ.{" "}
                      <a
                        href="/user-profile?tab=addresses"
                        className="text-black underline"
                      >
                        Thêm địa chỉ mới
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Reason */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Lý do trả hàng</h2>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReturnReason | "")}
                className="w-full px-4 py-2 border rounded-lg mb-4"
                required
              >
                <option value="">-- Chọn lý do --</option>
                {reasons.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>

              <textarea
                value={reasonDetail}
                onChange={(e) => setReasonDetail(e.target.value)}
                placeholder="Mô tả chi tiết (tùy chọn)..."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                {reasonDetail.length}/500 ký tự
              </p>
            </div>

            {/* Image Upload Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FiImage className="w-5 h-5" />
                <h2 className="text-lg font-semibold">
                  Ảnh minh chứng <span className="text-red-500">*</span>
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Vui lòng tải lên từ 1-5 ảnh chụp sản phẩm để minh chứng lý do
                trả hàng
              </p>

              {/* Image Preview Grid */}
              {imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Xóa ảnh"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              {selectedImages.length < 5 && (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiUpload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Nhấn để tải ảnh</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, WEBP (tối đa 5MB mỗi ảnh)
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedImages.length}/5 ảnh
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    multiple
                    onChange={handleImageSelect}
                  />
                </label>
              )}

              {selectedImages.length === 0 && (
                <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                  <FiAlertCircle className="w-4 h-4" />
                  Bắt buộc phải có ít nhất 1 ảnh
                </p>
              )}

              {selectedImages.length === 5 && (
                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                  <FiCheck className="w-4 h-4" />
                  Đã đạt số lượng ảnh tối đa (5 ảnh)
                </p>
              )}
            </div>

            {/* Refund Method */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">
                Phương thức hoàn tiền
              </h2>
              <div className="space-y-3">
                <label
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    refundMethod === "bank_transfer"
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="refundMethod"
                    value="bank_transfer"
                    checked={refundMethod === "bank_transfer"}
                    onChange={(e) =>
                      setRefundMethod(e.target.value as RefundMethod)
                    }
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium">Chuyển khoản ngân hàng</p>
                    <p className="text-sm text-gray-500">
                      Admin sẽ chuyển tiền vào tài khoản ngân hàng của bạn
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    refundMethod === "cash"
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="refundMethod"
                    value="cash"
                    checked={refundMethod === "cash"}
                    onChange={(e) =>
                      setRefundMethod(e.target.value as RefundMethod)
                    }
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium">Tiền mặt (Shipper giao)</p>
                    <p className="text-sm text-gray-500">
                      Shipper sẽ lấy hàng trả và giao tiền hoàn cho bạn
                    </p>
                  </div>
                </label>
              </div>

              {refundMethod === "bank_transfer" && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                  <h3 className="font-medium">Thông tin ngân hàng</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tên ngân hàng *
                    </label>
                    <select
                      value={
                        POPULAR_BANKS.includes(bankInfo.bankName)
                          ? bankInfo.bankName
                          : "Khác"
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "Khác") {
                          setBankInfo({ ...bankInfo, bankName: "" });
                        } else {
                          setBankInfo({ ...bankInfo, bankName: value });
                        }
                      }}
                      className="w-full px-4 py-2 border rounded-lg mb-2"
                      required
                    >
                      <option value="">-- Chọn ngân hàng --</option>
                      {POPULAR_BANKS.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>
                    {/* Nếu chọn Khác thì cho nhập tên ngân hàng */}
                    {(!POPULAR_BANKS.includes(bankInfo.bankName) ||
                      bankInfo.bankName === "") && (
                      <input
                        type="text"
                        value={bankInfo.bankName}
                        onChange={(e) =>
                          setBankInfo({ ...bankInfo, bankName: e.target.value })
                        }
                        placeholder="Nhập tên ngân hàng"
                        className="w-full px-4 py-2 border rounded-lg mt-2"
                        required
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Số tài khoản *
                    </label>
                    <input
                      type="text"
                      value={bankInfo.accountNumber}
                      onChange={(e) =>
                        setBankInfo({
                          ...bankInfo,
                          accountNumber: e.target.value,
                        })
                      }
                      placeholder="Nhập số tài khoản"
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tên chủ tài khoản *
                    </label>
                    <input
                      type="text"
                      value={bankInfo.accountName}
                      onChange={(e) =>
                        setBankInfo({
                          ...bankInfo,
                          accountName: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="VD: NGUYEN VAN A"
                      className="w-full px-4 py-2 border rounded-lg uppercase"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate("/user-manage-order?tab=returns")}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedOrder || !reason}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Đang gửi..." : "Gửi yêu cầu trả hàng"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateReturnPage;
