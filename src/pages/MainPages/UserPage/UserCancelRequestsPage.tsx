import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/User/Sidebar";
import {
  userOrderService,
  CancelRequest,
} from "../../../services/OrderService";
import { toast } from "react-toastify";
import { FaCalendarAlt, FaClipboardList, FaInfoCircle } from "react-icons/fa";

const UserCancelRequestsPage: React.FC = () => {
  const [cancelRequests, setCancelRequests] = useState<CancelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchCancelRequests = async (status?: string) => {
    setLoading(true);
    try {
      const params: any = {
        page: 1,
        limit: 50,
      };

      if (status && status !== "all") {
        params.status = status;
      }

      const res = await userOrderService.getUserCancelRequests(params);
      setCancelRequests(res.data.data.cancelRequests || []);
    } catch (error) {
      console.error("Lỗi khi tải yêu cầu hủy đơn:", error);
      setCancelRequests([]);
      toast.error("Không thể tải danh sách yêu cầu hủy đơn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCancelRequests(statusFilter);
  }, [statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "approved":
        return "text-mono-800 bg-green-100";
      case "rejected":
        return "text-mono-900 bg-red-100";
      default:
        return "text-mono-600 bg-mono-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "approved":
        return "Đã chấp nhận";
      case "rejected":
        return "Đã từ chối";
      default:
        return status;
    }
  };

  const statusTabs = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ xử lý" },
    { key: "approved", label: "Đã chấp nhận" },
    { key: "rejected", label: "Đã từ chối" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-mono-100">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-10">
          <h1 className="text-3xl font-bold mb-6">Yêu cầu hủy đơn hàng</h1>

          {/* Tab filter */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="flex border-b">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-6 py-4 font-medium transition-colors ${
                    statusFilter === tab.key
                      ? "text-mono-black border-b-2 border-mono-black"
                      : "text-mono-600 hover:text-mono-black"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info banner */}
          <div className="bg-mono-50 border border-mono-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <FaInfoCircle className="text-mono-500 text-lg mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">
                  Thông tin về yêu cầu hủy đơn hàng
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Đơn hàng "Chờ xác nhận" sẽ được hủy ngay lập tức</li>
                  <li>• Đơn hàng "Đã xác nhận" cần chờ admin phê duyệt</li>
                  <li>• Bạn không thể hủy đơn hàng đang giao hoặc đã giao</li>
                </ul>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-mono-black"></div>
              <p className="mt-2">Đang tải...</p>
            </div>
          ) : cancelRequests.length === 0 ? (
            <div className="text-center py-8">
              <FaClipboardList className="text-mono-400 text-6xl mx-auto mb-4" />
              <p className="text-mono-500 text-lg">
                {statusFilter === "all"
                  ? "Bạn chưa có yêu cầu hủy đơn hàng nào."
                  : `Không có yêu cầu nào ở trạng thái "${
                      statusTabs.find((t) => t.key === statusFilter)?.label
                    }".`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cancelRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-white shadow-md p-6 rounded-lg border-l-4 border-l-blue-500"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-mono-800">
                        Đơn hàng: {request.order.code}
                      </h2>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {getStatusText(request.status)}
                      </span>
                    </div>
                    <div className="text-right text-sm text-mono-500">
                      <div className="flex items-center gap-1 mb-1">
                        <FaCalendarAlt />
                        <span>Gửi yêu cầu:</span>
                      </div>
                      <span>
                        {new Date(request.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Request details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-mono-700 mb-2">
                        Thông tin đơn hàng
                      </h3>
                      <div className="space-y-1 text-sm text-mono-600">
                        <p>
                          <strong>Trạng thái đơn:</strong>{" "}
                          {request.order.status}
                        </p>
                        <p>
                          <strong>Giá trị:</strong>{" "}
                          {request.order.totalAfterDiscountAndShipping?.toLocaleString()}
                          đ
                        </p>
                        <p>
                          <strong>Phương thức TT:</strong>{" "}
                          {request.order.payment.method}
                        </p>
                        <p>
                          <strong>Ngày đặt:</strong>{" "}
                          {new Date(
                            request.order.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-mono-700 mb-2">
                        Lý do hủy đơn
                      </h3>
                      <div className="bg-mono-50 p-3 rounded border text-sm text-mono-700">
                        {request.reason}
                      </div>
                    </div>
                  </div>

                  {/* Admin response */}
                  {request.adminResponse && (
                    <div className="mt-4 pt-4 border-t">
                      <h3 className="font-semibold text-mono-700 mb-2">
                        Phản hồi từ Admin
                      </h3>
                      <div className="bg-mono-50 border border-mono-200 p-3 rounded text-sm text-blue-800">
                        {request.adminResponse}
                      </div>
                      {request.resolvedAt && (
                        <p className="text-xs text-mono-500 mt-2">
                          Xử lý vào:{" "}
                          {new Date(request.resolvedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCancelRequestsPage;
