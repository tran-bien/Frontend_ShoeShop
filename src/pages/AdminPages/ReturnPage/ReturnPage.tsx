/**
 * Admin ReturnPage - Quản lý yêu cầu trả hàng
 * (Đã loại bỏ logic đổi hàng - chỉ có trả hàng/hoàn tiền)
 */
import { useState, useEffect, useCallback } from "react";
import {
  FiPackage,
  FiClock,
  FiCheck,
  FiX,
  FiTruck,
  FiDollarSign,
  FiRefreshCw,
  FiFilter,
  FiEye,
  FiUserCheck,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { adminReturnService } from "../../../services/ReturnService";
import { adminShipperService } from "../../../services/ShipperService";
import type { ReturnRequest, ReturnRequestStatus } from "../../../types/return";
import ReturnDetailModal from "../../../components/Admin/Return/ReturnDetailModal";

// ===== STATUS CONFIG =====
const STATUS_CONFIG: Record<
  ReturnRequestStatus,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Chờ duyệt",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    icon: <FiClock size={14} />,
  },
  approved: {
    label: "Đã duyệt",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    icon: <FiCheck size={14} />,
  },
  shipping: {
    label: "Shipper đang lấy",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    icon: <FiTruck size={14} />,
  },
  received: {
    label: "Đã nhận hàng",
    color: "text-indigo-700",
    bgColor: "bg-indigo-50",
    icon: <FiPackage size={14} />,
  },
  refunded: {
    label: "Đã hoàn tiền",
    color: "text-teal-700",
    bgColor: "bg-teal-50",
    icon: <FiDollarSign size={14} />,
  },
  completed: {
    label: "Hoàn tất",
    color: "text-green-700",
    bgColor: "bg-green-50",
    icon: <FiCheck size={14} />,
  },
  rejected: {
    label: "Từ chối",
    color: "text-red-700",
    bgColor: "bg-red-50",
    icon: <FiX size={14} />,
  },
  cancel_pending: {
    label: "Chờ duyệt hủy",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    icon: <FiClock size={14} />,
  },
  canceled: {
    label: "Đã hủy",
    color: "text-gray-500",
    bgColor: "bg-gray-100",
    icon: <FiX size={14} />,
  },
};

const REASON_LABELS: Record<string, string> = {
  wrong_size: "Sai kích cỡ",
  wrong_product: "Sai sản phẩm",
  defective: "Sản phẩm lỗi",
  not_as_described: "Không giống mô tả",
  changed_mind: "Đổi ý",
  other: "Lý do khác",
};

interface Shipper {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

const ReturnPage = () => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [stats, setStats] = useState<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests?: number;
    shippingRequests?: number;
    receivedRequests?: number;
    completedRequests: number;
    rejectedRequests: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");

  // Modal states
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showConfirmTransferModal, setShowConfirmTransferModal] =
    useState(false);
  const [showApproveCancelModal, setShowApproveCancelModal] = useState(false);

  // Form states
  const [note, setNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [selectedShipperId, setSelectedShipperId] = useState("");
  const [shippers, setShippers] = useState<Shipper[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = {
        page: currentPage,
        limit: 20,
      };
      if (filterStatus) params.status = filterStatus;

      const response = await adminReturnService.getAllReturnRequests(params);
      const data = response.data.data;
      setReturns(data?.requests || []);
      setTotalPages(data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching returns:", error);
      toast.error("Không thể tải danh sách");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus]);

  const fetchStats = async () => {
    try {
      const response = await adminReturnService.getReturnStats();
      const statsData = response.data.data || response.data;
      if ("totalRequests" in statsData) {
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchShippers = async () => {
    try {
      const response = await adminShipperService.getShippers({
        available: true,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = response.data as any;
      setShippers(data.data?.shippers || data.shippers || []);
    } catch (error) {
      console.error("Error fetching shippers:", error);
    }
  };

  useEffect(() => {
    fetchReturns();
    fetchStats();
  }, [fetchReturns]);

  // Approve return request
  const handleApprove = async () => {
    if (!selectedReturn) return;
    try {
      setActionLoading(true);
      await adminReturnService.approveReturnRequest(selectedReturn._id, {
        note,
      });
      toast.success("Đã duyệt yêu cầu trả hàng");
      setShowApproveModal(false);
      resetModal();
      fetchReturns();
      fetchStats();
    } catch (error) {
      console.error("Error approving:", error);
      toast.error("Không thể duyệt yêu cầu");
    } finally {
      setActionLoading(false);
    }
  };

  // Reject return request
  const handleReject = async () => {
    if (!selectedReturn || !rejectReason) return;
    try {
      setActionLoading(true);
      await adminReturnService.rejectReturnRequest(selectedReturn._id, {
        reason: rejectReason,
      });
      toast.success("Đã từ chối yêu cầu trả hàng");
      setShowRejectModal(false);
      resetModal();
      fetchReturns();
      fetchStats();
    } catch (error) {
      console.error("Error rejecting:", error);
      toast.error("Không thể từ chối yêu cầu");
    } finally {
      setActionLoading(false);
    }
  };

  // Assign shipper
  const handleAssignShipper = async () => {
    if (!selectedReturn || !selectedShipperId) return;
    try {
      setActionLoading(true);
      await adminReturnService.assignShipperForReturn(selectedReturn._id, {
        shipperId: selectedShipperId,
      });
      toast.success("Đã phân công shipper lấy hàng trả");
      setShowAssignModal(false);
      resetModal();
      fetchReturns();
    } catch (error) {
      console.error("Error assigning shipper:", error);
      toast.error("Không thể phân công shipper");
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm bank transfer
  const handleConfirmTransfer = async () => {
    if (!selectedReturn) return;
    try {
      setActionLoading(true);
      await adminReturnService.confirmBankTransfer(selectedReturn._id, {
        note,
      });
      toast.success("Đã xác nhận chuyển khoản hoàn tiền");
      setShowConfirmTransferModal(false);
      resetModal();
      fetchReturns();
      fetchStats();
    } catch (error) {
      console.error("Error confirming transfer:", error);
      toast.error("Không thể xác nhận");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle approve cancel request (admin duyệt yêu cầu hủy từ khách)
  const handleApproveCancel = async (approved: boolean) => {
    if (!selectedReturn) return;
    try {
      setActionLoading(true);
      await adminReturnService.approveCancelReturn(selectedReturn._id, {
        approved,
        note,
      });
      toast.success(
        approved
          ? "Đã duyệt hủy yêu cầu trả hàng"
          : "Đã từ chối hủy, tiếp tục xử lý trả hàng"
      );
      setShowApproveCancelModal(false);
      resetModal();
      fetchReturns();
      fetchStats();
    } catch (error) {
      console.error("Error handling cancel approval:", error);
      toast.error("Không thể xử lý");
    } finally {
      setActionLoading(false);
    }
  };

  const resetModal = () => {
    setSelectedReturn(null);
    setNote("");
    setRejectReason("");
    setSelectedShipperId("");
  };

  const openAssignModal = (returnReq: ReturnRequest) => {
    setSelectedReturn(returnReq);
    fetchShippers();
    setShowAssignModal(true);
  };

  const formatCurrency = (amount: number) => {
    return amount?.toLocaleString("vi-VN") + "đ";
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Trả hàng</h1>
          <p className="text-gray-600 mt-1">
            Xử lý yêu cầu trả hàng và hoàn tiền
          </p>
        </div>
        <button
          onClick={() => {
            fetchReturns();
            fetchStats();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <FiRefreshCw size={16} />
          Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FiPackage className="text-gray-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng yêu cầu</p>
                <p className="text-xl font-bold">{stats.totalRequests}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <FiClock className="text-amber-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Chờ duyệt</p>
                <p className="text-xl font-bold text-amber-600">
                  {stats.pendingRequests}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <FiCheck className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Hoàn tất</p>
                <p className="text-xl font-bold text-green-600">
                  {stats.completedRequests}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <FiX className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Từ chối</p>
                <p className="text-xl font-bold text-red-600">
                  {stats.rejectedRequests}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
        <div className="flex items-center gap-4">
          <FiFilter className="text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="shipping">Shipper đang lấy</option>
            <option value="received">Đã nhận hàng</option>
            <option value="refunded">Đã hoàn tiền</option>
            <option value="completed">Hoàn tất</option>
            <option value="rejected">Từ chối</option>
            <option value="cancel_pending">Chờ duyệt hủy</option>
            <option value="canceled">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Mã yêu cầu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Đơn hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Hoàn tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Phương thức
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                </td>
              </tr>
            ) : returns.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <FiPackage className="mx-auto text-gray-300 mb-2" size={32} />
                  Không có yêu cầu nào
                </td>
              </tr>
            ) : (
              returns.map((returnReq) => (
                <tr key={returnReq._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">
                      {returnReq.code || returnReq._id.slice(-8).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {returnReq.customer?.name || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {returnReq.customer?.phone || returnReq.customer?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-blue-600">
                      {returnReq.order?.code || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-green-600">
                      {formatCurrency(returnReq.refundAmount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        returnReq.refundMethod === "cash"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {returnReq.refundMethod === "cash"
                        ? "Tiền mặt"
                        : "Chuyển khoản"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                        STATUS_CONFIG[returnReq.status]?.bgColor
                      } ${STATUS_CONFIG[returnReq.status]?.color}`}
                    >
                      {STATUS_CONFIG[returnReq.status]?.icon}
                      {STATUS_CONFIG[returnReq.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(returnReq.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedReturn(returnReq);
                          setShowDetailModal(true);
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Chi tiết"
                      >
                        <FiEye size={16} />
                      </button>

                      {returnReq.status === "pending" && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedReturn(returnReq);
                              setShowApproveModal(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Duyệt"
                          >
                            <FiCheck size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReturn(returnReq);
                              setShowRejectModal(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Từ chối"
                          >
                            <FiX size={16} />
                          </button>
                        </>
                      )}

                      {returnReq.status === "approved" && (
                        <button
                          onClick={() => openAssignModal(returnReq)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                          title="Phân công Shipper"
                        >
                          <FiUserCheck size={16} />
                        </button>
                      )}

                      {returnReq.status === "received" &&
                        returnReq.refundMethod === "bank_transfer" && (
                          <button
                            onClick={() => {
                              setSelectedReturn(returnReq);
                              setShowConfirmTransferModal(true);
                            }}
                            className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg"
                            title="Xác nhận chuyển khoản"
                          >
                            <FiDollarSign size={16} />
                          </button>
                        )}

                      {returnReq.status === "cancel_pending" && (
                        <button
                          onClick={() => {
                            setSelectedReturn(returnReq);
                            setShowApproveCancelModal(true);
                          }}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                          title="Duyệt hủy yêu cầu"
                        >
                          <FiCheck size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - Luôn hiển thị khi có data */}
      {returns.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Hiển thị {returns.length} yêu cầu • Trang {currentPage} /{" "}
            {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm rounded-lg ${
                        currentPage === pageNum
                          ? "bg-gray-900 text-white"
                          : "border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
            )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReturn && (
        <ReturnDetailModal
          returnRequest={selectedReturn}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedReturn(null);
          }}
        />
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedReturn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Duyệt yêu cầu trả hàng</h2>
            <p className="text-gray-600 mb-4">
              Bạn xác nhận duyệt yêu cầu trả hàng{" "}
              <strong>{selectedReturn.code}</strong> của khách hàng{" "}
              <strong>{selectedReturn.customer?.name}</strong>?
            </p>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm">
                <span className="text-gray-600">Lý do:</span>{" "}
                {REASON_LABELS[selectedReturn.reason] || selectedReturn.reason}
              </p>
              <p className="text-sm mt-1">
                <span className="text-gray-600">Hoàn tiền:</span>{" "}
                <span className="font-semibold text-green-600">
                  {formatCurrency(selectedReturn.refundAmount)}
                </span>
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú..."
                rows={3}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  resetModal();
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={actionLoading}
              >
                Hủy
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? "Đang xử lý..." : "Duyệt"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedReturn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Từ chối yêu cầu trả hàng</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Lý do từ chối *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                rows={3}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  resetModal();
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={actionLoading}
              >
                Hủy
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectReason}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? "Đang xử lý..." : "Từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Shipper Modal */}
      {showAssignModal && selectedReturn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Phân công Shipper</h2>
            <p className="text-gray-600 mb-4">
              Chọn shipper để lấy hàng trả từ khách hàng
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Chọn Shipper *
              </label>
              <select
                value={selectedShipperId}
                onChange={(e) => setSelectedShipperId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">-- Chọn shipper --</option>
                {shippers.map((shipper) => (
                  <option key={shipper._id} value={shipper._id}>
                    {shipper.name} - {shipper.phone || shipper.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-black-900">
              <p>
                Shipper sẽ đến địa chỉ khách hàng để lấy hàng trả
                {selectedReturn.refundMethod === "cash" &&
                  " và giao tiền hoàn " +
                    formatCurrency(selectedReturn.refundAmount)}
                .
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  resetModal();
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={actionLoading}
              >
                Hủy
              </button>
              <button
                onClick={handleAssignShipper}
                disabled={actionLoading || !selectedShipperId}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50"
              >
                {actionLoading ? "Đang xử lý..." : "Phân công"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Bank Transfer Modal */}
      {showConfirmTransferModal && selectedReturn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Xác nhận chuyển khoản</h2>
            <p className="text-gray-600 mb-4">
              Bạn xác nhận đã chuyển khoản{" "}
              <strong className="text-green-600">
                {formatCurrency(selectedReturn.refundAmount)}
              </strong>{" "}
              hoàn tiền cho khách hàng?
            </p>
            {selectedReturn.bankInfo && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                <p>
                  <span className="text-gray-600">Ngân hàng:</span>{" "}
                  {selectedReturn.bankInfo.bankName}
                </p>
                <p>
                  <span className="text-gray-600">Số TK:</span>{" "}
                  {selectedReturn.bankInfo.accountNumber}
                </p>
                <p>
                  <span className="text-gray-600">Chủ TK:</span>{" "}
                  {selectedReturn.bankInfo.accountName}
                </p>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Mã giao dịch, ghi chú..."
                rows={3}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmTransferModal(false);
                  resetModal();
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={actionLoading}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmTransfer}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                {actionLoading ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Cancel Modal - Duyệt yêu cầu hủy từ khách */}
      {showApproveCancelModal && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Duyệt yêu cầu hủy trả hàng
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Khách hàng muốn hủy yêu cầu trả hàng này.
            </p>
            {selectedReturn.cancelReason && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium text-orange-800">
                    Lý do hủy:
                  </span>{" "}
                  <span className="text-orange-700">
                    {selectedReturn.cancelReason}
                  </span>
                </p>
                {selectedReturn.cancelRequestedAt && (
                  <p className="text-xs text-orange-600 mt-1">
                    Yêu cầu lúc:{" "}
                    {new Date(selectedReturn.cancelRequestedAt).toLocaleString(
                      "vi-VN"
                    )}
                  </p>
                )}
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú..."
                rows={2}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <p className="text-xs text-gray-500 mb-4">
              <strong>Lưu ý:</strong> Nếu duyệt hủy, đơn hàng sẽ chuyển về trạng
              thái "Đã giao" và khách không thể yêu cầu trả hàng nữa.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApproveCancelModal(false);
                  resetModal();
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={actionLoading}
              >
                Đóng
              </button>
              <button
                onClick={() => handleApproveCancel(false)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? "..." : "Từ chối hủy"}
              </button>
              <button
                onClick={() => handleApproveCancel(true)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {actionLoading ? "..." : "Duyệt hủy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnPage;
