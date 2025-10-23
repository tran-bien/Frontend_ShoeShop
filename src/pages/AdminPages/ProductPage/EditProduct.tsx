import React, { useState, useEffect } from "react";
import { Product } from "../../../types/product";
import { tagApi } from "../../../services/TagService";

interface Tag {
  _id: string;
  name: string;
  type: "MATERIAL" | "USECASE" | "CUSTOM";
  description?: string;
  isActive: boolean;
}

interface EditProductProps {
  handleClose: () => void;
  product: Product;
}

const EditProduct: React.FC<EditProductProps> = ({ handleClose, product }) => {
  const [formData, setFormData] = useState({
    ...product,
    tags: Array.isArray(product.tags)
      ? product.tags.map((tag: string | { _id: string }) =>
          typeof tag === "string" ? tag : tag._id
        )
      : [],
  });
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      setLoadingTags(true);
      try {
        const response = await tagApi.getActiveTags();
        const tagsData =
          response.data.data || response.data.tags || response.data || [];
        console.log("Tags loaded in EditProduct:", tagsData);
        setTags(tagsData);
      } catch (error) {
        console.error("Error fetching tags:", error);
        setTags([]);
      } finally {
        setLoadingTags(false);
      }
    };
    fetchTags();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTagToggle = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Product updated:", formData);
    handleClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl relative text-black max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all text-2xl font-bold"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Chỉnh Sửa Sản Phẩm
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-black">
              Tên Sản Phẩm
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-black">Slug</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-black">
              Mô Tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            ></textarea>
          </div>{" "}
          <div className="mb-4">
            <label className="block text-sm font-medium text-black">
              Danh Mục
            </label>
            <input
              type="text"
              name="category"
              value={
                typeof formData.category === "object"
                  ? formData.category?.name || ""
                  : formData.category || ""
              }
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>{" "}
          <div className="mb-4">
            <label className="block text-sm font-medium text-black">
              Thương Hiệu
            </label>
            <input
              type="text"
              name="brand"
              value={
                typeof formData.brand === "object"
                  ? formData.brand?.name || ""
                  : formData.brand || ""
              }
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />{" "}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-black">
              Trạng Thái Kho
            </label>
            <select
              name="stockStatus"
              value={formData.stockStatus}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="in_stock">Còn hàng</option>
              <option value="low_stock">Sắp hết hàng</option>
              <option value="out_of_stock">Hết hàng</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (Chọn nhiều)
            </label>
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto">
              {loadingTags ? (
                <div className="flex items-center justify-center py-8">
                  <svg
                    className="animate-spin h-8 w-8 text-blue-500"
                    viewBox="0 0 24 24"
                  >
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
                  <span className="ml-3 text-gray-600">Đang tải tags...</span>
                </div>
              ) : tags.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {tags.map((tag) => (
                    <label
                      key={tag._id}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-white p-3 rounded-lg border border-transparent hover:border-blue-300 transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={formData.tags.includes(tag._id)}
                        onChange={() => handleTagToggle(tag._id)}
                        className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="flex-1 text-sm font-medium text-gray-800">
                        {tag.name}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          tag.type === "MATERIAL"
                            ? "bg-blue-100 text-blue-700"
                            : tag.type === "USECASE"
                            ? "bg-green-100 text-green-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {tag.type === "MATERIAL"
                          ? "Chất liệu"
                          : tag.type === "USECASE"
                          ? "Nhu cầu"
                          : "Tùy chỉnh"}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">
                    Không có tags nào
                  </p>
                </div>
              )}
            </div>
            {formData.tags.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Đã chọn: {formData.tags.length} tag(s)
                </span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tags: [] })}
                  className="text-xs text-red-500 hover:text-red-700 underline"
                >
                  Xóa tất cả
                </button>
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-black">
              Hình Ảnh
            </label>
            <input
              type="file"
              name="images"
              onChange={handleChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border file:border-gray-300 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-all font-medium flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Lưu Thay Đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
