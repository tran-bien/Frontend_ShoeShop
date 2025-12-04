import React from "react";
import { FaTimes, FaCreditCard, FaExclamationCircle } from "react-icons/fa";

interface RepayOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderCode: string;
  orderAmount: number;
  loading?: boolean;
}

const RepayOrderModal: React.FC<RepayOrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  orderCode,
  orderAmount,
  loading = false,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm();
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FaCreditCard className="text-mono-500 text-xl" />
            <h2 className="text-xl font-semibold text-mono-800">
              Thanh toán lại đơn hàng
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
          <div className="mb-6">
            <div className="flex items-start gap-3 mb-4">
              <FaExclamationCircle className="text-mono-600 text-lg mt-0.5" />
              <div>
                <p className="text-mono-700 mb-2">
                  Bạn có chắc chắn muốn thanh toán lại đơn hàng{" "}
                  <span className="font-semibold text-mono-black">
                    {orderCode}
                  </span>
                  ?
                </p>
                <p className="text-sm text-mono-500">
                  Bạn sẽ được chuyển hướng đến trang thanh toán VNPAY để hoàn
                  tất giao dịch.
                </p>
              </div>
            </div>

            {/* Thông tin đơn hàng */}
            <div className="bg-mono-50 border border-mono-200 rounded-lg p-4">
              <h3 className="font-semibold text-mono-800 mb-2">
                Thông tin thanh toán
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-mono-600">Mã đơn hàng:</span>
                  <span className="font-medium">{orderCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mono-600">Phương thức:</span>
                  <span className="font-medium">VNPAY</span>
                </div>
                <hr className="border-mono-200" />
                <div className="flex justify-between">
                  <span className="text-mono-600 font-medium">Số tiền:</span>
                  <span className="font-bold text-mono-900">
                    {orderAmount.toLocaleString()}d
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="mb-6 p-3 bg-mono-100 border border-mono-200 rounded-lg">
            <p className="text-sm text-mono-800">
              <strong>Lưu ý:</strong>
            </p>
            <ul className="text-sm text-mono-700 mt-1 ml-4 list-disc">
              <li>Giao dịch sẽ được xử lý qua cổng thanh toán VNPAY</li>
              <li>Vui lòng hoàn tất thanh toán trong thời gian quy định</li>
              <li>Đơn hàng sẽ được xử lý sau khi thanh toán thành công</li>
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
              disabled={loading}
              className="flex-1 px-4 py-2 bg-mono-500 text-white rounded-lg hover:bg-mono-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Đang xử lý..." : "Thanh toán ngay"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepayOrderModal;
