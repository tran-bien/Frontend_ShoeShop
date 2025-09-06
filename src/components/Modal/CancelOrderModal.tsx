import React, { useState } from "react";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";
// Thay đổi từ react-toastify sang react-hot-toast
import toast from "react-hot-toast";

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  orderCode: string;
  loading?: boolean;
}

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  orderCode,
  loading = false,
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do hủy đơn hàng");
      return;
    }

    if (reason.trim().length < 3) {
      setError("Lý do hủy phải có ít nhất 3 ký tự");
      return;
    }

    if (reason.trim().length > 500) {
      setError("Lý do hủy không được vượt quá 500 ký tự");
      return;
    }

    setError("");

    try {
      await onConfirm(reason.trim());
      // Reset form sau khi thành công
      setReason("");
      setError("");
      // Không cần toast ở đây vì đã được xử lý trong component cha (UserOrderDetailPage)
    } catch (error: any) {
      // Đã có xử lý lỗi ở component cha, nhưng thêm xử lý ở đây để đảm bảo
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra khi hủy đơn hàng";
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setReason("");
      setError("");
      onClose();
    }
  };

  const predefinedReasons = [
    "Thay đổi ý định mua hàng",
    "Tìm được sản phẩm tương tự với giá tốt hơn",
    "Thay đổi sản phẩm/kích thước/màu sắc",
    "Sản phẩm bị lỗi hoặc không đúng mô tả",
    "Khác (nhập lý do cụ thể)",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-red-500 text-xl" />
            <h2 className="text-xl font-semibold text-gray-800">
              Hủy đơn hàng
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              Bạn có chắc chắn muốn hủy đơn hàng{" "}
              <span className="font-semibold text-blue-600">{orderCode}</span>?
            </p>
            <p className="text-sm text-gray-500">
              Vui lòng cho biết lý do để shop có thể cải thiện dịch vụ.
            </p>
          </div>

          {/* Predefined reasons */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn lý do có sẵn:
            </label>
            <div className="space-y-2">
              {predefinedReasons.map((predefinedReason, index) => (
                <label
                  key={index}
                  className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="radio"
                    name="predefinedReason"
                    value={predefinedReason}
                    checked={reason === predefinedReason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      setError("");
                    }}
                    disabled={loading}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {predefinedReason}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom reason input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hoặc nhập lý do cụ thể:
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              placeholder="Nhập lý do hủy đơn hàng của bạn..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
              disabled={loading}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">
                {reason.length}/500 ký tự
              </span>
              {error && <span className="text-xs text-red-500">{error}</span>}
            </div>
          </div>

          {/* Warning */}
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Lưu ý:</strong> Sau khi gửi yêu cầu hủy đơn hàng:
            </p>
            <ul className="text-sm text-yellow-700 mt-1 ml-4 list-disc">
              <li>Đơn hàng chờ xác nhận sẽ được hủy ngay lập tức</li>
              <li>Đơn hàng đã xác nhận cần chờ admin phê duyệt</li>
              <li>Bạn không thể thay đổi lý do sau khi gửi</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Đang xử lý..." : "Xác nhận hủy đơn"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelOrderModal;
