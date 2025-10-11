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
        setPricePreview(result.data);
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
        <h2 className="text-2xl font-bold mb-6 text-gray-800">📦 Nhập kho</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Sản phẩm <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.productId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Màu sắc <span className="text-red-500">*</span>
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
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Kích thước <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.sizeId}
              onChange={(e) =>
                setFormData({ ...formData, sizeId: e.target.value })
              }
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Số lượng <span className="text-red-500">*</span>
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
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Giá vốn (₫) <span className="text-red-500">*</span>
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
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                required
              />
            </div>
          </div>

          {/* Profit and Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
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
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
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
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="100"
              />
            </div>
          </div>

          {/* Price Preview */}
          {pricePreview && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-sm text-blue-800 mb-2">
                📊 Tính toán giá bán:
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Giá gốc:</span>{" "}
                  <strong>
                    {pricePreview.basePrice?.toLocaleString("vi-VN")}₫
                  </strong>
                </div>
                <div>
                  <span className="text-gray-600">Giá sau giảm:</span>{" "}
                  <strong className="text-green-600">
                    {pricePreview.finalPrice?.toLocaleString("vi-VN")}₫
                  </strong>
                </div>
                <div>
                  <span className="text-gray-600">Lãi/sản phẩm:</span>{" "}
                  <strong>
                    {pricePreview.profit?.toLocaleString("vi-VN")}₫
                  </strong>
                </div>
                <div>
                  <span className="text-gray-600">Biên lợi nhuận:</span>{" "}
                  <strong>{pricePreview.margin?.toFixed(2)}%</strong>
                </div>
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Ghi chú
            </label>
            <textarea
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Nhập ghi chú (tùy chọn)"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? "Đang xử lý..." : "✅ Nhập kho"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 py-3 rounded-lg hover:bg-gray-300 font-medium transition-colors"
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
