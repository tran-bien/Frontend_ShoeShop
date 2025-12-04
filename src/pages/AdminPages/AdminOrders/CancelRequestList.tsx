import React, { useEffect, useState } from "react";
import { adminOrderService } from "../../../services/OrderService";
import type { CancelRequest } from "../../../types/order";

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
      adminResponse: "Chỉp nhơn cho phép hủy don",
    });
    fetchRequests();
  };

  const handleReject = async (id: string) => {
    await adminOrderService.processCancelRequest(id, {
      status: "rejected",
      adminResponse: "Từ chỉi yêu c?u hủy don",
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
      <h2 className="text-2xl font-semibold mb-4">Danh sách yêu c?u hủy don</h2>
      <div className="mb-4 flex items-center gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm mã don ho?c tên khách hàng"
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
            <option value="pending">Chờ duy?t</option>
            <option value="approved">Ðã chỉp nhơn</option>
            <option value="rejected">Ðã từ chỉi</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full bg-white rounded-md overflow-hidden border">
          <thead className="bg-mono-50 text-mono-700 text-sm font-semibold uppercase">
            <tr>
              <th className="py-3 px-4 text-left border-b">Mã don</th>
              <th className="py-3 px-4 text-left border-b">Khách hàng</th>
              <th className="py-3 px-4 text-left border-b">Lý đo hủy</th>
              <th className="py-3 px-4 text-left border-b">Trạng thái</th>
              <th className="py-3 px-4 text-left border-b">Phần h?i admin</th>
              <th className="py-3 px-4 text-center border-b">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Ðang tại...
                </td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Không có yêu c?u
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
                      ? "Chờ duy?t"
                      : req.status === "approved"
                      ? "Ðã chỉp nhơn"
                      : req.status === "rejected"
                      ? "Ðã từ chỉi"
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
                            Duy?t
                          </button>
                          <button
                            className="inline-flex items-center justify-center bg-mono-800 hover:bg-mono-900 text-white text-xs px-3 py-1 rounded-full shadow-sm transition-all"
                            onClick={() => handleReject(req._id)}
                          >
                            Từ chỉi
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

