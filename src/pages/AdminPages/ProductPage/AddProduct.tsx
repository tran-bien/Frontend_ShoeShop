import React, { useState, useEffect } from "react";
import { productApi } from "../../../services/ProductService";
import { brandApi } from "../../../services/BrandService";
import { categoryApi } from "../../../services/CategoryService";
import { tagApi } from "../../../services/TagService";

interface AddProductProps {
  handleClose: () => void;
}

interface Brand {
  _id: string;
  name: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Tag {
  _id: string;
  name: string;
  type: "MATERIAL" | "USECASE" | "CUSTOM";
}

const AddProduct: React.FC<AddProductProps> = ({ handleClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    brand: "",
    tags: [] as string[],
  });
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Lấy danh sách brand
    const fetchBrands = async () => {
      try {
        const res = await brandApi.getAll();
        setBrands(res.data.data || []);
      } catch {
        setBrands([]);
      }
    };
    // Lấy danh sách category
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAll();
        setCategories(res.data.data || []);
      } catch {
        setCategories([]);
      }
    };
    // Lấy danh sách tags
    const fetchTags = async () => {
      try {
        const res = await tagApi.getActiveTags();
        setTags(res.data.data || []);
      } catch {
        setTags([]);
      }
    };
    fetchBrands();
    fetchCategories();
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await productApi.create(formData);
      handleClose();
    } catch (err: any) {
      setError("Thêm sản phẩm thất bại!");
    } finally {
      setLoading(false);
    }
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
        <h2 className="text-xl font-bold mb-8 text-center">Thêm Sản Phẩm</h2>
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
              required
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
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-black">
              Danh Mục
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat._id} - {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-black">
              Thương Hiệu
            </label>
            <select
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">-- Chọn thương hiệu --</option>
              {brands.map((brand) => (
                <option key={brand._id} value={brand._id}>
                  {brand._id} - {brand.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-2">
              Tags (Chọn nhiều)
            </label>
            <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
              {tags.length === 0 ? (
                <p className="text-gray-500 text-sm">Không có tags nào</p>
              ) : (
                <div className="space-y-2">
                  {tags.map((tag) => (
                    <label
                      key={tag._id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.tags.includes(tag._id)}
                        onChange={() => handleTagToggle(tag._id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm">
                        {tag.name}
                        <span className="ml-2 text-xs text-gray-500">
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
                  ))}
                </div>
              )}
            </div>
            {formData.tags.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Đã chọn: {formData.tags.length} tag(s)
              </p>
            )}
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end">
            `
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
            >
              {loading ? "Đang thêm..." : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
