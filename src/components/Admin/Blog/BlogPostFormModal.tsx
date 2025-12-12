import { useState, useRef } from "react";
import { adminBlogService } from "../../../services/BlogService";
import { blogImageService } from "../../../services/ImageService";
import type {
  BlogPost,
  BlogCategory,
  BlogPostStatus,
  CreateBlogPostData,
} from "../../../types/blog";
import toast from "react-hot-toast";
import { XMarkIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import MarkdownEditor from "./MarkdownEditor";

interface BlogPostFormModalProps {
  post: BlogPost | null;
  categories: BlogCategory[];
  onClose: () => void;
  onSuccess: () => void;
}

const BlogPostFormModal: React.FC<BlogPostFormModalProps> = ({
  post,
  categories,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const featuredImageInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: post?.title || "",
    content: post?.content || "",
    excerpt: post?.excerpt || "",
    category: post?.category._id || "",
    tags: post?.tags || ([] as string[]),
    featuredImage: post?.featuredImage || undefined,
    status: post?.status || "DRAFT",
    isHighlighted: post?.isHighlighted || false,
  });

  const [newTag, setNewTag] = useState("");

  // Handle upload featured image
  const handleUploadFeaturedImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh tối đa là 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("featuredImage", file);

      if (post) {
        // If editing existing post, use uploadFeaturedImage API
        const response = await blogImageService.uploadFeaturedImage(
          post._id,
          formDataUpload
        );
        setFormData({
          ...formData,
          featuredImage: response.data.featuredImage || {
            url: response.data.url || "",
            public_id: response.data.public_id || "",
          },
        });
      } else {
        // For new post, upload as content image (general upload without postId)
        const response = await blogImageService.uploadBlogContentImage(
          formDataUpload
        );
        setFormData({
          ...formData,
          featuredImage: {
            url: response.data.url || "",
            public_id: response.data.public_id || "",
          },
        });
      }
      toast.success("Tải ảnh đại diện thành công");
    } catch (error) {
      console.error("Failed to upload featured image:", error);
      toast.error("Không thể tải ảnh lên");
    } finally {
      setUploadingImage(false);
    }

    // Reset input
    if (featuredImageInputRef.current) {
      featuredImageInputRef.current.value = "";
    }
  };

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề");
      return;
    }

    if (!formData.category) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Vui lòng nhập nội dung");
      return;
    }

    setLoading(true);
    try {
      const submitData: CreateBlogPostData = {
        ...formData,
        status: formData.status as BlogPostStatus,
      };

      if (post) {
        await adminBlogService.updatePost(post._id, submitData);
        toast.success("Cập nhật bài viết thành công");
      } else {
        await adminBlogService.createPost(submitData);
        toast.success("Tạo bài viết thành công");
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save post:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Không thể lưu bài viết");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-mono-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-mono-black">
            {post ? "Cập nhật Bài viết" : "Tạo Bài viết Mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-mono-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-mono-600" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto flex-1"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Tiêu đề <span className="text-mono-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Nhập tiêu đề bài viết..."
              className="w-full px-4 py-2 border border-mono-200 rounded-lg focus:outline-none focus:border-mono-black"
              required
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-2">
                Danh mục <span className="text-mono-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-2 border border-mono-200 rounded-lg focus:outline-none focus:border-mono-black"
                required
              >
                <option value="">Chọn danh mục</option>
                {categories
                  .filter((cat) => cat.isActive)
                  .map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-mono-700 mb-2">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as
                      | "DRAFT"
                      | "PUBLISHED"
                      | "ARCHIVED",
                  })
                }
                className="w-full px-4 py-2 border border-mono-200 rounded-lg focus:outline-none focus:border-mono-black"
              >
                <option value="DRAFT">Bản nháp</option>
                <option value="PUBLISHED">Xuất bản</option>
                <option value="ARCHIVED">Lưu trữ</option>
              </select>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Tóm tắt
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) =>
                setFormData({ ...formData, excerpt: e.target.value })
              }
              rows={3}
              placeholder="Tóm tắt ngắn gọn về bài viết (hiển thị trong danh sách)..."
              className="w-full px-4 py-2 border border-mono-200 rounded-lg focus:outline-none focus:border-mono-black"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Nội dung <span className="text-mono-500">*</span>
            </label>
            <MarkdownEditor
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder="Nhập nội dung bài viết (hỗ trợ Markdown)..."
              minHeight={350}
            />
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Ảnh đại diện
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.featuredImage?.url || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    featuredImage: e.target.value
                      ? {
                          url: e.target.value,
                          public_id: "",
                        }
                      : undefined,
                  })
                }
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-4 py-2 border border-mono-200 rounded-lg focus:outline-none focus:border-mono-black"
              />
              <input
                type="file"
                ref={featuredImageInputRef}
                accept="image/*"
                onChange={handleUploadFeaturedImage}
                className="hidden"
              />
              <button
                type="button"
                className="px-4 py-2 bg-mono-black text-white rounded-lg hover:bg-mono-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                onClick={() => featuredImageInputRef.current?.click()}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                    Đang tải...
                  </>
                ) : (
                  <>
                    <ArrowUpTrayIcon className="w-5 h-5" />
                    Upload
                  </>
                )}
              </button>
            </div>
            {formData.featuredImage?.url && (
              <div className="mt-2 relative">
                <img
                  src={formData.featuredImage.url}
                  alt="Featured preview"
                  className="w-full h-48 object-cover rounded-lg border border-mono-200"
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, featuredImage: undefined })
                  }
                  className="absolute top-2 right-2 p-1 bg-mono-1000 text-white rounded-full hover:bg-mono-700"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Tags
            </label>

            {/* Tags List */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-mono-100 text-mono-700 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-mono-700 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add Tag */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Nhập tag và nhấn Enter..."
                className="flex-1 px-4 py-2 border border-mono-200 rounded-lg focus:outline-none focus:border-mono-black"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 text-sm font-medium text-mono-700 bg-mono-100 rounded-lg hover:bg-mono-200 transition-colors"
              >
                Thêm
              </button>
            </div>
          </div>

          {/* Is Highlighted */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isHighlighted"
              checked={formData.isHighlighted}
              onChange={(e) =>
                setFormData({ ...formData, isHighlighted: e.target.checked })
              }
              className="w-5 h-5 text-mono-black border-mono-300 rounded focus:ring-mono-black"
            />
            <label
              htmlFor="isHighlighted"
              className="text-sm font-medium text-mono-700 cursor-pointer"
            >
              Bài viết nổi bật (hiển thị ở trang chủ)
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
              {loading ? "Đang lưu..." : post ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogPostFormModal;
