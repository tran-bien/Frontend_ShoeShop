import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTruck,
  FiDollarSign,
  FiMapPin,
  FiCreditCard,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { customerReturnService } from "../services/ReturnService";
import Sidebar from "../components/User/Sidebar";
import type { ReturnRequest, ReturnRequestStatus } from "../types/return";

const RETURN_SHIPPING_FEE = 30000;

const ReturnDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<ReturnRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRequest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const response = await customerReturnService.getReturnRequestDetail(id!);
      if (response.data.success && response.data.data) {
        setRequest(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching return request:", error);
      toast.error("Không thể tải thông tin yêu cầu");
      navigate("/user-manage-order?tab=returns");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error("Vui lòng nhập lý do hủy yêu cầu");
      return;
    }

    try {
      setCancelling(true);
      await customerReturnService.cancelReturnRequest(id!, {
        reason: cancelReason.trim(),
      });
      toast.success("Đã gửi yêu cầu hủy, chờ admin duyệt");
      setShowCancelModal(false);
      setCancelReason("");
      fetchRequest(); // Refresh to get new status
    } catch (error) {
      console.error("Error canceling request:", error);
      toast.error("Không thể hủy yêu cầu");
    } finally {
      setCancelling(false);
    }
  };

  // Có thể hủy khi ở trạng thái pending, approved, shipping
  const canCancel =
    request?.status &&
    ["pending", "approved", "shipping"].includes(request.status);

  const getStatusConfig = (status: ReturnRequestStatus) => {
    const configs: Record<
      ReturnRequestStatus,
      {
        bg: string;
        text: string;
        label: string;
        icon: React.ElementType;
        description: string;
      }
    > = {
      pending: {
        bg: "bg-mono-200",
        text: "text-mono-700",
        label: "Chờ duyệt",
        icon: FiClock,
        description: "Yêu cầu đang chờ admin xem xét và phê duyệt",
      },
      approved: {
        bg: "bg-mono-100",
        text: "text-mono-black",
        label: "Đã duyệt",
        icon: FiCheckCircle,
        description: "Yêu cầu đã được duyệt, đang chờ phân công shipper",
      },
      shipping: {
        bg: "bg-mono-300",
        text: "text-mono-800",
        label: "Đang lấy hàng",
        icon: FiTruck,
        description: "Shipper đang đến lấy hàng trả",
      },
      received: {
        bg: "bg-mono-400",
        text: "text-white",
        label: "Đã nhận hàng",
        icon: FiPackage,
        description: "Cửa hàng đã nhận hàng trả, đang xử lý hoàn tiền",
      },
      refunded: {
        bg: "bg-mono-600",
        text: "text-white",
        label: "Đã hoàn tiền",
        icon: FiDollarSign,
        description: "Tiền đã được hoàn về cho bạn",
      },
      completed: {
        bg: "bg-mono-black",
        text: "text-white",
        label: "Hoàn tất",
        icon: FiCheckCircle,
        description: "Yêu cầu trả hàng đã hoàn tất",
      },
      rejected: {
        bg: "bg-mono-900",
        text: "text-white",
        label: "Từ chối",
        icon: FiXCircle,
        description: "Yêu cầu đã bị từ chối",
      },
      cancel_pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        label: "Chờ duyệt hủy",
        icon: FiClock,
        description: "Yêu cầu hủy đang chờ admin xem xét",
      },
      canceled: {
        bg: "bg-mono-100",
        text: "text-mono-500",
        label: "Đã hủy",
        icon: FiXCircle,
        description: "Bạn đã hủy yêu cầu này",
      },
    };
    return configs[status] || configs.pending;
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

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-mono-100">
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 p-10 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col min-h-screen bg-mono-100">
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 p-10 flex items-center justify-center">
            <div className="text-center">
              <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Không tìm thấy yêu cầu</p>
              <button
                onClick={() => navigate("/user-manage-order?tab=returns")}
                className="mt-4 px-4 py-2 bg-black text-white rounded-lg"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(request.status);
  const StatusIcon = statusConfig.icon;
  const orderTotal = request.order?.totalAfterDiscountAndShipping || 0;
  const refundAmount = request.refundAmount || orderTotal - RETURN_SHIPPING_FEE;

  return (
    <div className="flex flex-col min-h-screen bg-mono-100">
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-10">
          {/* Header với nút quay lại */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/user-manage-order?tab=returns")}
              className="flex items-center gap-2 px-4 py-2 text-mono-black hover:bg-mono-50 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span>Quay lại</span>
            </button>
            <h1 className="text-3xl font-bold">Chi tiết yêu cầu trả hàng</h1>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Header gradient giống UserOrderDetailPage */}
            <div className="bg-gradient-to-r from-mono-500 to-mono-black text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Yêu cầu trả hàng{" "}
                    {request.code || `#${request._id.slice(-8)}`}
                  </h2>
                  <p className="text-mono-200 text-sm mb-3">
                    Đơn hàng: {request.order?.code || "N/A"}
                  </p>
                  <span
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                    style={{
                      color: "#374151",
                      backgroundColor: "rgba(255,255,255,0.9)",
                    }}
                  >
                    <StatusIcon className="w-4 h-4" />
                    {statusConfig.label}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  {canCancel && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="px-4 py-2 bg-mono-800 text-white rounded hover:bg-mono-900"
                    >
                      Hủy yêu cầu
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Status Description */}
              <div className="mb-6 p-4 bg-mono-50 border border-mono-200 rounded-lg">
                <p className="text-mono-700">{statusConfig.description}</p>
                {/* Hiển thị thông tin cancel_pending */}
                {request.status === "cancel_pending" &&
                  request.cancelReason && (
                    <div className="mt-3 pt-3 border-t border-mono-200">
                      <p className="text-sm text-mono-600">
                        <strong>Lý do hủy:</strong> {request.cancelReason}
                      </p>
                      {request.cancelRequestedAt && (
                        <p className="text-sm text-mono-500 mt-1">
                          Yêu cầu hủy lúc:{" "}
                          {formatDate(request.cancelRequestedAt)}
                        </p>
                      )}
                    </div>
                  )}
              </div>

              {/* Thông tin chung */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Pickup Address - Địa chỉ lấy hàng trả */}
                {(request.pickupAddress || request.order?.shippingAddress) && (
                  <div className="bg-mono-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <FiMapPin className="text-mono-500" />
                      <h3 className="font-semibold">Địa chỉ lấy hàng</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      {request.pickupAddress ? (
                        <>
                          <p>
                            <strong>Người gửi:</strong>{" "}
                            {request.pickupAddress.name}
                          </p>
                          <p>
                            <strong>SĐT:</strong> {request.pickupAddress.phone}
                          </p>
                          <p className="text-mono-600">
                            {request.pickupAddress.detail}
                            <br />
                            {request.pickupAddress.ward},{" "}
                            {request.pickupAddress.district}
                            <br />
                            {request.pickupAddress.province}
                          </p>
                        </>
                      ) : (
                        <>
                          <p>
                            <strong>Người gửi:</strong>{" "}
                            {request.order?.shippingAddress?.fullName}
                          </p>
                          <p>
                            <strong>SĐT:</strong>{" "}
                            {request.order?.shippingAddress?.phone}
                          </p>
                          <p className="text-mono-600">
                            {request.order?.shippingAddress?.addressLine ||
                              request.order?.shippingAddress?.address}
                            <br />
                            {request.order?.shippingAddress?.ward},{" "}
                            {request.order?.shippingAddress?.district}
                            <br />
                            {request.order?.shippingAddress?.province}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Refund Info */}
                <div className="bg-mono-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <FiCreditCard className="text-mono-700" />
                    <h3 className="font-semibold">Thông tin hoàn tiền</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Phương thức:</strong>{" "}
                      {request.refundMethod === "bank_transfer"
                        ? "Chuyển khoản"
                        : "Tiền mặt"}
                    </p>
                    <p>
                      <strong>Giá trị đơn:</strong> {formatCurrency(orderTotal)}
                    </p>
                    <p>
                      <strong>Phí trả hàng:</strong>{" "}
                      <span className="text-mono-600">
                        -{formatCurrency(RETURN_SHIPPING_FEE)}
                      </span>
                    </p>
                    <p className="pt-2 border-t border-mono-200">
                      <strong>Số tiền hoàn:</strong>{" "}
                      <span className="text-lg font-bold text-mono-black">
                        {formatCurrency(refundAmount)}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Request Info */}
                <div className="bg-mono-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <FiClock className="text-mono-600" />
                    <h3 className="font-semibold">Thông tin yêu cầu</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Ngày tạo:</strong> {formatDate(request.createdAt)}
                    </p>
                    {request.approvedAt && (
                      <p>
                        <strong>Ngày duyệt:</strong>{" "}
                        {formatDate(request.approvedAt)}
                      </p>
                    )}
                    {request.completedAt && (
                      <p>
                        <strong>Ngày hoàn tất:</strong>{" "}
                        {formatDate(request.completedAt)}
                      </p>
                    )}
                    <p className="pt-2 border-t border-mono-200">
                      <strong>Lý do:</strong> {getReasonLabel(request.reason)}
                    </p>
                    {request.reasonDetail && (
                      <p className="text-mono-600 italic">
                        "{request.reasonDetail}"
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tiến trình xử lý */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Tiến trình xử lý</h2>
                <div className="bg-mono-50 rounded-lg p-4">
                  <div className="space-y-4">
                    {/* Created */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-mono-800 rounded-full flex items-center justify-center">
                        <FiCheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Đã tạo yêu cầu</p>
                        <p className="text-sm text-mono-500">
                          {formatDate(request.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Approved */}
                    {request.approvedAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-mono-600 rounded-full flex items-center justify-center">
                          <FiCheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Đã được duyệt</p>
                          <p className="text-sm text-mono-500">
                            {formatDate(request.approvedAt)}
                          </p>
                          {request.adminNote && (
                            <p className="text-sm text-mono-600 italic mt-1">
                              "{request.adminNote}"
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Shipper Assigned */}
                    {request.assignedAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-mono-500 rounded-full flex items-center justify-center">
                          <FiTruck className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Đã phân công shipper</p>
                          <p className="text-sm text-mono-500">
                            {formatDate(request.assignedAt)}
                          </p>
                          {request.assignedShipper && (
                            <p className="text-sm text-mono-600">
                              Shipper: {request.assignedShipper.name} -{" "}
                              {request.assignedShipper.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Received */}
                    {request.receivedAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-mono-400 rounded-full flex items-center justify-center">
                          <FiPackage className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Đã nhận hàng trả</p>
                          <p className="text-sm text-mono-500">
                            {formatDate(request.receivedAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Refund Delivered by Shipper (for cash method) */}
                    {request.refundMethod === "cash" &&
                      request.refundCollectedByShipper?.collectedAt && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-mono-700 rounded-full flex items-center justify-center">
                            <FiDollarSign className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-mono-800">
                              Đã nhận tiền hoàn từ shipper
                            </p>
                            <p className="text-sm text-mono-500">
                              {formatDate(
                                request.refundCollectedByShipper.collectedAt
                              )}
                            </p>
                            <p className="text-sm font-semibold text-mono-black">
                              Số tiền:{" "}
                              {formatCurrency(
                                request.refundCollectedByShipper.amount
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                    {/* Bank Transfer Refunded */}
                    {request.refundMethod === "bank_transfer" &&
                      request.status === "refunded" && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-mono-700 rounded-full flex items-center justify-center">
                            <FiDollarSign className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-mono-800">
                              Đã chuyển khoản hoàn tiền
                            </p>
                            <p className="text-sm text-mono-600">
                              Số tiền: {formatCurrency(refundAmount)}
                            </p>
                          </div>
                        </div>
                      )}

                    {/* Completed */}
                    {request.completedAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-mono-black rounded-full flex items-center justify-center">
                          <FiCheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-mono-black">
                            Hoàn tất
                          </p>
                          <p className="text-sm text-mono-500">
                            {formatDate(request.completedAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Rejected */}
                    {request.status === "rejected" && request.rejectedAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-mono-900 rounded-full flex items-center justify-center">
                          <FiXCircle className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-mono-900">
                            Đã bị từ chối
                          </p>
                          <p className="text-sm text-mono-500">
                            {formatDate(request.rejectedAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Canceled */}
                    {request.status === "canceled" && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-mono-200 rounded-full flex items-center justify-center">
                          <FiXCircle className="w-4 h-4 text-mono-600" />
                        </div>
                        <div>
                          <p className="font-medium text-mono-600">Đã hủy</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">
                  Sản phẩm trả ({request.order?.orderItems?.length || 0})
                </h2>
                <div className="border border-mono-200 rounded-lg overflow-hidden">
                  {request.order?.orderItems?.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-4 ${
                        index > 0 ? "border-t border-mono-200" : ""
                      }`}
                    >
                      <img
                        src={
                          item.image ||
                          item.variant?.product?.images?.[0]?.url ||
                          "/placeholder.jpg"
                        }
                        alt={item.productName || "Product"}
                        className="w-20 h-20 object-cover rounded-lg border border-mono-200"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-mono-black">
                          {item.productName ||
                            item.variant?.product?.name ||
                            "Sản phẩm"}
                        </p>
                        <p className="text-sm text-mono-600">
                          {item.variant?.color?.name || "N/A"} | Size:{" "}
                          {item.size?.value || "N/A"}
                        </p>
                        <p className="text-sm text-mono-500">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-mono-black">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bank Info */}
              {request.refundMethod === "bank_transfer" && request.bankInfo && (
                <div className="mb-8 p-4 bg-mono-50 border border-mono-200 rounded-lg">
                  <h3 className="font-semibold mb-3">
                    Thông tin ngân hàng nhận tiền
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      Ngân hàng:{" "}
                      <strong className="text-mono-black">
                        {request.bankInfo.bankName}
                      </strong>
                    </p>
                    <p>
                      Số TK:{" "}
                      <strong className="font-mono text-mono-black">
                        {request.bankInfo.accountNumber}
                      </strong>
                    </p>
                    <p>
                      Chủ TK:{" "}
                      <strong className="text-mono-black">
                        {request.bankInfo.accountName}
                      </strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Shipper Info (when assigned) */}
              {request.assignedShipper && (
                <div className="mb-8 p-4 bg-mono-100 border border-mono-300 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <FiTruck className="w-5 h-5 text-mono-700" />
                    <h3 className="font-semibold text-mono-800">
                      Thông tin shipper
                    </h3>
                  </div>
                  <div className="space-y-2 text-mono-700">
                    <p>
                      <strong>Tên:</strong> {request.assignedShipper.name}
                    </p>
                    <p>
                      <strong>Số điện thoại:</strong>{" "}
                      {request.assignedShipper.phone}
                    </p>
                  </div>
                  {request.refundMethod === "cash" && (
                    <p className="mt-4 text-sm text-mono-600 bg-white p-3 rounded border border-mono-200">
                      💵 Shipper sẽ lấy hàng và giao tiền hoàn{" "}
                      <strong>{formatCurrency(refundAmount)}</strong> cho bạn
                    </p>
                  )}
                </div>
              )}

              {/* Rejection Reason */}
              {request.status === "rejected" && request.rejectionReason && (
                <div className="mb-8 p-4 bg-mono-100 border border-mono-400 rounded-lg">
                  <h3 className="font-semibold text-mono-900 mb-2">
                    Lý do từ chối
                  </h3>
                  <p className="text-mono-700">{request.rejectionReason}</p>
                </div>
              )}

              {/* Instructions */}
              {request.status === "approved" && !request.assignedShipper && (
                <div className="mb-8 p-4 bg-mono-50 border border-mono-300 rounded-lg">
                  <h3 className="font-semibold text-mono-800 mb-3">
                    Thông tin
                  </h3>
                  <p className="text-mono-700">
                    Yêu cầu của bạn đã được duyệt. Vui lòng đợi shipper được
                    phân công để đến lấy hàng.
                  </p>
                </div>
              )}

              {request.status === "shipping" && (
                <div className="mb-8 p-4 bg-mono-100 border border-mono-300 rounded-lg">
                  <h3 className="font-semibold text-mono-800 mb-3">
                    Hướng dẫn
                  </h3>
                  <div className="space-y-2 text-mono-700">
                    <p className="flex items-start gap-2">
                      <span className="font-bold">1.</span>
                      Đóng gói sản phẩm cẩn thận trong túi/hộp ban đầu (nếu còn)
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="font-bold">2.</span>
                      Chuẩn bị sẵn hàng để giao cho shipper khi đến
                    </p>
                    {request.refundMethod === "cash" && (
                      <p className="flex items-start gap-2">
                        <span className="font-bold">3.</span>
                        Shipper sẽ giao tiền hoàn{" "}
                        <strong>{formatCurrency(refundAmount)}</strong> cho bạn
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Hủy yêu cầu trả hàng</h3>
            <p className="text-sm text-mono-600 mb-4">
              Bạn có chắc muốn hủy yêu cầu này? Yêu cầu hủy sẽ được gửi đến
              admin để xem xét. Sau khi admin duyệt hủy, bạn sẽ không thể yêu
              cầu trả hàng cho đơn này nữa.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-mono-700 mb-2">
                Lý do hủy <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do bạn muốn hủy yêu cầu trả hàng..."
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-400"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                className="px-4 py-2 text-mono-600 border border-mono-300 rounded-lg hover:bg-mono-50"
              >
                Đóng
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling || !cancelReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling ? "Đang xử lý..." : "Gửi yêu cầu hủy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnDetailPage;
