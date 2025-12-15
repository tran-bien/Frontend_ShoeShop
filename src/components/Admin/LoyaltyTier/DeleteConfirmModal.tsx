import React from "react";

interface Props {
  open: boolean;
  title?: string;
  message?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

const DeleteConfirmModal: React.FC<Props> = ({
  open,
  title = "Xác nhận xóa",
  message = "Bạn có chắc muốn xóa? Hành động này không thể hoàn tác.",
  loading = false,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-mono-500 hover:text-mono-700 p-1 rounded"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-mono-600 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-mono-100 text-mono-700 rounded-lg hover:bg-mono-200"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => onConfirm()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
