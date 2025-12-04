import React, { useState, useEffect } from "react";
import {
  FiPackage,
  FiRefreshCw,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiEye,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { customerReturnService } from "../services/ReturnService";
import type { ReturnRequest, ReturnRequestStatus } from "../types/return";

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
        setRequests(response.data.data?.items || []);
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

  const getStatusBadge = (status: ReturnRequestStatus) => {
    const styles: Record<
      ReturnRequestStatus,
      { bg: string; text: string; label: string }
    > = {
      pending: {
        bg: "bg-mono-100",
        text: "text-mono-700",
        label: "Chờ duyệt",
      },
      approved: { bg: "bg-mono-100", text: "text-mono-700", label: "Đã duyệt" },
      rejected: { bg: "bg-mono-200", text: "text-mono-800", label: "Từ chối" },
      processing: {
        bg: "bg-mono-200",
        text: "text-mono-800",
        label: "Đang xử lý",
      },
      completed: {
        bg: "bg-mono-100",
        text: "text-mono-700",
        label: "Hoàn tất",
      },
      cancelled: { bg: "bg-gray-100", text: "text-gray-700", label: "Đã hủy" },
    };
    return styles[status] || styles.pending;
  };

  const getStatusIcon = (status: ReturnRequestStatus) => {
    const icons: Record<ReturnRequestStatus, IconType> = {
      pending: FiClock,
      approved: FiCheckCircle,
      rejected: FiXCircle,
      processing: FiRefreshCw,
      completed: FiCheckCircle,
      cancelled: FiXCircle,
    };
    return icons[status] || FiClock;
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
            Yêu Cầu Trả Hàng/Đổi Hàng
          </h1>
          <p className="text-gray-600">
            Quản lý các yêu cầu trả/đổi hàng của bạn
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
            <option value="processing">Đang xử lý</option>
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
              Các yêu cầu trả/đổi hàng sẽ hiển thị ở đây
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
                const statusBadge = getStatusBadge(request.status);
                const StatusIcon = getStatusIcon(request.status);

                return (
                  <div
                    key={request._id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Header */}
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusBadge.bg} ${statusBadge.text}`}
                        >
                          <StatusIcon className="w-4 h-4" />
                          {statusBadge.label}
                        </span>
                        <span className="text-sm text-gray-600">
                          {request.type === "RETURN" ? (
                            <>
                              <FiPackage className="inline w-4 h-4 mr-1" />
                              Trả hàng
                            </>
                          ) : (
                            <>
                              <FiRefreshCw className="inline w-4 h-4 mr-1" />
                              Đổi hàng
                            </>
                          )}
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
                      {/* Items */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Sản phẩm ({request.items.length}):
                        </p>
                        <div className="space-y-2">
                          {request.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-2 bg-gray-50 rounded"
                            >
                              <img
                                src={
                                  item.product.images?.[0]?.url ||
                                  "/placeholder.jpg"
                                }
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-black">
                                  {item.product.name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {item.variant.color?.name} - {item.size.value}{" "}
                                  - SL: {item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Lý do:
                        </p>
                        <p className="text-sm text-gray-600">
                          {request.reason}
                        </p>
                      </div>

                      {/* Refund Amount */}
                      {request.type === "RETURN" && request.refundAmount && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700">
                            Số tiền hoàn:{" "}
                            <span className="text-black">
                              {request.refundAmount.toLocaleString("vi-VN")}₫
                            </span>
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
                          className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-50 transition-colors border-l border-gray-200 text-mono-700"
                        >
                          <FiXCircle className="w-4 h-4" />
                          <span className="text-sm">Hủy</span>
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




