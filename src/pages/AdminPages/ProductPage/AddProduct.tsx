import React, { useState, useEffect } from "react";
import { Tag } from "../../../types/tag";
import { Brand } from "../../../types/brand";
import { Category } from "../../../types/category";
import { productAdminService } from "../../../services/ProductService";
import { adminBrandService } from "../../../services/BrandService";
import { adminCategoryService } from "../../../services/CategoryService";
import { adminTagService } from "../../../services/TagService";

interface AddProductProps {
  handleClose: () => void;
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
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        // L?y tất cả dữ liệu song song
        const [brandsRes, categoriesRes, tagsRes] = await Promise.all([
          adminBrandService.getAll(),
          adminCategoryService.getAll(),
          adminTagService.getActiveTags(),
        ]);

        setBrands(
          brandsRes.data.data || (brandsRes.data as unknown as Brand[]) || []
        );
        setCategories(
          categoriesRes.data.data ||
            (categoriesRes.data as unknown as Category[]) ||
            []
        );

        // Try different response structures
        const tagsData =
          tagsRes.data.data ||
          tagsRes.data.tags ||
          (tagsRes.data as unknown as Tag[]) ||
          [];
        console.log("Tags loaded:", tagsData);
        setTags(tagsData as Tag[]);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại!");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
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

    // Frontend validation
    if (!formData.name.trim()) {
      setError("Tên sản phẩm không được d? trống!");
      setLoading(false);
      return;
    }
    if (formData.name.trim().length < 2 || formData.name.trim().length > 200) {
      setError("Tên sản phẩm ph?i có từ 2-200 ký t?!");
      setLoading(false);
      return;
    }
    if (!formData.description.trim()) {
      setError("Mô từ sản phẩm không được d? trống!");
      setLoading(false);
      return;
    }
    if (
      formData.description.trim().length < 10 ||
      formData.description.trim().length > 1000
    ) {
      setError("Mô tả sản phẩm phải có từ 10-1000 ký tự!");
      setLoading(false);
      return;
    }
    if (!formData.category) {
      setError("Vui lòng chọn danh mục!");
      setLoading(false);
      return;
    }
    if (!formData.brand) {
      setError("Vui lòng chọn thương hiệu!");
      setLoading(false);
      return;
    }

    try {
      console.log("Submitting product data:", formData);
      await productAdminService.createProduct(formData);
      handleClose();
      // Show success notification if available
      if (window.location.reload) {
        window.location.reload();
      }
    } catch (err: unknown) {
      console.error("Create product error:", err);
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage =
        error.response?.data?.message || "Thêm sản phẩm thểt b?i!";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl relative text-black max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-mono-100 text-mono-400 hover:text-mono-800 transition-all text-2xl font-bold"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-6 text-mono-800">
          Thêm Sẩn Ph?m Mới
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-mono-700 mb-1">
              Tên Sẩn Ph?m <span className="text-mono-800">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nhập tên sản phẩm..."
              className="mt-1 block w-full px-4 py-2 border-2 border-mono-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-mono-700 mb-1">
              Mô Từ <span className="text-mono-800">*</span>
            </label>
            <div className="relative">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Mô từ chi tiết v? sản phẩm: chỉt li?u, d?c di?m nội b?t, công đếng..."
                className="mt-1 block w-full px-4 py-3 border-2 border-mono-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-mono-500 resize-none"
                maxLength={1000}
              ></textarea>
              <div className="absolute bottom-2 right-2 text-xs text-mono-400">
                {formData.description.length}/1000
              </div>
            </div>
            <p className="mt-1 text-xs text-mono-500">
              💡 Mô tả chi tiết giúp khách hàng hiểu rõ hơn về sản phẩm
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Danh Mục <span className="text-mono-800">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-2 border-2 border-mono-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Thương Hiệu <span className="text-mono-800">*</span>
              </label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-2 border-2 border-mono-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
              >
                <option value="">-- Chọn thương hiệu --</option>
                {brands.map((brand) => (
                  <option key={brand._id} value={brand._id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Tags (Chọn nhiều)
            </label>
            <div className="border-2 border-mono-300 rounded-lg p-4 bg-mono-50 max-h-64 overflow-y-auto">
              {loadingData ? (
                <div className="flex items-center justify-center py-8">
                  <svg
                    className="animate-spin h-8 w-8 text-mono-500"
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
                  <span className="ml-3 text-mono-600">Đang tải tags...</span>
                </div>
              ) : tags.length === 0 ? (
                <div className="text-center py-8">
                  <svg
                    className="mx-auto h-12 w-12 text-mono-400"
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
                  <p className="mt-2 text-sm text-mono-500">
                    Không có tags nào
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {tags.map((tag) => (
                    <label
                      key={tag._id}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-white p-3 rounded-lg border border-transparent hover:border-mono-400 transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={formData.tags.includes(tag._id)}
                        onChange={() => handleTagToggle(tag._id)}
                        className="w-5 h-5 text-mono-black border-2 border-mono-300 rounded focus:ring-2 focus:ring-mono-500 cursor-pointer"
                      />
                      <span className="flex-1 text-sm font-medium text-mono-800">
                        {tag.name}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          tag.type === "MATERIAL"
                            ? "bg-mono-100 text-mono-700"
                            : tag.type === "USECASE"
                            ? "bg-mono-100 text-mono-700"
                            : "bg-mono-200 text-mono-800"
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
              )}
            </div>
            {formData.tags.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-medium text-mono-700">
                  Đã chọn: {formData.tags.length} tag(s)
                </span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tags: [] })}
                  className="text-xs text-mono-800 hover:text-mono-800 underline"
                >
                  Xóa tất cả
                </button>
              </div>
            )}
          </div>
          {error && (
            <div className="bg-mono-100 border-2 border-mono-300 text-mono-800 px-4 py-3 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 border-2 border-mono-300 text-mono-700 rounded-lg hover:bg-mono-50 transition-all font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-mono-500 text-white px-6 py-2 rounded-lg hover:bg-mono-black transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                  Đang thêm...
                </>
              ) : (
                <>
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Thêm Sẩn Ph?m
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
