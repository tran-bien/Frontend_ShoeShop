import React, { useState, useEffect } from "react";
import { FiX, FiSave, FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";
import { adminKnowledgeService } from "../../../../services/KnowledgeService";
import type {
  KnowledgeDocument,
  KnowledgeCategory,
  CreateKnowledgeDocumentData,
  UpdateKnowledgeDocumentData,
} from "../../../../types/knowledge";

interface Category {
  value: KnowledgeCategory;
  label: string;
  icon: string;
}

interface KnowledgeModalProps {
  document: KnowledgeDocument | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

const KnowledgeModal: React.FC<KnowledgeModalProps> = ({
  document,
  categories,
  onClose,
  onSuccess,
}) => {
  const isEdit = !!document;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "category_info" as KnowledgeCategory,
    tags: "",
    priority: 1,
    isActive: true,
  });

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title,
        content: document.content,
        category: document.category,
        tags: document.tags.join(", "),
        priority: document.priority || 1,
        isActive: document.isActive,
      });
    }
  }, [document]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Vui lòng nhập tiêu đề và nội dung");
      return;
    }

    setIsLoading(true);
    try {
      const baseData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
        priority: formData.priority,
        isActive: formData.isActive,
      };

      if (isEdit && document) {
        await adminKnowledgeService.updateDocument(
          document._id,
          baseData as UpdateKnowledgeDocumentData
        );
        toast.success("Đã cập nhật dữ liệu");
      } else {
        await adminKnowledgeService.createDocument(
          baseData as CreateKnowledgeDocumentData
        );
        toast.success("Đã tạo dữ liệu mới");
      }
      onSuccess();
    } catch (error) {
      console.error("Save error:", error);
      toast.error(isEdit ? "Không thể cập nhật" : "Không thể tạo dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-mono-200">
          <h2 className="text-xl font-semibold text-mono-900">
            {isEdit ? "Chỉnh sửa dữ liệu" : "Thêm dữ liệu mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-mono-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-1">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Nhập tiêu đề dữ liệu"
              className="w-full px-4 py-2 border border-mono-200 rounded-lg focus:ring-2 focus:ring-mono-900 focus:border-transparent"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-1">
              Danh mục
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as KnowledgeCategory,
                })
              }
              className="w-full px-4 py-2 border border-mono-200 rounded-lg focus:ring-2 focus:ring-mono-900 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-1">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="Nhập nội dung dữ liệu (AI sẽ học từ nội dung này)"
              rows={8}
              className="w-full px-4 py-2 border border-mono-200 rounded-lg focus:ring-2 focus:ring-mono-900 focus:border-transparent resize-none"
              required
            />
            <p className="text-xs text-mono-500 mt-1">
              Nội dung này sẽ được AI sử dụng để trả lời câu hỏi của khách hàng
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              placeholder="Nhập tags, cách nhau bằng dấu phẩy (vd: đổi trả, hoàn tiền, bảo hành)"
              className="w-full px-4 py-2 border border-mono-200 rounded-lg focus:ring-2 focus:ring-mono-900 focus:border-transparent"
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-mono-200 peer-focus:ring-2 peer-focus:ring-mono-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-mono-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
            <span className="text-sm text-mono-700">
              {formData.isActive ? "Đang hoạt động" : "Đã tắt"}
            </span>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-mono-200 bg-mono-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-mono-200 rounded-lg hover:bg-mono-100 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-mono-900 text-white rounded-lg hover:bg-mono-800 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <FiLoader className="w-4 h-4 animate-spin" />
            ) : (
              <FiSave className="w-4 h-4" />
            )}
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeModal;
