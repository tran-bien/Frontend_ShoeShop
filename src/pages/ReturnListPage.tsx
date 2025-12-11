import React, { useState, useEffect } from "react";
import {
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiTruck,
  FiDollarSign,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { customerReturnService } from "../services/ReturnService";
import type { ReturnRequest, ReturnRequestStatus } from "../types/return";

const RETURN_SHIPPING_FEE = 30000;

const ReturnListPage: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ReturnRequestStatus | "all">(
    "all"
  );

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params: {
        page: number;
        limit: number;
        status?: ReturnRequestStatus;
      } = { page, limit: 10 };
      if (statusFilter !== "all") params.status = statusFilter;

      const response = await customerReturnService.getReturnRequests(params);
      if (response.data.success) {
        setRequests(response.data.data?.requests || []);
        setTotalPages(response.data.data?.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching return requests:", error);
      toast.error("Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn hủy yêu cầu này?")) return;

    try {
      await customerReturnService.cancelReturnRequest(id);
      toast.success("Đã hủy yêu cầu");
      fetchRequests();
    } catch (error) {
      console.error("Error canceling request:", error);
      toast.error("Không thể hủy yêu cầu");
    }
  };

  const getStatusConfig = (
    status: ReturnRequestStatus
  ): {
    bg: string;
    text: string;
    label: string;
    icon: IconType;
  } => {
    const configs: Record<
      ReturnRequestStatus,
      { bg: string; text: string; label: string; icon: IconType }
    > = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Chờ duyệt",
        icon: FiClock,
      },
      approved: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Đã duyệt",
        icon: FiCheckCircle,
      },
      shipping: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        label: "Đang lấy hàng",
        icon: FiTruck,
      },
      received: {
        bg: "bg-indigo-100",
        text: "text-indigo-800",
        label: "Đã nhận hàng",
        icon: FiPackage,
      },
      refunded: {
        bg: "bg-teal-100",
        text: "text-teal-800",
        label: "Đã hoàn tiền",
        icon: FiDollarSign,
      },
      completed: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Hoàn tất",
        icon: FiCheckCircle,
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Từ chối",
        icon: FiXCircle,
      },
      canceled: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: "Đã hủy",
        icon: FiXCircle,
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

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "N/A";
    return amount.toLocaleString("vi-VN") + "đ";
  };

  const calculateRefund = (request: ReturnRequest) => {
    if (request.refundAmount) return request.refundAmount;
    const orderTotal = request.order?.totalAfterDiscountAndShipping || 0;
    return orderTotal - RETURN_SHIPPING_FEE;
  };

  if (loading && page === 1) {
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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2 flex items-center gap-2">
            <FiPackage className="w-8 h-8" />
            Yêu cầu trả hàng
          </h1>
          <p className="text-gray-600">
            Quản lý các yêu cầu trả hàng và hoàn tiền của bạn
          </p>
        </div>

        {/* Filter and Create Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ReturnRequestStatus | "all");
              setPage(1);
            }}
            className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="shipping">Đang lấy hàng</option>
            <option value="received">Đã nhận hàng</option>
            <option value="refunded">Đã hoàn tiền</option>
            <option value="completed">Hoàn tất</option>
            <option value="rejected">Từ chối</option>
            <option value="canceled">Đã hủy</option>
          </select>

          <button
            onClick={() => navigate("/returns/create")}
            className="w-full sm:w-auto px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Tạo yêu cầu mới
          </button>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Chưa có yêu cầu nào
            </h3>
            <p className="text-gray-500 mb-6">
              Các yêu cầu trả hàng sẽ hiển thị ở đây
            </p>
            <button
              onClick={() => navigate("/returns/create")}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Tạo yêu cầu đầu tiên
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {requests.map((request) => {
                const statusConfig = getStatusConfig(request.status);
                const StatusIcon = statusConfig.icon;
                const refundAmount = calculateRefund(request);

                return (
                  <div
                    key={request._id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Header */}
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center flex-wrap gap-2">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}
                        >
                          <StatusIcon className="w-4 h-4" />
                          {statusConfig.label}
                        </span>
                        <span className="text-sm text-gray-600 font-mono">
                          {request.code || `#${request._id.slice(-8)}`}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Order Info */}
                      <div className="mb-4 flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Đơn hàng:</span>{" "}
                          <span className="font-mono font-medium">
                            {request.order?.code || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">
                            Phương thức hoàn:
                          </span>{" "}
                          <span className="font-medium">
                            {request.refundMethod === "bank_transfer"
                              ? "Chuyển khoản"
                              : "Tiền mặt"}
                          </span>
                        </div>
                      </div>

                      {/* Products Preview */}
                      {request.order?.items &&
                        request.order.items.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Sản phẩm trả ({request.order.items.length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {request.order.items
                                .slice(0, 3)
                                .map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                                  >
                                    <img
                                      src={
                                        item.product?.images?.[0]?.url ||
                                        "/placeholder.jpg"
                                      }
                                      alt={item.product?.name || "Product"}
                                      className="w-10 h-10 object-cover rounded"
                                    />
                                    <div className="text-xs">
                                      <p className="font-medium text-gray-800 line-clamp-1">
                                        {item.product?.name || "Sản phẩm"}
                                      </p>
                                      <p className="text-gray-500">
                                        {item.variant?.color?.name} -{" "}
                                        {item.size?.value} x{item.quantity}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              {request.order.items.length > 3 && (
                                <div className="flex items-center px-3 text-sm text-gray-500">
                                  +{request.order.items.length - 3} sản phẩm
                                  khác
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      {/* Reason */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Lý do:</span>{" "}
                          {getReasonLabel(request.reason)}
                        </p>
                      </div>

                      {/* Refund Amount */}
                      <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                        <span className="text-sm text-green-700">
                          Số tiền hoàn:
                        </span>
                        <span className="text-lg font-bold text-green-700">
                          {formatCurrency(refundAmount)}
                        </span>
                      </div>

                      {/* Shipper Info (if assigned) */}
                      {request.assignedShipper && (
                        <div className="mt-3 p-3 bg-purple-50 rounded-lg flex items-center gap-3">
                          <FiTruck className="w-5 h-5 text-purple-600" />
                          <div className="text-sm text-purple-700">
                            <p className="font-medium">
                              Shipper: {request.assignedShipper.name}
                            </p>
                            <p>{request.assignedShipper.phone}</p>
                          </div>
                        </div>
                      )}

                      {/* Cash Refund Delivered */}
                      {request.refundMethod === "cash" &&
                        request.refundCollectedByShipper?.collectedAt && (
                          <div className="mt-3 p-3 bg-teal-50 rounded-lg flex items-center gap-3">
                            <FiDollarSign className="w-5 h-5 text-teal-600" />
                            <div className="text-sm text-teal-700">
                              <p className="font-medium">
                                Đã nhận tiền hoàn:{" "}
                                {formatCurrency(
                                  request.refundCollectedByShipper.amount
                                )}
                              </p>
                              <p className="text-xs">
                                {new Date(
                                  request.refundCollectedByShipper.collectedAt
                                ).toLocaleString("vi-VN")}
                              </p>
                            </div>
                          </div>
                        )}

                      {/* Rejection Reason */}
                      {request.status === "rejected" &&
                        request.rejectionReason && (
                          <div className="mt-3 p-3 bg-red-50 rounded-lg">
                            <p className="text-sm text-red-700">
                              <span className="font-medium">
                                Lý do từ chối:
                              </span>{" "}
                              {request.rejectionReason}
                            </p>
                          </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex border-t border-gray-200">
                      <button
                        onClick={() => navigate(`/returns/${request._id}`)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <FiEye className="w-4 h-4" />
                        <span className="text-sm">Chi tiết</span>
                      </button>
                      {request.status === "pending" && (
                        <button
                          onClick={() => handleCancel(request._id)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-50 transition-colors border-l border-gray-200 text-red-600"
                        >
                          <FiXCircle className="w-4 h-4" />
                          <span className="text-sm">Hủy yêu cầu</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Trước
                </button>

                <span className="text-gray-600">
                  Trang {page} / {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReturnListPage;
