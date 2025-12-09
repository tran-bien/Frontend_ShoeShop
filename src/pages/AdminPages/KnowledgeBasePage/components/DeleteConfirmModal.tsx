import React from "react";
import { FiAlertTriangle, FiTrash2 } from "react-icons/fi";

interface DeleteConfirmModalProps {
  title: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  title,
  onClose,
  onConfirm,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <FiAlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-mono-900 mb-2">
            Xác nhận xóa?
          </h3>
          <p className="text-mono-500 mb-2">
            Bạn có chắc muốn xóa tài liệu này?
          </p>
          <p className="font-medium text-mono-700 bg-mono-100 px-3 py-1 rounded-lg">
            "{title}"
          </p>
          <p className="text-sm text-red-600 mt-3">
            Hành động này không thể hoàn tác!
          </p>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-mono-200 rounded-lg hover:bg-mono-100 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <FiTrash2 className="w-4 h-4" />
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
