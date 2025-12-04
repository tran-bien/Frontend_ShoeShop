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
      setError("Vui lòng nhập lý đo hủy don hàng");
      return;
    }

    if (reason.trim().length < 3) {
      setError("Lý đo hủy ph?i có ít nh?t 3 ký t?");
      return;
    }

    if (reason.trim().length > 500) {
      setError("Lý đo hủy không được vu?t quá 500 ký t?");
      return;
    }

    setError("");

    try {
      await onConfirm(reason.trim());
      // Reset form sau khi thành công
      setReason("");
      setError("");
      // Không cẩn toast ? dây vì dã được xử lý trong component cha (UserOrderDetailPage)
    } catch (error: any) {
      // Ðã có xử lý lỗi ? component cha, nhung thêm xử lý ? dây d? d?m b?o
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi x?y ra khi hủy don hàng";
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
    "Thay đổi ý đếnh mua hàng",
    "Tìm được sản phẩm tuong từ với giá t?t hon",
    "Thay đổi sản phẩm/kích thước/màu sắc",
    "Sản phẩm bỏ lỗi ho?c không dúng mô t?",
    "Khác (nhập lý đo c? thể)",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-mono-800 text-xl" />
            <h2 className="text-xl font-semibold text-mono-800">
              Hủy don hàng
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-mono-400 hover:text-mono-600 disabled:opacity-50"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-mono-700 mb-2">
              Bẩn có chỉc chơn muẩn hủy don hàng{" "}
              <span className="font-semibold text-mono-black">{orderCode}</span>
              ?
            </p>
            <p className="text-sm text-mono-500">
              Vui lòng cho bi?t lý đo d? shop có thọ c?i thiện d?ch v?.
            </p>
          </div>

          {/* Predefined reasons */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Chơn lý đo có sẩn:
            </label>
            <div className="space-y-2">
              {predefinedReasons.map((predefinedReason, index) => (
                <label
                  key={index}
                  className="flex items-center cursor-pointer hover:bg-mono-50 p-2 rounded"
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
                    className="mr-2 text-mono-black focus:ring-mono-500"
                  />
                  <span className="text-sm text-mono-700">
                    {predefinedReason}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom reason input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Ho?c nhập lý đo c? th?:
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              placeholder="Nhập lý đo hủy don hàng của bẩn..."
              className="w-full p-3 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
              disabled={loading}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-mono-500">
                {reason.length}/500 ký t?
              </span>
              {error && <span className="text-xs text-mono-800">{error}</span>}
            </div>
          </div>

          {/* Warning */}
          <div className="mb-6 p-3 bg-mono-100 border border-mono-200 rounded-lg">
            <p className="text-sm text-mono-800">
              <strong>Lưu ý:</strong> Sau khi gửi yêu cầu hủy đơn hàng:
            </p>
            <ul className="text-sm text-mono-700 mt-1 ml-4 list-disc">
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
              className="flex-1 px-4 py-2 text-mono-700 bg-mono-100 rounded-lg hover:bg-mono-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="flex-1 px-4 py-2 bg-mono-800 text-white rounded-lg hover:bg-mono-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
