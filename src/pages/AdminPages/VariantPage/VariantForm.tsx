import React, { useEffect, useState } from "react";
import { variantApi } from "../../../services/VariantService";
import { productApi } from "../../../services/ProductService";
import { colorApi } from "../../../services/ColorService";
import { sizeApi } from "../../../services/SizeService";

interface VariantFormProps {
  editingVariant: any | null;
  onSuccess: () => void;
}

const VariantForm: React.FC<VariantFormProps> = ({
  editingVariant,
  onSuccess,
}) => {
  const [form, setForm] = useState<any>({
    product: "",
    color: "",
    gender: "",
    sizes: [{ size: "" }], // Không còn quantity - sẽ thêm khi stock in
  });

  // State cho danh sách sản phẩm, màu, size
  const [products, setProducts] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [sizesList, setSizesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    productApi.getAll({ limit: 100 }).then((res) => {
      setProducts(res.data.data || []);
    });
    colorApi.getAll().then((res) => {
      setColors(res.data.data || []);
    });
    sizeApi.getAll({ limit: 100 }).then((res) => {
      setSizesList(res.data.data || []);
    });
  }, []);

  useEffect(() => {
    if (editingVariant) {
      setForm({
        product: editingVariant.product?._id || editingVariant.product,
        color: editingVariant.color?._id || editingVariant.color,
        gender: editingVariant.gender,
        // Không còn price, costPrice, percentDiscount
        sizes: editingVariant.sizes?.map((s: any) => ({
          size: s.size?._id || s.size,
          // Không còn quantity - quản lý qua inventory
        })) || [{ size: "" }],
      });
    } else {
      setForm({
        product: "",
        color: "",
        gender: "",
        sizes: [{ size: "" }],
      });
    }
    setError(null);
  }, [editingVariant]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    idx?: number
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("sizes.") && typeof idx === "number") {
      const field = name.split(".")[1];
      setForm((prev: any) => {
        const sizes = [...prev.sizes];
        sizes[idx][field] = value;
        return { ...prev, sizes };
      });
    } else {
      setForm((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddSize = () => {
    setForm((prev: any) => ({
      ...prev,
      sizes: [...prev.sizes, { size: "" }], // Không còn quantity
    }));
  };

  const handleRemoveSize = (idx: number) => {
    setForm((prev: any) => ({
      ...prev,
      sizes: prev.sizes.filter((_: any, i: number) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingVariant) {
        await variantApi.updateVariant(editingVariant._id, form);
      } else {
        await variantApi.createVariant(form);
      }
      onSuccess();
      setForm({
        product: "",
        color: "",
        gender: "",
        sizes: [{ size: "" }],
      });
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-black">Sản phẩm</label>
        <select
          name="product"
          value={form.product}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-mono-300 rounded-md shadow-sm focus:outline-none focus:ring-mono-700 focus:border-mono-700 sm:text-sm"
        >
          <option value="">-- Chọn sản phẩm --</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p._id} - {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-black">Màu sắc</label>
        <select
          name="color"
          value={form.color}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-mono-300 rounded-md shadow-sm focus:outline-none focus:ring-mono-700 focus:border-mono-700 sm:text-sm"
        >
          <option value="">-- Chọn màu --</option>
          {colors.map((c) => (
            <option key={c._id} value={c._id}>
              {c._id} - {c.name}
            </option>
          ))}
        </select>
      </div>
      {/* REMOVED: price, costPrice, percentDiscount fields */}
      {/* Giá và số lượng sẽ được quản lý qua tính năng Stock In */}
      <div className="mb-4 p-3 bg-mono-50 border border-mono-200 rounded-md">
        <p className="text-sm text-blue-700">
          💡 <strong>Lưu ý:</strong> Giá bán và số lượng sẽ được thêm khi bạn sử
          dụng tính năng <strong>Nhập kho (Stock In)</strong>
        </p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-black">
          Giới tính
        </label>
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-mono-300 rounded-md shadow-sm focus:outline-none focus:ring-mono-700 focus:border-mono-700 sm:text-sm"
        >
          <option value="">-- Chọn giới tính --</option>
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-black">
          Kích thước (Size)
        </label>
        <p className="text-xs text-mono-500 mt-1 mb-2">
          Chọn các size có sẵn cho variant này. Số lượng sẽ được quản lý qua
          Stock In.
        </p>
        <div className="space-y-2">
          {form.sizes.map((s: any, idx: number) => (
            <div key={idx} className="flex gap-2">
              <select
                name="sizes.size"
                value={s.size}
                onChange={(e) => handleChange(e, idx)}
                className="block w-full px-3 py-2 border border-mono-300 rounded-md shadow-sm focus:outline-none focus:ring-mono-700 focus:border-mono-700 sm:text-sm"
                required
              >
                <option value="">Chọn size</option>
                {sizesList.map((sz) => (
                  <option key={sz._id} value={sz._id}>
                    {sz._id} - {sz.value}
                  </option>
                ))}
              </select>
              {/* REMOVED: quantity input - managed via inventory */}
              {form.sizes.length > 1 && (
                <button
                  type="button"
                  className="bg-mono-600 text-white px-3 rounded hover:bg-mono-800 transition"
                  onClick={() => handleRemoveSize(idx)}
                  title="Xóa size"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="mt-2 bg-mono-500 text-white px-3 py-1 rounded hover:bg-mono-black transition"
            onClick={handleAddSize}
          >
            + Thêm size
          </button>
        </div>
      </div>
      {error && <div className="text-mono-800 text-sm">{error}</div>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-mono-500 text-white px-4 py-2 rounded-md hover:bg-mono-black transition duration-300"
        >
          {loading ? "Đang lưu..." : editingVariant ? "Cập nhật" : "Thêm"}
        </button>
      </div>
    </form>
  );
};

export default VariantForm;
