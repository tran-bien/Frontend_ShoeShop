import {
  FiX,
  FiPackage,
  FiUser,
  FiMapPin,
  FiCreditCard,
  FiTruck,
  FiCheck,
  FiClock,
} from "react-icons/fi";
import type { ReturnRequest } from "../../../types/return";

interface Props {
  returnRequest: ReturnRequest;
  onClose: () => void;
}

const RETURN_SHIPPING_FEE = 30000;

const ReturnDetailModal = ({ returnRequest, onClose }: Props) => {
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Chờ duyệt" },
      approved: { color: "bg-blue-100 text-blue-800", label: "Đã duyệt" },
      shipping: {
        color: "bg-purple-100 text-purple-800",
        label: "Đang lấy hàng",
      },
      received: {
        color: "bg-indigo-100 text-indigo-800",
        label: "Đã nhận hàng",
      },
      refunded: { color: "bg-teal-100 text-teal-800", label: "Đã hoàn tiền" },
      completed: { color: "bg-green-100 text-green-800", label: "Hoàn thành" },
      rejected: { color: "bg-red-100 text-red-800", label: "Từ chối" },
      cancel_pending: {
        color: "bg-orange-100 text-orange-800",
        label: "Chờ duyệt hủy",
      },
      canceled: { color: "bg-gray-100 text-gray-800", label: "Đã hủy" },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span
        className={`px-3 py-1 text-sm font-semibold rounded-full ${badge.color}`}
      >
        {badge.label}
      </span>
    );
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      wrong_size: "Sai kích cỡ",
      wrong_product: "Sai sản phẩm (giao nhầm)",
      defective: "Sản phẩm lỗi/hư hỏng",
      not_as_described: "Không giống mô tả",
      changed_mind: "Đổi ý (không muốn nữa)",
      other: "Lý do khác",
    };
    return labels[reason] || reason;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("vi-VN");
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "N/A";
    return amount.toLocaleString("vi-VN") + "đ";
  };

  // Calculate refund amount
  const orderTotal = returnRequest.order?.totalAfterDiscountAndShipping || 0;
  const refundAmount =
    returnRequest.refundAmount || orderTotal - RETURN_SHIPPING_FEE;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-white text-black p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Chi tiết yêu cầu trả hàng</h2>
              <p className="text-gray-500 mt-1">
                Mã:{" "}
                <span className="font-mono">
                  {returnRequest.code || `#${returnRequest._id.slice(-8)}`}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge(returnRequest.status)}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] space-y-6">
          {/* Basic Info Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Request Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                <FiPackage />
                <span>Thông tin yêu cầu</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mã đơn hàng:</span>
                  <span className="font-mono font-medium">
                    {returnRequest.order?.code || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ngày tạo:</span>
                  <span>{formatDate(returnRequest.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phương thức hoàn tiền:</span>
                  <span className="font-medium">
                    {returnRequest.refundMethod === "bank_transfer"
                      ? "Chuyển khoản"
                      : "Tiền mặt (qua shipper)"}
                  </span>
                </div>
                {returnRequest.status === "rejected" &&
                  returnRequest.rejectionReason && (
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500">Lý do từ chối:</span>
                      <span className="text-red-600 font-medium">
                        {returnRequest.rejectionReason}
                      </span>
                    </div>
                  )}
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                <FiUser />
                <span>Thông tin khách hàng</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Họ tên:</span>
                  <span className="font-medium">
                    {returnRequest.customer?.name || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span>{returnRequest.customer?.email || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">SĐT:</span>
                  <span>{returnRequest.customer?.phone || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pickup Address - Địa chỉ lấy hàng trả */}
          {(returnRequest.pickupAddress ||
            returnRequest.order?.shippingAddress) && (
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 text-black font-semibold mb-3">
                <FiMapPin />
                <span>Địa chỉ lấy hàng</span>
              </div>
              <div className="text-sm text-black">
                {returnRequest.pickupAddress ? (
                  <>
                    <p className="font-medium">
                      {returnRequest.pickupAddress.name}
                    </p>
                    <p>{returnRequest.pickupAddress.phone}</p>
                    <p>{returnRequest.pickupAddress.detail}</p>
                    <p>
                      {returnRequest.pickupAddress.ward},{" "}
                      {returnRequest.pickupAddress.district},{" "}
                      {returnRequest.pickupAddress.province}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">
                      {returnRequest.order?.shippingAddress?.fullName}
                    </p>
                    <p>{returnRequest.order?.shippingAddress?.phone}</p>
                    <p>
                      {returnRequest.order?.shippingAddress?.addressLine ||
                        returnRequest.order?.shippingAddress?.address}
                    </p>
                    <p>
                      {returnRequest.order?.shippingAddress?.ward},{" "}
                      {returnRequest.order?.shippingAddress?.district},{" "}
                      {returnRequest.order?.shippingAddress?.province}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">
              Lý do trả hàng
            </h3>
            <p className="text-yellow-700 font-medium">
              {getReasonLabel(returnRequest.reason)}
            </p>
            {returnRequest.reasonDetail && (
              <p className="text-yellow-600 text-sm mt-2 italic">
                "{returnRequest.reasonDetail}"
              </p>
            )}
          </div>

          {/* Return Reason Images */}
          {returnRequest.returnReasonImages &&
            returnRequest.returnReasonImages.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Ảnh minh chứng ({returnRequest.returnReasonImages.length} ảnh)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {returnRequest.returnReasonImages.map((image, index) => (
                    <a
                      key={index}
                      href={image.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block"
                    >
                      <img
                        src={image.url}
                        alt={`Return reason ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-500 transition-colors cursor-pointer"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            )}

          {/* Products in Order */}
          {returnRequest.order?.orderItems &&
            returnRequest.order.orderItems.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">
                  Sản phẩm trả hàng ({returnRequest.order.orderItems.length} sản
                  phẩm)
                </h3>
                <div className="space-y-3">
                  {returnRequest.order.orderItems.map(
                    (
                      item: {
                        product?: { images?: { url: string }[]; name?: string };
                        variant?: {
                          color?: { name?: string; code?: string };
                          size?: { value?: string | number };
                          images?: { url: string }[];
                          product?: {
                            images?: { url: string }[];
                            name?: string;
                          };
                        };
                        size?: { value?: string | number };
                        quantity?: number;
                        price?: number;
                        priceAtPurchase?: number;
                      },
                      idx: number
                    ) => {
                      // Lấy ảnh từ nhiều nguồn theo thứ tự ưu tiên
                      const imageUrl =
                        item.variant?.images?.[0]?.url ||
                        item.variant?.product?.images?.[0]?.url ||
                        item.product?.images?.[0]?.url;

                      // Lấy tên sản phẩm từ nhiều nguồn
                      const productName =
                        item.variant?.product?.name ||
                        item.product?.name ||
                        "Sản phẩm";

                      return (
                        <div
                          key={idx}
                          className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4"
                        >
                          {imageUrl && (
                            <img
                              src={imageUrl}
                              alt={productName}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              {productName}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                              <span>
                                Màu:{" "}
                                <strong>
                                  {item.variant?.color?.name || "N/A"}
                                </strong>
                                {item.variant?.color?.code && (
                                  <span
                                    className="inline-block w-4 h-4 rounded-full border ml-1 align-middle"
                                    style={{
                                      backgroundColor: item.variant.color.code,
                                    }}
                                  />
                                )}
                              </span>
                              <span>
                                Size:{" "}
                                <strong>
                                  {item.variant?.size?.value ||
                                    item.size?.value ||
                                    "N/A"}
                                </strong>
                              </span>
                              <span>
                                SL: <strong>{item.quantity}</strong>
                              </span>
                              <span>
                                Giá:{" "}
                                <strong>
                                  {formatCurrency(
                                    item.priceAtPurchase || item.price
                                  )}
                                </strong>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

          {/* Refund Info */}
          <div className="bg-white border border-black rounded-lg p-4">
            <div className="flex items-center gap-2 text-black font-semibold mb-3">
              <FiCreditCard />
              <span>Thông tin hoàn tiền</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-black">Giá trị đơn hàng:</span>
                  <span className="font-medium text-black">
                    {formatCurrency(orderTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Phí trả hàng:</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(RETURN_SHIPPING_FEE)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-black">
                  <span className="text-black font-semibold">
                    Số tiền hoàn:
                  </span>
                  <span className="text-xl font-bold text-black">
                    {formatCurrency(refundAmount)}
                  </span>
                </div>
              </div>

              {/* Bank Info for bank_transfer */}
              {returnRequest.refundMethod === "bank_transfer" &&
                returnRequest.bankInfo && (
                  <div className="bg-white rounded-lg p-3 border-2 border-black shadow-sm">
                    <p className="font-medium text-black mb-2">
                      Thông tin ngân hàng:
                    </p>
                    <div className="space-y-1 text-sm text-black">
                      <p>
                        Ngân hàng:{" "}
                        <strong>{returnRequest.bankInfo.bankName}</strong>
                      </p>
                      <p>
                        Số TK:{" "}
                        <strong className="font-mono">
                          {returnRequest.bankInfo.accountNumber}
                        </strong>
                      </p>
                      <p>
                        Chủ TK:{" "}
                        <strong>{returnRequest.bankInfo.accountName}</strong>
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Shipper Info */}
          {returnRequest.assignedShipper && (
            <div className="bg-white border border-black rounded-xl p-4">
              <div className="flex items-center gap-2 text-black font-semibold mb-3">
                <FiTruck />
                <span>Thông tin shipper</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-black">Tên:</span>
                    <span className="font-medium">
                      {returnRequest.assignedShipper.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">SĐT:</span>
                    <span>{returnRequest.assignedShipper.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Ngày phân công:</span>
                    <span>{formatDate(returnRequest.assignedAt)}</span>
                  </div>
                </div>

                {/* Refund collected by shipper (for cash method) */}
                {returnRequest.refundMethod === "cash" &&
                  returnRequest.refundCollectedByShipper?.collectedAt && (
                    <div className="bg-white rounded-xl p-3 border border-green-600">
                      <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                        <FiCheck />
                        <span>Đã giao tiền hoàn</span>
                      </div>
                      <div className="space-y-1 text-sm text-black">
                        <p>
                          Số tiền:{" "}
                          <strong className="text-green-700">
                            {formatCurrency(
                              returnRequest.refundCollectedByShipper.amount ||
                                returnRequest.refundAmount
                            )}
                          </strong>
                        </p>
                        <p>
                          Thời gian:{" "}
                          {formatDate(
                            returnRequest.refundCollectedByShipper.collectedAt
                          )}
                        </p>
                        {returnRequest.refundCollectedByShipper.note && (
                          <p className="italic">
                            Ghi chú:{" "}
                            {returnRequest.refundCollectedByShipper.note}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                {/* Show pending refund status if not collected yet */}
                {returnRequest.refundMethod === "cash" &&
                  returnRequest.status === "approved" &&
                  !returnRequest.refundCollectedByShipper?.collectedAt && (
                    <div className="bg-white rounded-xl p-3 border border-orange-400">
                      <div className="flex items-center gap-2 text-orange-600 font-medium mb-2">
                        <FiClock />
                        <span>Chưa giao tiền hoàn</span>
                      </div>
                      <div className="space-y-1 text-sm text-black">
                        <p>
                          Số tiền hoàn:{" "}
                          <strong className="text-orange-600">
                            {formatCurrency(returnRequest.refundAmount)}
                          </strong>
                        </p>
                        <p className="italic text-gray-600">
                          Shipper sẽ giao tiền khi nhận hàng từ khách
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Processing History */}
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-3">Lịch sử xử lý</h3>
            <div className="space-y-3">
              {/* Created */}
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                <div className="text-sm">
                  <p className="font-medium text-gray-700">Tạo yêu cầu</p>
                  <p className="text-gray-500">
                    {formatDate(returnRequest.createdAt)}
                  </p>
                </div>
              </div>

              {/* Approved */}
              {returnRequest.approvedBy && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-700">
                      Phê duyệt bởi {returnRequest.approvedBy.name || "Admin"}
                    </p>
                    <p className="text-gray-500">
                      {formatDate(returnRequest.approvedAt)}
                    </p>
                    {returnRequest.adminNote && (
                      <p className="text-gray-600 italic mt-1">
                        Ghi chú: {returnRequest.adminNote}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Rejected */}
              {returnRequest.rejectedBy && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-red-500"></div>
                  <div className="text-sm">
                    <p className="font-medium text-red-700">
                      Từ chối bởi {returnRequest.rejectedBy.name || "Admin"}
                    </p>
                    <p className="text-gray-500">
                      {formatDate(returnRequest.rejectedAt)}
                    </p>
                    {returnRequest.rejectionReason && (
                      <p className="text-red-600 mt-1">
                        Lý do: {returnRequest.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Assigned Shipper */}
              {returnRequest.assignedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-purple-500"></div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-700">
                      Phân công shipper: {returnRequest.assignedShipper?.name}
                    </p>
                    <p className="text-gray-500">
                      {formatDate(returnRequest.assignedAt)}
                    </p>
                  </div>
                </div>
              )}

              {/* Received */}
              {returnRequest.receivedBy && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500"></div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-700">
                      Đã nhận hàng - {returnRequest.receivedBy.name}
                    </p>
                    <p className="text-gray-500">
                      {formatDate(returnRequest.receivedAt)}
                    </p>
                  </div>
                </div>
              )}

              {/* Refund collected (cash) */}
              {returnRequest.refundCollectedByShipper?.collectedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-teal-500"></div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-700">
                      Shipper đã giao{" "}
                      {formatCurrency(
                        returnRequest.refundCollectedByShipper.amount
                      )}{" "}
                      cho khách
                    </p>
                    <p className="text-gray-500">
                      {formatDate(
                        returnRequest.refundCollectedByShipper.collectedAt
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Bank transfer confirmed */}
              {returnRequest.status === "refunded" &&
                returnRequest.refundMethod === "bank_transfer" && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-teal-500"></div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-700">
                        Đã chuyển khoản hoàn tiền
                      </p>
                    </div>
                  </div>
                )}

              {/* Completed */}
              {returnRequest.completedBy && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-green-600"></div>
                  <div className="text-sm">
                    <p className="font-medium text-green-700">
                      Hoàn thành -{" "}
                      {returnRequest.completedBy.name || "Hệ thống"}
                    </p>
                    <p className="text-gray-500">
                      {formatDate(returnRequest.completedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnDetailModal;
