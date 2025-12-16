import React, { useEffect, useState, useCallback } from "react";
import { adminVariantService } from "../../../services/VariantService";
import { productAdminService } from "../../../services/ProductService";
import { adminColorService } from "../../../services/ColorService";
import { adminSizeService } from "../../../services/SizeService";
import { toast } from "react-hot-toast";
import {
  FiAlertCircle,
  FiPackage,
  FiShoppingCart,
  FiTrash2,
  FiLock,
} from "react-icons/fi";

interface SizeConstraint {
  sizeId: string;
  sizeName: string;
  sku: string | null;
  orderCount: number;
  inventoryQuantity: number;
  hasPendingOrders: boolean;
  hasStock: boolean;
  canRemove: boolean;
  removeWarning: string | null;
}

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
    sizes: [{ size: "" }],
  });

  // State cho danh sách sản phẩm, màu, size
  const [products, setProducts] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [sizesList, setSizesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State cho ràng buộc size
  const [sizeConstraints, setSizeConstraints] = useState<SizeConstraint[]>([]);
  const [constraintsLoading, setConstraintsLoading] = useState(false);

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

  // Fetch size constraints when editing
  const fetchSizeConstraints = useCallback(async (variantId: string) => {
    try {
      setConstraintsLoading(true);
      const res = await adminVariantService.checkSizeConstraints(variantId);
      if (res.data.success) {
        setSizeConstraints(res.data.sizes);
      }
    } catch (err) {
      console.error("Error fetching size constraints:", err);
    } finally {
      setConstraintsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (editingVariant) {
      setForm({
        product: editingVariant.product?._id || editingVariant.product,
        color: editingVariant.color?._id || editingVariant.color,
        gender: editingVariant.gender,
        sizes: editingVariant.sizes?.map((s: any) => ({
          size: s.size?._id || s.size,
        })) || [{ size: "" }],
      });
      // Fetch constraints for existing variant
      fetchSizeConstraints(editingVariant._id);
    } else {
      setForm({
        product: "",
        color: "",
        gender: "",
        sizes: [{ size: "" }],
      });
      setSizeConstraints([]);
    }
    setError(null);
  }, [editingVariant, fetchSizeConstraints]);

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
      sizes: [...prev.sizes, { size: "" }],
    }));
  };

  const handleRemoveSize = (idx: number) => {
    const sizeToRemove = form.sizes[idx];
    const constraint = sizeConstraints.find(
      (c) => c.sizeId === sizeToRemove.size
    );

    if (constraint && !constraint.canRemove) {
      toast.error(constraint.removeWarning || "Không thể xóa size này");
      return;
    }

    setForm((prev: any) => ({
      ...prev,
      sizes: prev.sizes.filter((_: any, i: number) => i !== idx),
    }));
  };

  const getSizeConstraint = (sizeId: string): SizeConstraint | undefined => {
    return sizeConstraints.find((c) => c.sizeId === sizeId);
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
      setSizeConstraints([]);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!";
      setError(errorMsg);
      toast.error(errorMsg);
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
          disabled={!!editingVariant}
          className="w-full px-4 py-3 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent transition-all bg-white disabled:bg-mono-100 disabled:cursor-not-allowed"
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
          disabled={!!editingVariant}
          className="w-full px-4 py-3 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent transition-all bg-white disabled:bg-mono-100 disabled:cursor-not-allowed"
        >
          <option value="">-- Chọn màu --</option>
          {colors.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

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

        {/* Constraints Summary khi editing */}
        {editingVariant && sizeConstraints.length > 0 && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800 text-sm">
              <FiAlertCircle className="w-4 h-4" />
              <span className="font-medium">Lưu ý khi chỉnh sửa size:</span>
            </div>
            <ul className="mt-2 text-xs text-amber-700 space-y-1">
              <li className="flex items-center gap-2">
                <FiLock className="w-3 h-3" />
                Size có đơn hàng: Không thể xóa
              </li>
              <li className="flex items-center gap-2">
                <FiPackage className="w-3 h-3" />
                Size còn tồn kho: Cần xuất hết trước khi xóa
              </li>
            </ul>
          </div>
        )}

        {constraintsLoading ? (
          <div className="flex items-center gap-2 text-mono-500 py-4">
            <div className="w-4 h-4 border-2 border-mono-300 border-t-mono-600 rounded-full animate-spin"></div>
            <span className="text-sm">Đang kiểm tra ràng buộc...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {form.sizes.map((s: any, idx: number) => {
              const constraint = getSizeConstraint(s.size);
              const isConstrained = constraint && !constraint.canRemove;
              // Get size name from sizesList
              const selectedSize = sizesList.find((sz) => sz._id === s.size);

              return (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <select
                      name="sizes.size"
                      value={s.size}
                      onChange={(e) => handleChange(e, idx)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent transition-all bg-white ${
                        isConstrained
                          ? "border-amber-300 bg-amber-50"
                          : "border-mono-300"
                      }`}
                      required
                      disabled={isConstrained}
                    >
                      <option value="">Chọn size</option>
                      {sizesList.map((sz) => (
                        <option key={sz._id} value={sz._id}>
                          {sz.value} {sz.name ? `(${sz.name})` : ""}{" "}
                          {sz.description ? `- ${sz.description}` : ""}
                        </option>
                      ))}
                    </select>

                    {/* Hiển thị thông tin size đã chọn khi không có constraint */}
                    {selectedSize && !constraint && (
                      <div className="mt-1 flex flex-wrap gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-mono-100 text-mono-600 rounded">
                          Size: {selectedSize.value}
                        </span>
                        {selectedSize.name && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-mono-100 text-mono-600 rounded">
                            Tên: {selectedSize.name}
                          </span>
                        )}
                        {selectedSize.description && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-mono-100 text-mono-600 rounded">
                            {selectedSize.description}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Hiển thị thông tin ràng buộc */}
                    {constraint && (
                      <div className="mt-1 flex flex-wrap gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-mono-100 text-mono-600 rounded font-medium">
                          Size: {constraint.sizeName}
                        </span>
                        {constraint.orderCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded">
                            <FiShoppingCart className="w-3 h-3" />
                            {constraint.orderCount} đơn hàng
                          </span>
                        )}
                        {constraint.inventoryQuantity > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                            <FiPackage className="w-3 h-3" />
                            {constraint.inventoryQuantity} trong kho
                          </span>
                        )}
                        {constraint.inventoryQuantity === 0 &&
                          constraint.orderCount === 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded">
                              Có thể xóa
                            </span>
                          )}
                        {constraint.sku && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-mono-100 text-mono-600 rounded font-mono">
                            SKU: {constraint.sku}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {form.sizes.length > 1 && (
                    <button
                      type="button"
                      className={`px-4 py-3 rounded-lg transition-colors flex items-center gap-1 ${
                        isConstrained
                          ? "bg-mono-100 text-mono-400 cursor-not-allowed"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                      onClick={() => handleRemoveSize(idx)}
                      disabled={isConstrained}
                      title={
                        isConstrained
                          ? constraint?.removeWarning || "Không thể xóa"
                          : "Xóa size"
                      }
                    >
                      {isConstrained ? (
                        <FiLock className="w-4 h-4" />
                      ) : (
                        <FiTrash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              className="px-4 py-2 bg-mono-100 text-mono-700 hover:bg-mono-200 rounded-lg transition-colors font-medium"
              onClick={handleAddSize}
            >
              + Thêm size
            </button>
          </div>
        )}
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
