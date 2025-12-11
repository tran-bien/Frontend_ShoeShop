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
import type { ReturnRequest, ReturnRequestStatus } from "../types/return";

const RETURN_SHIPPING_FEE = 30000;

const ReturnDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<ReturnRequest | null>(null);
  const [loading, setLoading] = useState(true);

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
      navigate("/returns");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Bạn có chắc muốn hủy yêu cầu này?")) return;

    try {
      await customerReturnService.cancelReturnRequest(id!);
      toast.success("Đã hủy yêu cầu");
      navigate("/returns");
    } catch (error) {
      console.error("Error canceling request:", error);
      toast.error("Không thể hủy yêu cầu");
    }
  };

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
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Chờ duyệt",
        icon: FiClock,
        description: "Yêu cầu đang chờ admin xem xét và phê duyệt",
      },
      approved: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Đã duyệt",
        icon: FiCheckCircle,
        description: "Yêu cầu đã được duyệt, đang chờ phân công shipper",
      },
      shipping: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        label: "Đang lấy hàng",
        icon: FiTruck,
        description: "Shipper đang đến lấy hàng trả",
      },
      received: {
        bg: "bg-indigo-100",
        text: "text-indigo-800",
        label: "Đã nhận hàng",
        icon: FiPackage,
        description: "Cửa hàng đã nhận hàng trả, đang xử lý hoàn tiền",
      },
      refunded: {
        bg: "bg-teal-100",
        text: "text-teal-800",
        label: "Đã hoàn tiền",
        icon: FiDollarSign,
        description: "Tiền đã được hoàn về cho bạn",
      },
      completed: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Hoàn tất",
        icon: FiCheckCircle,
        description: "Yêu cầu trả hàng đã hoàn tất",
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Từ chối",
        icon: FiXCircle,
        description: "Yêu cầu đã bị từ chối",
      },
      canceled: {
        bg: "bg-gray-100",
        text: "text-gray-800",
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Không tìm thấy yêu cầu</p>
          <button
            onClick={() => navigate("/returns")}
            className="mt-4 px-4 py-2 bg-black text-white rounded-lg"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(request.status);
  const StatusIcon = statusConfig.icon;
  const orderTotal = request.order?.totalAfterDiscountAndShipping || 0;
  const refundAmount = request.refundAmount || orderTotal - RETURN_SHIPPING_FEE;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/returns")}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-4"
          >
            <FiArrowLeft className="w-5 h-5" />
            Quay lại danh sách
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-black flex items-center gap-2">
                <FiPackage className="w-6 h-6" />
                Yêu cầu trả hàng
              </h1>
              <p className="text-gray-600 mt-1">
                Mã: {request.code || `#${request._id.slice(-8)}`}
              </p>
            </div>

            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bg} ${statusConfig.text}`}
            >
              <StatusIcon className="w-5 h-5" />
              <span className="font-medium">{statusConfig.label}</span>
            </div>
          </div>

          {/* Status Description */}
          <div className={`mt-4 p-4 rounded-lg ${statusConfig.bg}`}>
            <p className={statusConfig.text}>{statusConfig.description}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status Timeline */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Tiến trình xử lý</h2>
            <div className="space-y-4">
              {/* Created */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Đã tạo yêu cầu</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(request.createdAt)}
                  </p>
                </div>
              </div>

              {/* Approved */}
              {request.approvedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiCheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Đã được duyệt</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(request.approvedAt)}
                    </p>
                    {request.adminNote && (
                      <p className="text-sm text-gray-600 italic mt-1">
                        "{request.adminNote}"
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Shipper Assigned */}
              {request.assignedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <FiTruck className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Đã phân công shipper</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(request.assignedAt)}
                    </p>
                    {request.assignedShipper && (
                      <p className="text-sm text-gray-600">
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
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <FiPackage className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium">Đã nhận hàng trả</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(request.receivedAt)}
                    </p>
                  </div>
                </div>
              )}

              {/* Refund Delivered by Shipper (for cash method) */}
              {request.refundMethod === "cash" &&
                request.refundCollectedByShipper?.collectedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                      <FiDollarSign className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium text-teal-700">
                        Đã nhận tiền hoàn từ shipper
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(
                          request.refundCollectedByShipper.collectedAt
                        )}
                      </p>
                      <p className="text-sm font-semibold text-teal-700">
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
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                      <FiDollarSign className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium text-teal-700">
                        Đã chuyển khoản hoàn tiền
                      </p>
                      <p className="text-sm text-gray-600">
                        Số tiền: {formatCurrency(refundAmount)}
                      </p>
                    </div>
                  </div>
                )}

              {/* Completed */}
              {request.completedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <FiCheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-600">Hoàn tất</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(request.completedAt)}
                    </p>
                  </div>
                </div>
              )}

              {/* Rejected */}
              {request.status === "rejected" && request.rejectedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <FiXCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-red-600">Đã bị từ chối</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(request.rejectedAt)}
                    </p>
                  </div>
                </div>
              )}

              {/* Canceled */}
              {request.status === "canceled" && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <FiXCircle className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Đã hủy</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Mã đơn hàng</p>
                <p className="font-medium">{request.order?.code || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày tạo yêu cầu</p>
                <p className="font-medium">{formatDate(request.createdAt)}</p>
              </div>
            </div>

            {/* Shipping Address */}
            {request.order?.shippingAddress && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                  <FiMapPin className="w-4 h-4" />
                  <span>Địa chỉ lấy hàng</span>
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium">
                    {request.order.shippingAddress.fullName}
                  </p>
                  <p>{request.order.shippingAddress.phone}</p>
                  <p>
                    {request.order.shippingAddress.addressLine ||
                      request.order.shippingAddress.address}
                  </p>
                  <p>
                    {request.order.shippingAddress.ward},{" "}
                    {request.order.shippingAddress.district},{" "}
                    {request.order.shippingAddress.province}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Products */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">
              Sản phẩm trả ({request.order?.items?.length || 0})
            </h2>
            <div className="space-y-4">
              {request.order?.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <img
                    src={item.product?.images?.[0]?.url || "/placeholder.jpg"}
                    alt={item.product?.name || "Product"}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium">
                      {item.product?.name || "Sản phẩm"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Màu: {item.variant?.color?.name || "N/A"} | Size:{" "}
                      {item.size?.value || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Số lượng: {item.quantity}
                    </p>
                    <p className="text-sm font-medium">
                      {formatCurrency(item.priceAtPurchase || item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Lý do trả hàng</h2>
            <p className="font-medium text-gray-800">
              {getReasonLabel(request.reason)}
            </p>
            {request.reasonDetail && (
              <p className="text-gray-600 mt-2 italic">
                "{request.reasonDetail}"
              </p>
            )}
          </div>

          {/* Refund Info */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FiCreditCard className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold">Thông tin hoàn tiền</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Phương thức hoàn tiền</span>
                <span className="font-medium">
                  {request.refundMethod === "bank_transfer"
                    ? "Chuyển khoản ngân hàng"
                    : "Tiền mặt (shipper giao)"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Giá trị đơn hàng</span>
                <span className="font-medium">
                  {formatCurrency(orderTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí trả hàng</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(RETURN_SHIPPING_FEE)}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="text-gray-800 font-semibold">
                  Số tiền hoàn
                </span>
                <span className="font-bold text-xl text-green-600">
                  {formatCurrency(refundAmount)}
                </span>
              </div>

              {/* Bank Info */}
              {request.refundMethod === "bank_transfer" && request.bankInfo && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-2">
                    Thông tin ngân hàng nhận tiền:
                  </p>
                  <div className="space-y-1 text-sm">
                    <p>
                      Ngân hàng: <strong>{request.bankInfo.bankName}</strong>
                    </p>
                    <p>
                      Số TK:{" "}
                      <strong className="font-mono">
                        {request.bankInfo.accountNumber}
                      </strong>
                    </p>
                    <p>
                      Chủ TK: <strong>{request.bankInfo.accountName}</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shipper Info (when assigned) */}
          {request.assignedShipper && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <FiTruck className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-purple-800">
                  Thông tin shipper
                </h2>
              </div>
              <div className="space-y-2 text-purple-700">
                <p>
                  <strong>Tên:</strong> {request.assignedShipper.name}
                </p>
                <p>
                  <strong>Số điện thoại:</strong>{" "}
                  {request.assignedShipper.phone}
                </p>
              </div>
              {request.refundMethod === "cash" && (
                <p className="mt-4 text-sm text-purple-600 bg-white p-3 rounded">
                  💵 Shipper sẽ lấy hàng và giao tiền hoàn{" "}
                  <strong>{formatCurrency(refundAmount)}</strong> cho bạn
                </p>
              )}
            </div>
          )}

          {/* Rejection Reason */}
          {request.status === "rejected" && request.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                Lý do từ chối
              </h2>
              <p className="text-red-700">{request.rejectionReason}</p>
            </div>
          )}

          {/* Instructions for approved status */}
          {request.status === "approved" && !request.assignedShipper && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-800 mb-3">
                Thông tin
              </h2>
              <p className="text-blue-700">
                Yêu cầu của bạn đã được duyệt. Vui lòng đợi shipper được phân
                công để đến lấy hàng.
              </p>
            </div>
          )}

          {request.status === "shipping" && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-purple-800 mb-3">
                Hướng dẫn
              </h2>
              <div className="space-y-2 text-purple-700">
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

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => navigate("/returns")}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Quay lại
            </button>
            {request.status === "pending" && (
              <button
                onClick={handleCancel}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Hủy yêu cầu
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnDetailPage;
