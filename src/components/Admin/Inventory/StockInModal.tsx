import { useState, useEffect } from "react";
import InventoryService from "../../../services/InventoryService";
import { productApi } from "../../../services/ProductService";

interface StockInModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const StockInModal = ({ onClose, onSuccess }: StockInModalProps) => {
  const [formData, setFormData] = useState({
    productId: "",
    variantId: "",
    sizeId: "",
    quantity: 0,
    costPrice: 0,
    targetProfitPercent: 30,
    percentDiscount: 0,
    note: "",
  });
  const [loading, setLoading] = useState(false);

  // Dropdown data
  const [products, setProducts] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);

  // Selected product to get variants
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Price calculation preview
  const [pricePreview, setPricePreview] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (formData.productId && selectedProduct?.variants) {
      setVariants(selectedProduct.variants);
    } else {
      setVariants([]);
      setFormData((prev) => ({ ...prev, variantId: "", sizeId: "" }));
    }
  }, [formData.productId, selectedProduct]);

  useEffect(() => {
    calculatePricePreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.costPrice,
    formData.targetProfitPercent,
    formData.percentDiscount,
  ]);

  const fetchProducts = async () => {
    try {
      const response = await productApi.getAll({ limit: 100 });
      setProducts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const calculatePricePreview = async () => {
    if (formData.costPrice > 0) {
      try {
        const result = await InventoryService.calculatePrice({
          costPrice: formData.costPrice,
          targetProfitPercent: formData.targetProfitPercent,
          percentDiscount: formData.percentDiscount,
        });
        // Response structure: { data: { success, data } }
        setPricePreview(result.data.data);
      } catch (error) {
        console.error("Error calculating price:", error);
      }
    }
  };

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p._id === productId);
    setSelectedProduct(product);
    setFormData({ ...formData, productId, variantId: "", sizeId: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await InventoryService.stockIn({
        productId: formData.productId,
        variantId: formData.variantId,
        sizeId: formData.sizeId,
        quantity: formData.quantity,
        costPrice: formData.costPrice,
        targetProfitPercent: formData.targetProfitPercent,
        percentDiscount: formData.percentDiscount,
        note: formData.note,
      });
      alert("Nhập kho thành công!");
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-mono-800">📦 Nhập kho</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-mono-700">
              Sản phẩm <span className="text-mono-800">*</span>
            </label>
            <select
              value={formData.productId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full border border-mono-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
              required
            >
              <option value="">-- Chọn sản phẩm --</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          {/* Variant (Color) Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-mono-700">
              Màu sắc <span className="text-mono-800">*</span>
            </label>
            <select
              value={formData.variantId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  variantId: e.target.value,
                  sizeId: "",
                })
              }
              className="w-full border border-mono-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
              required
              disabled={!formData.productId}
            >
              <option value="">-- Chọn màu sắc --</option>
              {variants.map((variant) => (
                <option key={variant._id} value={variant._id}>
                  {variant.color?.name || "N/A"} - {variant.gender || "Unisex"}
                </option>
              ))}
            </select>
          </div>

          {/* Size Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-mono-700">
              Kích thước <span className="text-mono-800">*</span>
            </label>
            <select
              value={formData.sizeId}
              onChange={(e) =>
                setFormData({ ...formData, sizeId: e.target.value })
              }
              className="w-full border border-mono-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
              required
              disabled={!formData.variantId}
            >
              <option value="">-- Chọn kích thước --</option>
              {variants
                .find((v) => v._id === formData.variantId)
                ?.sizes?.map((sizeItem: any) => (
                  <option key={sizeItem.size?._id} value={sizeItem.size?._id}>
                    Size {sizeItem.size?.value} (Tồn: {sizeItem.quantity})
                  </option>
                ))}
            </select>
          </div>

          {/* Quantity and Cost Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-mono-700">
                Số lượng <span className="text-mono-800">*</span>
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full border border-mono-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-mono-700">
                Giá vốn (₫) <span className="text-mono-800">*</span>
              </label>
              <input
                type="number"
                value={formData.costPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    costPrice: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full border border-mono-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
                min="0"
                required
              />
            </div>
          </div>

          {/* Profit and Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-mono-700">
                Mục tiêu lãi (%)
              </label>
              <input
                type="number"
                value={formData.targetProfitPercent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetProfitPercent: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full border border-mono-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-mono-700">
                Giảm giá (%)
              </label>
              <input
                type="number"
                value={formData.percentDiscount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    percentDiscount: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full border border-mono-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
                min="0"
                max="100"
              />
            </div>
          </div>

          {/* Pricing Formula Display */}
          <div className="bg-gradient-to-r from-purple-50 to-mono-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-bold text-sm text-purple-800 mb-3 flex items-center gap-2">
              🧮 Công thức tính giá
            </h3>
            <div className="space-y-2 text-sm">
              <div className="bg-white rounded p-2 border border-purple-100">
                <code className="text-xs font-mono text-mono-700">
                  Giá gốc = Giá vốn × (1 + Mục tiêu lãi / 100)
                </code>
              </div>
              <div className="bg-white rounded p-2 border border-purple-100">
                <code className="text-xs font-mono text-mono-700">
                  Giá bán = Giá gốc × (1 - Giảm giá / 100)
                </code>
              </div>
              <div className="bg-white rounded p-2 border border-purple-100">
                <code className="text-xs font-mono text-mono-700">
                  Lãi thực = Giá bán - Giá vốn
                </code>
              </div>
            </div>
          </div>

          {/* Price Preview */}
          {pricePreview && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-sm text-green-800 mb-3 flex items-center gap-2">
                � Kết quả tính toán
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <span className="text-xs text-mono-500 block mb-1">
                    Giá vốn
                  </span>
                  <strong className="text-lg text-mono-800">
                    {formData.costPrice?.toLocaleString("vi-VN")}₫
                  </strong>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <span className="text-xs text-mono-500 block mb-1">
                    Giá gốc
                  </span>
                  <strong className="text-lg text-mono-black">
                    {pricePreview.basePrice?.toLocaleString("vi-VN")}₫
                  </strong>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <span className="text-xs text-mono-500 block mb-1">
                    Giảm giá
                  </span>
                  <strong className="text-lg text-orange-600">
                    -{formData.percentDiscount}%
                  </strong>
                </div>
                <div className="bg-green-100 rounded-lg p-3 border-2 border-mono-600">
                  <span className="text-xs text-green-700 block mb-1 font-semibold">
                    💵 Giá bán cuối
                  </span>
                  <strong className="text-xl text-green-700">
                    {pricePreview.finalPrice?.toLocaleString("vi-VN")}₫
                  </strong>
                </div>
              </div>

              {/* Profit Details */}
              <div className="mt-3 pt-3 border-t border-green-200 grid grid-cols-3 gap-2">
                <div className="text-center">
                  <span className="text-xs text-mono-600 block">Lãi/SP</span>
                  <strong className="text-sm text-green-700">
                    {pricePreview.profit?.toLocaleString("vi-VN")}₫
                  </strong>
                </div>
                <div className="text-center">
                  <span className="text-xs text-mono-600 block">Biên lãi</span>
                  <strong className="text-sm text-green-700">
                    {pricePreview.margin?.toFixed(2)}%
                  </strong>
                </div>
                <div className="text-center">
                  <span className="text-xs text-mono-600 block">Markup</span>
                  <strong className="text-sm text-green-700">
                    {pricePreview.markup?.toFixed(2)}%
                  </strong>
                </div>
              </div>

              {/* Total Calculation */}
              {formData.quantity > 0 && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-mono-700">
                        Tổng vốn ({formData.quantity} sản phẩm):
                      </span>
                      <strong className="text-base text-mono-900">
                        {(
                          formData.costPrice * formData.quantity
                        ).toLocaleString("vi-VN")}
                        ₫
                      </strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-mono-700">
                        Tổng lãi dự kiến:
                      </span>
                      <strong className="text-base text-mono-800">
                        +
                        {(
                          pricePreview.profit * formData.quantity
                        ).toLocaleString("vi-VN")}
                        ₫
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-sm font-medium mb-2 text-mono-700">
              Ghi chú
            </label>
            <textarea
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              className="w-full border border-mono-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
              rows={3}
              placeholder="Nhập ghi chú (tùy chọn)"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-mono-black text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? "Đang xử lý..." : "✅ Nhập kho"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-mono-200 py-3 rounded-lg hover:bg-mono-300 font-medium transition-colors"
            >
              ❌ Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockInModal;
