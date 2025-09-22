import React, { useEffect, useState } from "react";
import { adminOrderService } from "../../../services/OrderService";

interface CancelRequest {
  _id: string;
  order: {
    _id: string;
    code: string;
    status: string;
    totalAfterDiscountAndShipping: number;
    user: { name: string; email: string };
    payment: { method: string; paymentStatus: string };
  };
  user: {
    name: string;
    email: string;
    phone: string;
    avatar?: { url: string };
  };
  reason: string;
  status: string;
  adminResponse?: string; // Make optional to match service interface
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

const CancelRequestList: React.FC = () => {
  const [requests, setRequests] = useState<CancelRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await adminOrderService.getCancelRequests();
      // Sửa dòng này:
      setRequests(res.data.data?.cancelRequests || []);
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
    fetchRequests();
  };

  const handleReject = async (id: string) => {
    await adminOrderService.processCancelRequest(id, {
      status: "rejected",
      adminResponse: "Từ chối yêu cầu hủy đơn",
    });
    fetchRequests();
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(
    (req) =>
      (req.order.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.user.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter ? req.status === statusFilter : true)
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
          className="px-4 py-2 w-1/3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-400"
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
          <thead className="bg-gray-50 text-gray-700 text-sm font-semibold uppercase">
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
                <tr key={req._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-sm">
                    {req.order.code}
                  </td>
                  <td className="py-2 px-4 border-b text-sm">
                    {req.user.name}
                    <br />
                    <span className="text-xs text-gray-500">
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
                            className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow-sm transition-all"
                            onClick={() => handleApprove(req._id)}
                          >
                            Duyệt
                          </button>
                          <button
                            className="inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-full shadow-sm transition-all"
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
    </div>
  );
};

export default CancelRequestList;
