import { useState } from "react";
import { adminBlogService } from "../../../services/BlogService";
import type { BlogCategory } from "../../../types/blog";
import toast from "react-hot-toast";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface BlogCategoryFormModalProps {
  category: BlogCategory | null;
  onClose: () => void;
  onSuccess: () => void;
}

const BlogCategoryFormModal: React.FC<BlogCategoryFormModalProps> = ({
  category,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
    isActive: category?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    setLoading(true);
    try {
      if (category) {
        await adminBlogService.updateCategory(category._id, formData);
        toast.success("Cập nhật danh mục thành công");
      } else {
        await adminBlogService.createCategory(formData);
        toast.success("Tạo danh mục thành công");
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save category:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Không thể lưu danh mục");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-mono-200">
          <h2 className="text-2xl font-bold text-mono-black">
            {category ? "Cập nhật Danh mục" : "Tạo Danh mục Mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-mono-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-mono-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Tên danh mục <span className="text-mono-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="VD: Tin tức, Hướng dẫn..."
              className="w-full px-4 py-2 border border-mono-200 rounded-lg focus:outline-none focus:border-mono-black"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              placeholder="Mô tả ngắn gọn về danh mục..."
              className="w-full px-4 py-2 border border-mono-200 rounded-lg focus:outline-none focus:border-mono-black"
            />
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-5 h-5 text-mono-black border-mono-300 rounded focus:ring-mono-black"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-mono-700 cursor-pointer"
            >
              Kích hoạt danh mục
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-mono-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-mono-700 bg-mono-100 rounded-lg hover:bg-mono-200 transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-mono-black rounded-lg hover:bg-mono-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Đang lưu..." : category ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogCategoryFormModal;



