import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import InventoryService from "../../../services/InventoryService";
import { productAdminService } from "../../../services/ProductService";
import {
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  ShoppingBagIcon,
  SwatchIcon,
  ScaleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalculatorIcon,
} from "@heroicons/react/24/outline";

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

interface Product {
  _id: string;
  name: string;
  variants?: Variant[];
}

interface Variant {
  _id: string;
  color?: {
    _id: string;
    name: string;
  };
  gender?: string;
  sizes?: SizeItem[];
}

interface SizeItem {
  size: {
    _id: string;
    value: string | number;
  };
  quantity: number;
}

interface PricePreview {
  calculatedPrice: number;
  calculatedPriceFinal: number;
  profitPerItem: number;
  margin: number;
  markup: number;
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

  // Dropdown data (use `any` because API may return shapes with mixed types)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [variants, setVariants] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [availableSizes, setAvailableSizes] = useState<any[]>([]);

  // Selected product to get variants
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Price calculation preview
  const [pricePreview, setPricePreview] = useState<PricePreview | null>(null);

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
      if (variant?.sizes) {
        console.log("ðŸŽ¯ Selected variant sizes:", variant.sizes);
        setAvailableSizes(variant.sizes);
      } else {
        console.log("âš ï¸ No sizes found for variant");
        setAvailableSizes([]);
      }
      setSizeEntries([]);
    } else {
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
      const response = await productAdminService.getProducts({ limit: 100 });
      console.log("ðŸ“¦ Fetched products:", response.data.data);
      console.log("ðŸ“¦ Full API response:", response.data);
      // The API returns products in response.data.data.data (paginated response)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseData = response.data.data as any;
      const productsData = responseData?.data || responseData || [];
      console.log("ðŸ“¦ Extracted products:", productsData);
      setProducts(productsData);
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
        // API may return undefined; guard and normalize to our PricePreview shape or null
        setPricePreview(result?.data?.data ?? null);
      } catch (error) {
        console.error("Error calculating price:", error);
      }
    }
  };

  const handleProductChange = async (productId: string) => {
    const product = products.find((p) => p._id === productId);
    console.log("ðŸŽ¨ Selected product:", product);

    // Product list API doesn't include variants (deleted for performance)
    // Need to fetch full product details to get variants
    if (productId) {
      try {
        console.log("ðŸ” Fetching full product details for:", productId);
        const detailResponse = await productAdminService.getProductById(
          productId
        );
        console.log("ðŸ” Full API response:", detailResponse.data);

        // Backend returns { success: true, product: {...} } not { data: {...} }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseData = detailResponse.data as any;
        const fullProduct = responseData.product || responseData.data || null;

        console.log("ðŸŽ¨ Full product with variants:", fullProduct);
        console.log("ðŸŽ¨ Product variants:", fullProduct?.variants);
        setSelectedProduct(fullProduct);
      } catch (error) {
        console.error("Error fetching product details:", error);
        setSelectedProduct(product || null);
      }
    } else {
      setSelectedProduct(null);
    }

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
    const selectedSize = availableSizes.find((s) => s.size._id === sizeId);
    const newEntries = [...sizeEntries];
    newEntries[index] = {
      ...newEntries[index],
      sizeId,
      sizeName: selectedSize?.size.value?.toString() || "",
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
    return getTotalQuantity() * pricePreview.profitPerItem;
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
      toast.error("Vui lÃ²ng chá»n sáº£n pháº©m vÃ  mÃ u sáº¯c!");
      return;
    }

    if (sizeEntries.length === 0) {
      toast.error("Vui lÃ²ng thÃªm Ã­t nháº¥t má»™t kÃ­ch thÆ°á»›c!");
      return;
    }

    // Check if all sizes have valid selection
    const invalidEntries = sizeEntries.filter(
      (entry) => !entry.sizeId || entry.quantity <= 0
    );
    if (invalidEntries.length > 0) {
      toast.error(
        "Vui lÃ²ng chá»n kÃ­ch thÆ°á»›c vÃ  nháº­p sá»‘ lÆ°á»£ng há»£p lá»‡ cho táº¥t cáº£ cÃ¡c dÃ²ng!"
      );
      return;
    }

    if (formData.costPrice <= 0) {
      toast.error("GiÃ¡ vá»‘n pháº£i lá»›n hÆ¡n 0!");
      return;
    }

    try {
      setSubmitting(true);

      // Debug: Log data being sent
      console.log("===== STOCK IN DEBUG =====");
      console.log("Product ID:", formData.productId);
      console.log("Variant ID:", formData.variantId);
      console.log("Size Entries:", JSON.stringify(sizeEntries, null, 2));
      console.log("All Variants:", JSON.stringify(variants, null, 2));
      console.log(
        "Available Sizes Full:",
        JSON.stringify(availableSizes, null, 2)
      );

      // Submit all sizes in parallel using Promise.all
      const promises = sizeEntries.map((entry) => {
        const payload = {
          productId: formData.productId,
          variantId: formData.variantId,
          sizeId: entry.sizeId,
          quantity: entry.quantity,
          costPrice: formData.costPrice,
          targetProfitPercent: formData.targetProfitPercent,
          percentDiscount: formData.percentDiscount,
          note: formData.note,
        };
        console.log("Sending payload:", payload);
        return InventoryService.stockIn(payload);
      });

      await Promise.all(promises);

      toast.success(`âœ… Nháº­p kho thÃ nh cÃ´ng ${sizeEntries.length} kÃ­ch thÆ°á»›c!`);
      onSuccess();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "CÃ³ lá»—i xáº£y ra khi nháº­p kho");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl m-4 max-h-[90vh] overflow-y-auto">
        {/* Header - Modern Monochrome with gradient */}
        <div className="sticky top-0 bg-gradient-to-r from-mono-800 to-mono-900 text-white p-6 rounded-t-xl border-b border-mono-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg">
                <ShoppingBagIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Nháº­p kho hÃ ng</h2>
                <p className="text-sm text-mono-200 mt-1">
                  Nháº­p nhiá»u kÃ­ch thÆ°á»›c vá»›i giÃ¡ chung
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/10 rounded-lg p-2 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Selection */}
          <div className="bg-mono-50 border border-mono-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-mono-700">
                  <ShoppingBagIcon className="w-4 h-4" />
                  Sáº£n pháº©m <span className="text-mono-700">*</span>
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full border border-mono-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500 bg-white text-mono-900 transition-all"
                  required
                >
                  <option value="">-- Chá»n sáº£n pháº©m --</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Variant (Color) Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-mono-700">
                  <SwatchIcon className="w-4 h-4" />
                  MÃ u sáº¯c <span className="text-mono-700">*</span>
                </label>
                <select
                  value={formData.variantId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      variantId: e.target.value,
                    })
                  }
                  className="w-full border border-mono-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500 bg-white text-mono-900 transition-all disabled:bg-mono-100 disabled:cursor-not-allowed"
                  required
                  disabled={!formData.productId}
                >
                  <option value="">-- Chá»n mÃ u sáº¯c --</option>
                  {variants.map((variant) => (
                    <option key={variant._id} value={variant._id}>
                      {variant.color?.name || "N/A"}{" "}
                      {variant.gender && `- ${variant.gender}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Size Entries Section */}
          {formData.variantId && (
            <div className="border-2 border-mono-300 rounded-lg overflow-hidden">
              <div className="bg-mono-100 px-4 py-3 flex justify-between items-center border-b border-mono-300">
                <h3 className="font-bold text-mono-900 flex items-center gap-2">
                  <ScaleIcon className="w-5 h-5" />
                  Danh sÃ¡ch kÃ­ch thÆ°á»›c nháº­p kho
                </h3>
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="flex items-center gap-2 bg-mono-800 text-white px-4 py-2 rounded-lg hover:bg-mono-900 transition-all shadow-sm hover:shadow-md"
                >
                  <PlusIcon className="w-5 h-5" />
                  ThÃªm size
                </button>
              </div>

              <div className="p-4 bg-white">
                {sizeEntries.length === 0 ? (
                  <div className="text-center py-12 text-mono-500">
                    <ScaleIcon className="w-12 h-12 mx-auto mb-3 text-mono-300" />
                    <p className="text-lg font-medium">
                      ChÆ°a cÃ³ kÃ­ch thÆ°á»›c nÃ o
                    </p>
                    <p className="text-sm mt-1">
                      Nháº¥n "ThÃªm size" Ä‘á»ƒ báº¯t Ä‘áº§u nháº­p kho
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sizeEntries.map((entry, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-3 items-end bg-mono-50 p-4 rounded-lg border border-mono-200 hover:border-mono-400 transition-all"
                      >
                        {/* Size Selection */}
                        <div className="col-span-5">
                          <label className="block text-xs font-semibold mb-2 text-mono-600 uppercase tracking-wide">
                            KÃ­ch thÆ°á»›c
                          </label>
                          <select
                            value={entry.sizeId}
                            onChange={(e) =>
                              handleSizeChange(index, e.target.value)
                            }
                            className="w-full border border-mono-300 px-3 py-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
                            required
                          >
                            <option value="">-- Chá»n size --</option>
                            {availableSizes.map((sizeItem) => (
                              <option
                                key={sizeItem.size._id}
                                value={sizeItem.size._id}
                                disabled={isSizeSelected(
                                  sizeItem.size._id,
                                  index
                                )}
                              >
                                Size {sizeItem.size.value} (Tá»“n:{" "}
                                {sizeItem.quantity})
                                {isSizeSelected(sizeItem.size._id, index) &&
                                  " - ÄÃ£ chá»n"}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity Input */}
                        <div className="col-span-3">
                          <label className="block text-xs font-semibold mb-2 text-mono-600 uppercase tracking-wide">
                            Sá»‘ lÆ°á»£ng nháº­p
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
                            className="w-full border border-mono-300 px-3 py-2.5 rounded-lg text-sm font-semibold text-mono-900 focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
                            min="1"
                            required
                          />
                        </div>

                        {/* Current Stock Display */}
                        <div className="col-span-3">
                          <label className="block text-xs font-semibold mb-2 text-mono-600 uppercase tracking-wide">
                            Tá»“n hiá»‡n táº¡i
                          </label>
                          <div className="bg-mono-200 px-3 py-2.5 rounded-lg text-sm font-bold text-mono-700 text-center">
                            {entry.currentStock}
                          </div>
                        </div>

                        {/* Delete Button */}
                        <div className="col-span-1">
                          <button
                            type="button"
                            onClick={() => handleRemoveSize(index)}
                            className="w-full bg-mono-800 text-white p-2.5 rounded-lg hover:bg-mono-800 transition-colors shadow-sm hover:shadow-md"
                            title="XÃ³a dÃ²ng nÃ y"
                          >
                            <TrashIcon className="w-5 h-5 mx-auto" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total Quantity Summary */}
                {sizeEntries.length > 0 && (
                  <div className="mt-4 bg-mono-800 text-white rounded-lg p-4 shadow-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold flex items-center gap-2">
                        <ChartBarIcon className="w-5 h-5" />
                        Tá»•ng sá»‘ lÆ°á»£ng nháº­p:
                      </span>
                      <span className="text-2xl font-bold">
                        {getTotalQuantity()} sáº£n pháº©m
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Common Pricing Section */}
          <div className="border-2 border-mono-300 rounded-lg overflow-hidden">
            <div className="bg-mono-100 px-4 py-3 border-b border-mono-300">
              <h3 className="font-bold text-mono-900 flex items-center gap-2">
                <CurrencyDollarIcon className="w-5 h-5" />
                ThÃ´ng tin giÃ¡ chung (Ã¡p dá»¥ng cho táº¥t cáº£ size)
              </h3>
            </div>
            <div className="p-4 bg-white">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-2 text-mono-600 uppercase tracking-wide">
                    GiÃ¡ vá»‘n (â‚«) <span className="text-mono-700">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.costPrice || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        costPrice: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="Nháº­p giÃ¡ vá»‘n"
                    className="w-full border border-mono-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500 font-semibold text-mono-900"
                    min="0"
                    required
                  />
                  {/* Äá» xuáº¥t giÃ¡ nhanh */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, costPrice: 100000 })
                      }
                      className="px-3 py-1 text-xs bg-mono-100 hover:bg-mono-200 border border-mono-300 rounded-lg transition-colors"
                    >
                      100K
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, costPrice: 200000 })
                      }
                      className="px-3 py-1 text-xs bg-mono-100 hover:bg-mono-200 border border-mono-300 rounded-lg transition-colors"
                    >
                      200K
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, costPrice: 500000 })
                      }
                      className="px-3 py-1 text-xs bg-mono-100 hover:bg-mono-200 border border-mono-300 rounded-lg transition-colors"
                    >
                      500K
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, costPrice: 1000000 })
                      }
                      className="px-3 py-1 text-xs bg-mono-100 hover:bg-mono-200 border border-mono-300 rounded-lg transition-colors"
                    >
                      1 triá»‡u
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, costPrice: 2000000 })
                      }
                      className="px-3 py-1 text-xs bg-mono-100 hover:bg-mono-200 border border-mono-300 rounded-lg transition-colors"
                    >
                      2 triá»‡u
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2 text-mono-600 uppercase tracking-wide">
                    Má»¥c tiÃªu lÃ£i (%)
                  </label>
                  <input
                    type="number"
                    value={formData.targetProfitPercent || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetProfitPercent: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="VD: 30"
                    className="w-full border border-mono-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500 font-semibold text-mono-900"
                    min="0"
                  />
                  {/* Äá» xuáº¥t % lá»£i nhuáº­n */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, targetProfitPercent: 20 })
                      }
                      className="px-3 py-1 text-xs bg-mono-100 hover:bg-mono-200 border border-mono-300 rounded-lg transition-colors"
                    >
                      20%
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, targetProfitPercent: 30 })
                      }
                      className="px-3 py-1 text-xs bg-mono-100 hover:bg-mono-200 border border-mono-300 rounded-lg transition-colors"
                    >
                      30%
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, targetProfitPercent: 50 })
                      }
                      className="px-3 py-1 text-xs bg-mono-100 hover:bg-mono-200 border border-mono-300 rounded-lg transition-colors"
                    >
                      50%
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2 text-mono-600 uppercase tracking-wide">
                    Giáº£m giÃ¡ (%)
                  </label>
                  <input
                    type="number"
                    value={formData.percentDiscount || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        percentDiscount: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="VD: 10"
                    className="w-full border border-mono-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500 font-semibold text-mono-900"
                    min="0"
                    max="100"
                  />
                  {/* Äá» xuáº¥t % giáº£m giÃ¡ */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, percentDiscount: 0 })
                      }
                      className="px-3 py-1 text-xs bg-mono-100 hover:bg-mono-200 border border-mono-300 rounded-lg transition-colors"
                    >
                      0%
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, percentDiscount: 10 })
                      }
                      className="px-3 py-1 text-xs bg-mono-100 hover:bg-mono-200 border border-mono-300 rounded-lg transition-colors"
                    >
                      10%
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, percentDiscount: 20 })
                      }
                      className="px-3 py-1 text-xs bg-mono-100 hover:bg-mono-200 border border-mono-300 rounded-lg transition-colors"
                    >
                      20%
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold mb-2 text-mono-600 uppercase tracking-wide">
                  Ghi chÃº
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  className="w-full border border-mono-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500 text-mono-900"
                  rows={2}
                  placeholder="Nháº­p ghi chÃº (khÃ´ng báº¯t buá»™c)"
                />
              </div>
            </div>
          </div>

          {/* Pricing Formula Display */}
          <div className="bg-mono-50 border border-mono-200 rounded-lg p-4">
            <h3 className="font-bold text-sm text-mono-900 mb-3 flex items-center gap-2">
              <CalculatorIcon className="w-5 h-5" />
              CÃ´ng thá»©c tÃ­nh giÃ¡
            </h3>
            <div className="space-y-2 text-sm">
              <div className="bg-white rounded-lg p-3 border border-mono-200">
                <code className="text-xs font-mono text-mono-700">
                  GiÃ¡ gá»‘c = GiÃ¡ vá»‘n Ã— (1 + Má»¥c tiÃªu lÃ£i / 100)
                </code>
              </div>
              <div className="bg-white rounded-lg p-3 border border-mono-200">
                <code className="text-xs font-mono text-mono-700">
                  GiÃ¡ bÃ¡n = GiÃ¡ gá»‘c Ã— (1 - Giáº£m giÃ¡ / 100)
                </code>
              </div>
              <div className="bg-white rounded-lg p-3 border border-mono-200">
                <code className="text-xs font-mono text-mono-700">
                  LÃ£i thá»±c = GiÃ¡ bÃ¡n - GiÃ¡ vá»‘n
                </code>
              </div>
            </div>
          </div>

          {/* Price Preview */}
          {pricePreview && (
            <div className="bg-gradient-to-r from-mono-800 to-mono-900 text-white rounded-lg p-5 shadow-xl">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5" />
                Káº¿t quáº£ tÃ­nh toÃ¡n
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-xs text-mono-200 mb-1">
                    GiÃ¡ bÃ¡n / sáº£n pháº©m
                  </p>
                  <p className="text-xl font-bold">
                    {formatCurrency(pricePreview.calculatedPriceFinal)}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-xs text-mono-200 mb-1">LÃ£i / sáº£n pháº©m</p>
                  <p className="text-xl font-bold text-mono-300">
                    {formatCurrency(pricePreview.profitPerItem)}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-xs text-mono-200 mb-1">Tá»•ng giÃ¡ vá»‘n</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(getTotalCost())}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-xs text-mono-200 mb-1">Tá»•ng lÃ£i dá»± kiáº¿n</p>
                  <p className="text-lg font-bold text-mono-300">
                    {formatCurrency(getTotalProfit())}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                <div className="bg-white/5 rounded p-2">
                  <span className="text-mono-200">Margin:</span>{" "}
                  <span className="font-bold">{pricePreview.margin}%</span>
                </div>
                <div className="bg-white/5 rounded p-2">
                  <span className="text-mono-200">Markup:</span>{" "}
                  <span className="font-bold">{pricePreview.markup}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-mono-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-mono-300 text-mono-700 rounded-lg hover:bg-mono-100 font-semibold transition-all"
              disabled={submitting}
            >
              Há»§y
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-mono-800 text-white rounded-lg hover:bg-mono-900 font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? "Äang nháº­p kho..." : "Nháº­p kho"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockInModal;



