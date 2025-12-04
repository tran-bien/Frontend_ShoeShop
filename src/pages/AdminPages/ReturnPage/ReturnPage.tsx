import { useState, useEffect } from "react";
import { FaBox, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import { adminReturnService } from "../../../services/ReturnService";
import type { ReturnRequest } from "../../../types/return";
import ReturnDetailModal from "../../../components/Admin/Return/ReturnDetailModal";
import ApproveReturnModal from "../../../components/Admin/Return/ApproveReturnModal";
import RejectReturnModal from "../../../components/Admin/Return/RejectReturnModal";
import ProcessReturnModal from "../../../components/Admin/Return/ProcessReturnModal";

const ReturnPage = () => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [stats, setStats] = useState<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests?: number;
    completedRequests: number;
    rejectedRequests: number;
    returnRequests?: number;
    exchangeRequests?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    status: "",
    type: "",
  });

  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);

  useEffect(() => {
    fetchReturns();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filter]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = {
        page: currentPage,
        limit: 20,
      };

      if (filter.status) params.status = filter.status;
      if (filter.type) params.type = filter.type;

      const response = await adminReturnService.getAllReturnRequests(params);

      // Backend trả về { success: true, data: { items: [], pagination: {} } }
      const data = response.data.data;
      setReturns(data?.items || []);
      setTotalPages(data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching returns:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleViewDetail = (returnRequest: ReturnRequest) => {
    setSelectedReturn(returnRequest);
    setShowDetailModal(true);
  };

  const handleApprove = (returnRequest: ReturnRequest) => {
    setSelectedReturn(returnRequest);
    setShowApproveModal(true);
  };

  const handleReject = (returnRequest: ReturnRequest) => {
    setSelectedReturn(returnRequest);
    setShowRejectModal(true);
  };

  const handleProcess = (returnRequest: ReturnRequest) => {
    setSelectedReturn(returnRequest);
    setShowProcessModal(true);
  };

  const onSuccess = () => {
    fetchReturns();
    fetchStats();
    setShowApproveModal(false);
    setShowRejectModal(false);
    setShowProcessModal(false);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<
      string,
      { color: string; label: string; icon: typeof FaClock }
    > = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Chờ duyệt",
        icon: FaClock,
      },
      approved: {
        color: "bg-mono-100 text-blue-800",
        label: "Đã duyệt",
        icon: FaCheckCircle,
      },
      rejected: {
        color: "bg-red-100 text-red-800",
        label: "Từ chối",
        icon: FaTimesCircle,
      },
      processing: {
        color: "bg-purple-100 text-purple-800",
        label: "Đang xử lý",
        icon: FaBox,
      },
      completed: {
        color: "bg-green-100 text-green-800",
        label: "Hoàn thành",
        icon: FaCheckCircle,
      },
      cancelled: {
        color: "bg-mono-100 text-mono-800",
        label: "Đã hủy",
        icon: FaTimesCircle,
      },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded flex items-center gap-1 ${badge.color}`}
      >
        <Icon size={14} />
        {badge.label}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-mono-800">Quản lý Đổi trả</h1>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-mono-500 text-sm">Tổng yêu cầu</p>
                <p className="text-2xl font-bold text-mono-800">
                  {stats.totalRequests}
                </p>
              </div>
              <FaBox className="text-mono-500" size={40} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-mono-500 text-sm">Chờ duyệt</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pendingRequests}
                </p>
              </div>
              <FaClock className="text-yellow-500" size={40} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-mono-500 text-sm">Đã hoàn thành</p>
                <p className="text-2xl font-bold text-mono-800">
                  {stats.completedRequests}
                </p>
              </div>
              <FaCheckCircle className="text-mono-700" size={40} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-mono-500 text-sm">Từ chối</p>
                <p className="text-2xl font-bold text-mono-900">
                  {stats.rejectedRequests}
                </p>
              </div>
              <FaTimesCircle className="text-mono-800" size={40} />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4">
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-4 py-2 border rounded"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
            <option value="processing">Đang xử lý</option>
            <option value="completed">Hoàn thành</option>
          </select>

          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="px-4 py-2 border rounded"
          >
            <option value="">Tất cả loại</option>
            <option value="RETURN">Hoàn trả</option>
            <option value="EXCHANGE">Đổi hàng</option>
          </select>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-mono-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                Mã yêu cầu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                Loại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                Số lượng SP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-mono-500">
                  Đang tải...
                </td>
              </tr>
            ) : returns.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-mono-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              returns.map((returnRequest) => (
                <tr key={returnRequest._id} className="hover:bg-mono-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-mono-900">
                      #{returnRequest._id.slice(-8)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-mono-900">
                      {returnRequest.customer?.name || "N/A"}
                    </div>
                    <div className="text-xs text-mono-500">
                      {returnRequest.customer?.email || ""}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        returnRequest.type === "RETURN"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-mono-100 text-blue-800"
                      }`}
                    >
                      {returnRequest.type === "RETURN"
                        ? "Hoàn trả"
                        : "Đổi hàng"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-mono-900">
                      {returnRequest.items.length}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(returnRequest.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-mono-900">
                      {new Date(returnRequest.createdAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => handleViewDetail(returnRequest)}
                      className="text-mono-black hover:text-blue-800"
                    >
                      Chi tiết
                    </button>
                    {returnRequest.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(returnRequest)}
                          className="text-mono-800 hover:text-green-800"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleReject(returnRequest)}
                          className="text-mono-900 hover:text-red-800"
                        >
                          Từ chối
                        </button>
                      </>
                    )}
                    {returnRequest.status === "approved" && (
                      <button
                        onClick={() => handleProcess(returnRequest)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        Xử lý
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-mono-200 rounded disabled:opacity-50"
          >
            Trước
          </button>
          <span className="px-4 py-2">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-mono-200 rounded disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}

      {/* Modals */}
      {showDetailModal && selectedReturn && (
        <ReturnDetailModal
          returnRequest={selectedReturn}
          onClose={() => setShowDetailModal(false)}
        />
      )}
      {showApproveModal && selectedReturn && (
        <ApproveReturnModal
          returnRequest={selectedReturn}
          onClose={() => setShowApproveModal(false)}
          onSuccess={onSuccess}
        />
      )}
      {showRejectModal && selectedReturn && (
        <RejectReturnModal
          returnRequest={selectedReturn}
          onClose={() => setShowRejectModal(false)}
          onSuccess={onSuccess}
        />
      )}
      {showProcessModal && selectedReturn && (
        <ProcessReturnModal
          returnRequest={selectedReturn}
          onClose={() => setShowProcessModal(false)}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
};

export default ReturnPage;
