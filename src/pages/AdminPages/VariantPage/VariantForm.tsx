import React, { useEffect, useState } from "react";
import { adminVariantService } from "../../../services/VariantService";
import { productAdminService } from "../../../services/ProductService";
import { adminColorService } from "../../../services/ColorService";
import { adminSizeService } from "../../../services/SizeService";

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
    sizes: [{ size: "" }], // Kh�ng c�n quantity - s? th�m khi stock in
  });

  // State cho danh s�ch s?n ph?m, m�u, size
  const [products, setProducts] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [sizesList, setSizesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    productAdminService.getProducts({ limit: 100 }).then((res: any) => {
      setProducts(res.data.data || []);
    });
    adminColorService.getAll().then((res) => {
      setColors(res.data.data || []);
    });
    adminSizeService.getAll({ limit: 100 }).then((res) => {
      setSizesList(res.data.data || []);
    });
  }, []);

  useEffect(() => {
    if (editingVariant) {
      setForm({
        product: editingVariant.product?._id || editingVariant.product,
        color: editingVariant.color?._id || editingVariant.color,
        gender: editingVariant.gender,
        // Kh�ng c�n price, costPrice, percentDiscount
        sizes: editingVariant.sizes?.map((s: any) => ({
          size: s.size?._id || s.size,
          // Kh�ng c�n quantity - qu?n l� qua inventory
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
      sizes: [...prev.sizes, { size: "" }], // Kh�ng c�n quantity
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
        await adminVariantService.updateVariant(editingVariant._id, form);
      } else {
        await adminVariantService.createVariant(form);
      }
      onSuccess();
      setForm({
        product: "",
        color: "",
        gender: "",
        sizes: [{ size: "" }],
      });
    } catch {
      setError("C� l?i x?y ra, vui l�ng th? l?i!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-black">S?n ph?m</label>
        <select
          name="product"
          value={form.product}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-mono-300 rounded-md shadow-sm focus:outline-none focus:ring-mono-700 focus:border-mono-700 sm:text-sm"
        >
          <option value="">-- Ch?n s?n ph?m --</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p._id} - {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-black">M�u s?c</label>
        <select
          name="color"
          value={form.color}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-mono-300 rounded-md shadow-sm focus:outline-none focus:ring-mono-700 focus:border-mono-700 sm:text-sm"
        >
          <option value="">-- Ch?n m�u --</option>
          {colors.map((c) => (
            <option key={c._id} value={c._id}>
              {c._id} - {c.name}
            </option>
          ))}
        </select>
      </div>
      {/* REMOVED: price, costPrice, percentDiscount fields */}
      {/* Gi� v� s? lu?ng s? du?c qu?n l� qua t�nh nang Stock In */}
      <div className="mb-4 p-3 bg-mono-50 border border-mono-200 rounded-md">
        <p className="text-sm text-blue-700">
          ?? <strong>Luu �:</strong> Gi� b�n v� s? lu?ng s? du?c th�m khi b?n s?
          d?ng t�nh nang <strong>Nh?p kho (Stock In)</strong>
        </p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-black">
          Gi?i t�nh
        </label>
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-mono-300 rounded-md shadow-sm focus:outline-none focus:ring-mono-700 focus:border-mono-700 sm:text-sm"
        >
          <option value="">-- Ch?n gi?i t�nh --</option>
          <option value="male">Nam</option>
          <option value="female">N?</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-black">
          K�ch thu?c (Size)
        </label>
        <p className="text-xs text-mono-500 mt-1 mb-2">
          Ch?n c�c size c� s?n cho variant n�y. S? lu?ng s? du?c qu?n l� qua
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
                <option value="">Ch?n size</option>
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
                  title="X�a size"
                >
                  ?
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="mt-2 bg-mono-500 text-white px-3 py-1 rounded hover:bg-mono-black transition"
            onClick={handleAddSize}
          >
            + Th�m size
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
          {loading ? "�ang luu..." : editingVariant ? "C?p nh?t" : "Th�m"}
        </button>
      </div>
    </form>
  );
};

export default VariantForm;
