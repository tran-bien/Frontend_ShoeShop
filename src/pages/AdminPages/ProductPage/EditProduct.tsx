import React, { useState, useEffect } from "react";
import { Product, UpdateProductData } from "../../../types/product";
import { Tag } from "../../../types/tag";
import { Brand } from "../../../types/brand";
import { Category } from "../../../types/category";
import { tagApi } from "../../../services/TagService";
import { productApi } from "../../../services/ProductService";
import { brandApi } from "../../../services/BrandService";
import { categoryApi } from "../../../services/CategoryService";

interface EditProductProps {
  handleClose: () => void;
  product: Product;
  onSuccess?: () => void;
}

const EditProduct: React.FC<EditProductProps> = ({
  handleClose,
  product,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<UpdateProductData>({
    name: product.name,
    description: product.description,
    category:
      typeof product.category === "object"
        ? product.category._id
        : product.category,
    brand:
      typeof product.brand === "object" ? product.brand._id : product.brand,
    tags: Array.isArray(product.tags)
      ? product.tags.map((tag: string | { _id: string }) =>
          typeof tag === "string" ? tag : tag._id
        )
      : [],
    isActive: product.isActive,
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
        const [brandsRes, categoriesRes, tagsRes] = await Promise.all([
          brandApi.getAll(),
          categoryApi.getAll(),
          tagApi.getActiveTags(),
        ]);

        const brandsData =
          brandsRes.data.data || brandsRes.data.brands || brandsRes.data || [];
        const categoriesData =
          categoriesRes.data.data ||
          categoriesRes.data.categories ||
          categoriesRes.data ||
          [];
        const tagsData =
          tagsRes.data.data || tagsRes.data.tags || tagsRes.data || [];

        console.log("Data loaded:", { brandsData, categoriesData, tagsData });
        setBrands(brandsData);
        setCategories(categoriesData);
        setTags(tagsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Không thể tải dữ liệu!");
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
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: target.checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleTagToggle = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...(prev.tags || []), tagId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Frontend validation
    if (!formData.name?.trim()) {
      setError("Tên sản phẩm không được để trống!");
      setLoading(false);
      return;
    }
    if (formData.name.trim().length < 2 || formData.name.trim().length > 200) {
      setError("Tên sản phẩm phải có từ 2-200 ký tự!");
      setLoading(false);
      return;
    }
    if (
      formData.description &&
      (formData.description.trim().length < 10 ||
        formData.description.trim().length > 1000)
    ) {
      setError("Mô tả sản phẩm phải có từ 10-1000 ký tự!");
      setLoading(false);
      return;
    }

    try {
      console.log("Updating product:", formData);
      await productApi.update(product._id, formData);
      handleClose();
      if (onSuccess) {
        onSuccess();
      } else if (window.location.reload) {
        window.location.reload();
      }
    } catch (err: unknown) {
      console.error("Update product error:", err);
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage =
        error.response?.data?.message || "Cập nhật sản phẩm thất bại!";
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
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all text-2xl font-bold"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Chỉnh Sửa Sản Phẩm
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên Sản Phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nhập tên sản phẩm..."
              className="mt-1 block w-full px-4 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô Tả <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Mô tả chi tiết về sản phẩm: chất liệu, đặc điểm nổi bật, công dụng..."
                className="mt-1 block w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                maxLength={1000}
              ></textarea>
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {formData.description?.length || 0}/1000
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              💡 Mô tả chi tiết giúp khách hàng hiểu rõ hơn về sản phẩm
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh Mục <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={loadingData}
                className="mt-1 block w-full px-4 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thương Hiệu <span className="text-red-500">*</span>
              </label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                disabled={loadingData}
                className="mt-1 block w-full px-4 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (Chọn nhiều)
            </label>
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto">
              {loadingData ? (
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
              ) : tags.length === 0 ? (
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
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {tags.map((tag) => (
                    <label
                      key={tag._id}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-white p-3 rounded-lg border border-transparent hover:border-blue-300 transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={formData.tags?.includes(tag._id) || false}
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
              )}
            </div>
            {formData.tags && formData.tags.length > 0 && (
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
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700">
                Đang hoạt động
              </span>
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-red-700">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-5 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || loadingData}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  Đang lưu...
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Lưu Thay Đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
