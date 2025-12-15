import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface DeleteConfirmModalProps {
  open: boolean;
  title?: string;
  message?: string;
  itemName?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  open,
  title = "Xác nhận xóa",
  message = "Bạn có chắc muốn xóa mục này?",
  itemName,
  loading = false,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-mono-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-mono-black">{title}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-mono-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="w-5 h-5 text-mono-600" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-mono-600 mb-2">{message}</p>
          {itemName && (
            <p className="text-sm text-mono-500 bg-mono-50 px-3 py-2 rounded-lg">
              {"Tên: "}
              <span className="font-medium text-mono-700">{itemName}</span>
            </p>
          )}
          <p className="text-sm text-red-500 mt-3">
            Lưu ý: Hành động này không thể hoàn tác.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-mono-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-mono-700 bg-mono-100 rounded-lg hover:bg-mono-200 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Đang xóa...
              </>
            ) : (
              "Xác nhận xóa"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
