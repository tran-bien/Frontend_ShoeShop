import React, { useEffect, useState } from "react";
import { adminOrderService } from "../../../services/OrderService";
import type { CancelRequest } from "../../../types/order";
import { FiRefreshCw } from "react-icons/fi";

const ITEMS_PER_PAGE = 20;

const CancelRequestList: React.FC = () => {
  const [requests, setRequests] = useState<CancelRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);

  const fetchRequests = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminOrderService.getCancelRequests({
        page,
        limit: ITEMS_PER_PAGE,
        status: statusFilter as "pending" | "approved" | "rejected" | undefined,
      });
      // BE trả về: { success, message, cancelRequests, pagination }
      setRequests(res.data.cancelRequests || []);

      // Update pagination state
      if (res.data.pagination) {
        setCurrentPage(res.data.pagination.page);
        setTotalPages(res.data.pagination.totalPages);
        setTotalRequests(res.data.pagination.total);
      }
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    await adminOrderService.processCancelRequest(id, {
      status: "approved",
      adminResponse: "Chấp nhận cho phép hủy đơn",
    });
    fetchRequests(currentPage);
  };

  const handleReject = async (id: string) => {
    await adminOrderService.processCancelRequest(id, {
      status: "rejected",
      adminResponse: "Từ chối yêu cầu hủy đơn",
    });
    fetchRequests(currentPage);
  };

  useEffect(() => {
    fetchRequests(currentPage);
  }, [currentPage, statusFilter]);

  const filteredRequests = requests.filter(
    (req) =>
      req.order.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="p-6 w-full font-sans">
      <h2 className="text-2xl font-semibold mb-4">Danh sách yêu cầu hủy đơn</h2>
      <div className="mb-4 flex items-center gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm mã đơn hoặc tên khách hàng"
          className="px-4 py-2 w-1/3 border border-mono-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-mono-600"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm">Trạng thái</span>
          <select
            className="py-1 px-2 border rounded-md"
            onChange={(e) => setStatusFilter(e.target.value)}
            value={statusFilter}
          >
            <option value="">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã chấp nhận</option>
            <option value="rejected">Đã từ chối</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full bg-white rounded-md overflow-hidden border">
          <thead className="bg-mono-50 text-mono-700 text-sm font-semibold uppercase">
            <tr>
              <th className="py-3 px-4 text-left border-b">Mã đơn</th>
              <th className="py-3 px-4 text-left border-b">Khách hàng</th>
              <th className="py-3 px-4 text-left border-b">Lý do hủy</th>
              <th className="py-3 px-4 text-left border-b">Trạng thái</th>
              <th className="py-3 px-4 text-left border-b">Phản hồi admin</th>
              <th className="py-3 px-4 text-center border-b">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Đang tải...
                </td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Không có yêu cầu
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => (
                <tr key={req._id} className="hover:bg-mono-50">
                  <td className="py-2 px-4 border-b text-sm">
                    {req.order.code}
                  </td>
                  <td className="py-2 px-4 border-b text-sm">
                    {req.user.name}
                    <br />
                    <span className="text-xs text-mono-500">
                      {req.user.phone}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b text-sm">{req.reason}</td>
                  <td className="py-2 px-4 border-b text-sm">
                    {req.status === "pending"
                      ? "Chờ duyệt"
                      : req.status === "approved"
                      ? "Đã chấp nhận"
                      : req.status === "rejected"
                      ? "Đã từ chối"
                      : req.status}
                  </td>
                  <td className="py-2 px-4 border-b text-sm">
                    {req.adminResponse || "-"}
                  </td>
                  <td className="py-2 px-4 border-b text-center text-sm">
                    <div className="flex flex-col gap-2 min-w-[120px]">
                      {req.status === "pending" ? (
                        <>
                          <button
                            className="inline-flex items-center justify-center bg-mono-700 hover:bg-mono-800 text-white text-xs px-3 py-1 rounded-full shadow-sm transition-all"
                            onClick={() => handleApprove(req._id)}
                          >
                            Duyệt
                          </button>
                          <button
                            className="inline-flex items-center justify-center bg-mono-800 hover:bg-mono-900 text-white text-xs px-3 py-1 rounded-full shadow-sm transition-all"
                            onClick={() => handleReject(req._id)}
                          >
                            Từ chối
                          </button>
                        </>
                      ) : (
                        <span>-</span>
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
      {requests.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-mono-500">
            Hiển thị {filteredRequests.length} / {totalRequests} yêu cầu • Trang{" "}
            {currentPage} / {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-mono-200 rounded-lg hover:bg-mono-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          ? "bg-mono-900 text-white"
                          : "border border-mono-200 hover:bg-mono-100"
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
              className="px-3 py-2 text-sm border border-mono-200 rounded-lg hover:bg-mono-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
            <button
              onClick={() => fetchRequests(currentPage)}
              className="px-3 py-2 text-sm border border-mono-200 rounded-lg hover:bg-mono-100 inline-flex items-center gap-1"
            >
              <FiRefreshCw size={14} />
              Làm mới
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default CancelRequestList;
