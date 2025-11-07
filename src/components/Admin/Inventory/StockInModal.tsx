import { useState, useEffect } from "react";
import InventoryService from "../../../services/InventoryService";
import { productApi } from "../../../services/ProductService";
import { FaTrash, FaPlus } from "react-icons/fa";

interface StockInModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface SizeEntry {
  sizeId: string;
  sizeName: string;
  quantity: number;
  currentStock: number;
}

const StockInModal = ({ onClose, onSuccess }: StockInModalProps) => {
  // Common form data (applies to ALL sizes in this import session)
  const [formData, setFormData] = useState({
    productId: "",
    variantId: "",
    costPrice: 0,
    targetProfitPercent: 30,
    percentDiscount: 0,
    note: "",
  });

  // Multiple size entries (different quantities per size)
  const [sizeEntries, setSizeEntries] = useState<SizeEntry[]>([]);

  const [submitting, setSubmitting] = useState(false);

  // Dropdown data
  const [products, setProducts] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [availableSizes, setAvailableSizes] = useState<any[]>([]);

  // Selected product to get variants
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

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
      setFormData((prev) => ({ ...prev, variantId: "" }));
      setSizeEntries([]);
      setAvailableSizes([]);
    }
  }, [formData.productId, selectedProduct]);

  useEffect(() => {
    if (formData.variantId) {
      const variant = variants.find((v) => v._id === formData.variantId);
      setSelectedVariant(variant);
      if (variant?.sizes) {
        setAvailableSizes(variant.sizes);
      } else {
        setAvailableSizes([]);
      }
      setSizeEntries([]);
    } else {
      setSelectedVariant(null);
      setAvailableSizes([]);
      setSizeEntries([]);
    }
  }, [formData.variantId, variants]);

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
      console.log("📦 Fetched products:", response.data.data);
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
        setPricePreview(result.data.data);
      } catch (error) {
        console.error("Error calculating price:", error);
      }
    }
  };

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p._id === productId);
    console.log("🎨 Selected product:", product);
    console.log("🎨 Product variants:", product?.variants);
    setSelectedProduct(product);
    setFormData({ ...formData, productId, variantId: "" });
    setSizeEntries([]);
  };

  // Add new size entry row
  const handleAddSize = () => {
    setSizeEntries([
      ...sizeEntries,
      {
        sizeId: "",
        sizeName: "",
        quantity: 1,
        currentStock: 0,
      },
    ]);
  };

  // Remove size entry row
  const handleRemoveSize = (index: number) => {
    setSizeEntries(sizeEntries.filter((_, i) => i !== index));
  };

  // Update size selection
  const handleSizeChange = (index: number, sizeId: string) => {
    const selectedSize = availableSizes.find((s: any) => s.size._id === sizeId);
    const newEntries = [...sizeEntries];
    newEntries[index] = {
      ...newEntries[index],
      sizeId,
      sizeName: selectedSize?.size.value || "",
      currentStock: selectedSize?.quantity || 0,
    };
    setSizeEntries(newEntries);
  };

  // Update quantity for a size
  const handleQuantityChange = (index: number, quantity: number) => {
    const newEntries = [...sizeEntries];
    newEntries[index].quantity = quantity;
    setSizeEntries(newEntries);
  };

  // Get total quantity across all sizes
  const getTotalQuantity = () => {
    return sizeEntries.reduce((sum, entry) => sum + entry.quantity, 0);
  };

  // Get total cost
  const getTotalCost = () => {
    return getTotalQuantity() * formData.costPrice;
  };

  // Get total profit
  const getTotalProfit = () => {
    if (!pricePreview) return 0;
    return getTotalQuantity() * pricePreview.profit;
  };

  // Check if size is already selected
  const isSizeSelected = (sizeId: string, currentIndex: number) => {
    return sizeEntries.some(
      (entry, index) => entry.sizeId === sizeId && index !== currentIndex
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.productId || !formData.variantId) {
      alert("Vui lòng chọn sản phẩm và màu sắc!");
      return;
    }

    if (sizeEntries.length === 0) {
      alert("Vui lòng thêm ít nhất một kích thước!");
      return;
    }

    // Check if all sizes have valid selection
    const invalidEntries = sizeEntries.filter(
      (entry) => !entry.sizeId || entry.quantity <= 0
    );
    if (invalidEntries.length > 0) {
      alert(
        "Vui lòng chọn kích thước và nhập số lượng hợp lệ cho tất cả các dòng!"
      );
      return;
    }

    if (formData.costPrice <= 0) {
      alert("Giá vốn phải lớn hơn 0!");
      return;
    }

    try {
      setSubmitting(true);

      // Submit all sizes in parallel using Promise.all
      const promises = sizeEntries.map((entry) =>
        InventoryService.stockIn({
          productId: formData.productId,
          variantId: formData.variantId,
          sizeId: entry.sizeId,
          quantity: entry.quantity,
          costPrice: formData.costPrice,
          targetProfitPercent: formData.targetProfitPercent,
          percentDiscount: formData.percentDiscount,
          note: formData.note,
        })
      );

      await Promise.all(promises);

      alert(`✅ Nhập kho thành công ${sizeEntries.length} kích thước!`);
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.message || "Có lỗi xảy ra khi nhập kho");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-mono-800">
          📦 Nhập kho nhiều size
        </h2>
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
          {/* Size Entries Section */}
          {formData.variantId && (
            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-mono-800">
                  📏 Danh sách kích thước nhập kho
                </h3>
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaPlus /> Thêm size
                </button>
              </div>

              {sizeEntries.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Chưa có kích thước nào. Nhấn "Thêm size" để bắt đầu.
                </p>
              ) : (
                <div className="space-y-3">
                  {sizeEntries.map((entry, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-3 items-end bg-white p-3 rounded-lg border border-gray-300"
                    >
                      {/* Size Selection */}
                      <div className="col-span-5">
                        <label className="block text-xs font-medium mb-1 text-gray-600">
                          Kích thước
                        </label>
                        <select
                          value={entry.sizeId}
                          onChange={(e) =>
                            handleSizeChange(index, e.target.value)
                          }
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm"
                          required
                        >
                          <option value="">-- Chọn size --</option>
                          {availableSizes.map((sizeItem: any) => (
                            <option
                              key={sizeItem.size._id}
                              value={sizeItem.size._id}
                              disabled={isSizeSelected(
                                sizeItem.size._id,
                                index
                              )}
                            >
                              Size {sizeItem.size.value} (Tồn:{" "}
                              {sizeItem.quantity})
                              {isSizeSelected(sizeItem.size._id, index) &&
                                " - Đã chọn"}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity Input */}
                      <div className="col-span-3">
                        <label className="block text-xs font-medium mb-1 text-gray-600">
                          Số lượng
                        </label>
                        <input
                          type="number"
                          value={entry.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              index,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm"
                          min="1"
                          required
                        />
                      </div>

                      {/* Current Stock Display */}
                      <div className="col-span-3">
                        <label className="block text-xs font-medium mb-1 text-gray-600">
                          Tồn hiện tại
                        </label>
                        <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium text-gray-700">
                          {entry.currentStock}
                        </div>
                      </div>

                      {/* Delete Button */}
                      <div className="col-span-1">
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(index)}
                          className="w-full bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                          title="Xóa dòng này"
                        >
                          <FaTrash className="mx-auto" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total Quantity Summary */}
              {sizeEntries.length > 0 && (
                <div className="mt-3 bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">
                      📊 Tổng số lượng nhập:
                    </span>
                    <span className="text-xl font-bold text-blue-700">
                      {getTotalQuantity()} sản phẩm
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Common Pricing Section */}
          <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
            <h3 className="font-bold text-mono-800 mb-3">
              💰 Thông tin giá chung (áp dụng cho tất cả size)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-mono-700">
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
                  className="w-full border border-mono-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="0"
                  required
                />
              </div>
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
                  className="w-full border border-mono-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>
            <div className="mt-4">
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
                className="w-full border border-mono-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="0"
                max="100"
              />
            </div>
          </div>{" "}
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

              {/* Total Calculation for All Sizes */}
              {sizeEntries.length > 0 && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-mono-700">
                        💰 Tổng vốn ({getTotalQuantity()} sản phẩm):
                      </span>
                      <strong className="text-base text-mono-900">
                        {getTotalCost().toLocaleString("vi-VN")}₫
                      </strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-mono-700">
                        📈 Tổng lãi dự kiến:
                      </span>
                      <strong className="text-base text-mono-800">
                        +{getTotalProfit().toLocaleString("vi-VN")}₫
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
              disabled={submitting || sizeEntries.length === 0}
              className="flex-1 bg-mono-black text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {submitting
                ? "Đang xử lý..."
                : `✅ Nhập kho ${
                    sizeEntries.length > 0 ? `(${sizeEntries.length} size)` : ""
                  }`}
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
