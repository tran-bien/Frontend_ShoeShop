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
    price: "",
    costPrice: "",
    percentDiscount: "",
    gender: "",
    sizes: [{ size: "", quantity: "" }],
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
        price: editingVariant.price,
        costPrice: editingVariant.costPrice,
        percentDiscount: editingVariant.percentDiscount,
        gender: editingVariant.gender,
        sizes: editingVariant.sizes?.map((s: any) => ({
          size: s.size?._id || s.size,
          quantity: s.quantity,
        })) || [{ size: "", quantity: "" }],
      });
    } else {
      setForm({
        product: "",
        color: "",
        price: "",
        costPrice: "",
        percentDiscount: "",
        gender: "",
        sizes: [{ size: "", quantity: "" }],
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
      sizes: [...prev.sizes, { size: "", quantity: "" }],
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
        price: "",
        costPrice: "",
        percentDiscount: "",
        gender: "",
        sizes: [{ size: "", quantity: "" }],
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
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">-- Chọn màu --</option>
          {colors.map((c) => (
            <option key={c._id} value={c._id}>
              {c._id} - {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-black">
            Giá bán
          </label>
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Giá"
            type="number"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black">
            Giá vốn
          </label>
          <input
            name="costPrice"
            value={form.costPrice}
            onChange={handleChange}
            placeholder="Giá vốn"
            type="number"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black">
            % Giảm giá
          </label>
          <input
            name="percentDiscount"
            value={form.percentDiscount}
            onChange={handleChange}
            placeholder="% giảm"
            type="number"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
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
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">-- Chọn giới tính --</option>
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-black">
          Size & Số lượng
        </label>
        <div className="space-y-2">
          {form.sizes.map((s: any, idx: number) => (
            <div key={idx} className="flex gap-2">
              <select
                name="sizes.size"
                value={s.size}
                onChange={(e) => handleChange(e, idx)}
                className="block w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="">Chọn size</option>
                {sizesList.map((sz) => (
                  <option key={sz._id} value={sz._id}>
                    {sz._id} - {sz.value}
                  </option>
                ))}
              </select>
              <input
                name="sizes.quantity"
                value={s.quantity}
                onChange={(e) => handleChange(e, idx)}
                placeholder="Số lượng"
                type="number"
                className="block w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
              {form.sizes.length > 1 && (
                <button
                  type="button"
                  className="bg-red-400 text-white px-2 rounded"
                  onClick={() => handleRemoveSize(idx)}
                  title="Xóa size"
                >
                  X
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
            onClick={handleAddSize}
          >
            Thêm size
          </button>
        </div>
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
        >
          {loading ? "Đang lưu..." : editingVariant ? "Cập nhật" : "Thêm"}
        </button>
      </div>
    </form>
  );
};

export default VariantForm;
