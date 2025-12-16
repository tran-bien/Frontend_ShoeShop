import React, { useEffect, useState } from "react";
import { adminVariantService } from "../../../services/VariantService";
import { productAdminService } from "../../../services/ProductService";
import { adminColorService } from "../../../services/ColorService";
import { adminSizeService } from "../../../services/SizeService";
import { toast } from "react-hot-toast";

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
    sizes: [{ size: "" }], // Không cần quantity - sẽ thêm khi stock in
  });

  // State cho danh sách sản phẩm, màu, size
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
        // Không cần price, costPrice, percentDiscount
        sizes: editingVariant.sizes?.map((s: any) => ({
          size: s.size?._id || s.size,
          // Không cần quantity - quản lý qua inventory
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
      sizes: [...prev.sizes, { size: "" }], // Không cần quantity
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
        toast.success("Đã cập nhật biến thể thành công");
      } else {
        await adminVariantService.createVariant(form);
        toast.success("Đã thêm biến thể mới thành công");
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
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-mono-700 mb-2">
          Sản phẩm <span className="text-red-500">*</span>
        </label>
        <select
          name="product"
          value={form.product}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent transition-all bg-white"
        >
          <option value="">-- Chọn sản phẩm --</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-mono-700 mb-2">
          Màu sắc <span className="text-red-500">*</span>
        </label>
        <select
          name="color"
          value={form.color}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent transition-all bg-white"
        >
          <option value="">-- Chọn màu --</option>
          {colors.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      {/* REMOVED: price, costPrice, percentDiscount fields */}
      {/* Giá và số lượng sẽ được quản lý qua tính năng Stock In */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>Lưu ý:</strong> Giá bán và số lượng sẽ được thêm khi bạn sử
          dụng tính năng <strong>Nhập kho (Stock In)</strong>
        </p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-mono-700 mb-2">
          Giới tính <span className="text-red-500">*</span>
        </label>
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent transition-all bg-white"
        >
          <option value="">-- Chọn giới tính --</option>
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
          <option value="unisex">Unisex</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-mono-700 mb-2">
          Kích thước (Size) <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-mono-500 mb-3">
          Chọn các size có sẵn cho variant này. Số lượng sẽ được quản lý qua
          Stock In.
        </p>
        <div className="space-y-3">
          {form.sizes.map((s: any, idx: number) => (
            <div key={idx} className="flex gap-3">
              <select
                name="sizes.size"
                value={s.size}
                onChange={(e) => handleChange(e, idx)}
                className="flex-1 px-4 py-3 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent transition-all bg-white"
                required
              >
                <option value="">Chọn size</option>
                {sizesList.map((sz) => (
                  <option key={sz._id} value={sz._id}>
                    {sz.value}
                  </option>
                ))}
              </select>
              {/* REMOVED: quantity input - managed via inventory */}
              {form.sizes.length > 1 && (
                <button
                  type="button"
                  className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                  onClick={() => handleRemoveSize(idx)}
                  title="Xóa size"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="px-4 py-2 bg-mono-100 text-mono-700 hover:bg-mono-200 rounded-lg transition-colors font-medium"
            onClick={handleAddSize}
          >
            + Thêm size
          </button>
        </div>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div className="flex justify-end gap-3 pt-4 border-t border-mono-200">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-mono-800 hover:bg-mono-900 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Đang lưu...
            </>
          ) : editingVariant ? (
            "Cập nhật"
          ) : (
            "Thêm mới"
          )}
        </button>
      </div>
    </form>
  );
};

export default VariantForm;
