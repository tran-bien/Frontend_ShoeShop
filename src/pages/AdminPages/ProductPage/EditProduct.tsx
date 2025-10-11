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
      ? product.tags.map((tag: any) =>
          typeof tag === "string" ? tag : tag._id
        )
      : [],
  });
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await tagApi.getActiveTags();
        setTags(response.data.data || []);
      } catch (error) {
        console.error("Error fetching tags:", error);
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
    <div className="fixed inset-0 bg-gray-300 bg-opacity-75 flex justify-center items-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-auto relative text-black">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition duration-300"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-8 text-center">
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
            <label className="block text-sm font-medium text-black">
              Tags (Chọn nhiều)
            </label>
            <div className="border rounded-md p-3 max-h-48 overflow-y-auto bg-gray-50">
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <label
                    key={tag._id}
                    className="flex items-center space-x-2 py-1 hover:bg-gray-100 px-2 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.tags.includes(tag._id)}
                      onChange={() => handleTagToggle(tag._id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-black flex-1">
                      {tag.name}{" "}
                      <span className="text-xs text-gray-500">
                        (
                        {tag.type === "MATERIAL"
                          ? "Chất liệu"
                          : tag.type === "USECASE"
                          ? "Nhu cầu"
                          : "Tùy chỉnh"}
                        )
                      </span>
                    </span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500">Không có tags nào</p>
              )}
            </div>
            {formData.tags.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Đã chọn: {formData.tags.length} tag(s)
              </p>
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
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
