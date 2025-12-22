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
  sizeType: string; // Loại size: EU, US, UK, VN
  quantity: number;
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

// Thông tin tồn kho hiện tại của size
interface ExistingInventoryInfo {
  sizeId: string;
  currentQuantity: number;
  currentAvgCost: number;
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

  // Thông tin tồn kho hiện tại của các size (để hiển thị cảnh báo giá vốn TB)
  const [existingInventory, setExistingInventory] = useState<
    ExistingInventoryInfo[]
  >([]);

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
        console.log("Selected variant sizes:", variant.sizes);
        setAvailableSizes(variant.sizes);
      } else {
        console.log("No sizes found for variant");
        setAvailableSizes([]);
      }
      setSizeEntries([]);
    } else {
      setAvailableSizes([]);
      setSizeEntries([]);
    }
  }, [formData.variantId, variants]);

  // Fetch existing inventory info when variant changes (for weighted average cost warning)
  useEffect(() => {
    const fetchExistingInventory = async () => {
      if (formData.productId && formData.variantId) {
        try {
          // Get inventory list filtered by product and variant
          const response = await InventoryService.getInventoryList({
            productId: formData.productId,
            variantId: formData.variantId,
            limit: 100,
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const items = (response.data?.data as any)?.items || [];
          const existingInfo: ExistingInventoryInfo[] = items.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (item: any) => ({
              sizeId: item.size?._id || "",
              currentQuantity: item.quantity || 0,
              currentAvgCost: item.averageCostPrice || 0,
            })
          );
          setExistingInventory(existingInfo);
        } catch (error) {
          console.error("Error fetching existing inventory:", error);
          setExistingInventory([]);
        }
      } else {
        setExistingInventory([]);
      }
    };
    fetchExistingInventory();
  }, [formData.productId, formData.variantId]);

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
      console.log(" Fetched products:", response.data.data);
      console.log("Full API response:", response.data);
      // The API returns products in response.data.data.data (paginated response)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseData = response.data.data as any;
      const productsData = responseData?.data || responseData || [];
      console.log("Extracted products:", productsData);
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
    console.log("Selected product:", product);

    // Product list API doesn't include variants (deleted for performance)
    // Need to fetch full product details to get variants
    if (productId) {
      try {
        console.log("Fetching full product details for:", productId);
        const detailResponse = await productAdminService.getProductById(
          productId
        );
        console.log("Full API response:", detailResponse.data);
        // Backend returns { success: true, product: {...} } not { data: {...} }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseData = detailResponse.data as any;
        const fullProduct = responseData.product || responseData.data || null;

        console.log("Full product with variants:", fullProduct);
        console.log("Product variants:", fullProduct?.variants);
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
        sizeType: "",
        quantity: 1,
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
      sizeType: selectedSize?.size.type || "",
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

  // Get existing inventory info for a size
  const getExistingInfo = (sizeId: string) => {
    return existingInventory.find((info) => info.sizeId === sizeId);
  };

  // Calculate estimated new average cost after import
  const calculateEstimatedAvgCost = (sizeId: string, newQuantity: number) => {
    const existing = getExistingInfo(sizeId);
    if (!existing || existing.currentQuantity === 0) {
      return formData.costPrice; // First import, avg = cost price
    }
    const currentTotalCost = existing.currentAvgCost * existing.currentQuantity;
    const newTotalCost = formData.costPrice * newQuantity;
    const totalQuantity = existing.currentQuantity + newQuantity;
    return totalQuantity > 0
      ? (currentTotalCost + newTotalCost) / totalQuantity
      : formData.costPrice;
  };

  // Check if any selected size has existing inventory
  const hasExistingInventory = () => {
    return sizeEntries.some((entry) => {
      const existing = getExistingInfo(entry.sizeId);
      return existing && existing.currentQuantity > 0;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.productId || !formData.variantId) {
      toast.error("Vui lòng chọn sản phẩm và màu sắc!");
      return;
    }

    if (sizeEntries.length === 0) {
      toast.error("Vui lòng thêm ít nhất một kích thước!");
      return;
    }

    // Check if all sizes have valid selection
    const invalidEntries = sizeEntries.filter(
      (entry) => !entry.sizeId || entry.quantity <= 0
    );
    if (invalidEntries.length > 0) {
      toast.error(
        "Vui lòng chọn kích thước và nhập số lượng hợp lệ cho tất cả các dòng!"
      );
      return;
    }

    if (formData.costPrice <= 0) {
      toast.error("Giá vốn phải lớn hơn 0!");
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

      toast.success(`Nhập kho thành công ${sizeEntries.length} kích thước!`);
      onSuccess();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Có lỗi xảy ra khi nhập kho");
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl m-4 max-h-[90vh] overflow-visible">
        <div className="max-h-[82vh] overflow-y-auto">
          {/* Header - White background */}
          <div className="sticky top-0 bg-white text-mono-900 p-6 rounded-t-xl border-b border-mono-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-mono-50 p-2 rounded-lg">
                  <ShoppingBagIcon className="w-6 h-6 text-mono-800" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Nhập kho hàng</h2>
                  <p className="text-sm text-mono-500 mt-1">
                    Nhập nhiều kích thước với giá chung
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-mono-800 hover:bg-mono-100 rounded-lg p-2 transition-colors"
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
                    Sản phẩm <span className="text-mono-700">*</span>
                  </label>
                  <select
                    value={formData.productId}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full border border-mono-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500 bg-white text-mono-900 transition-all"
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
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-mono-700">
                    <SwatchIcon className="w-4 h-4" />
                    Màu sắc <span className="text-mono-700">*</span>
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
                    <option value="">-- Chọn màu sắc --</option>
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
                    Danh sách kích thước nhập kho
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="flex items-center gap-2 bg-mono-800 text-white px-4 py-2 rounded-lg hover:bg-mono-900 transition-all shadow-sm hover:shadow-md"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Thêm size
                  </button>
                </div>

                <div className="p-4 bg-white">
                  {sizeEntries.length === 0 ? (
                    <div className="text-center py-12 text-mono-500">
                      <ScaleIcon className="w-12 h-12 mx-auto mb-3 text-mono-300" />
                      <p className="text-lg font-medium">
                        Chưa có kích thước nào
                      </p>
                      <p className="text-sm mt-1">
                        Nhấn "Thêm size" để bắt đầu nhập kho
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Table header */}
                      <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-mono-100 rounded-t-lg border-b border-mono-200 text-xs font-semibold text-mono-600 uppercase tracking-wide">
                        <div className="col-span-5">Kích thước</div>
                        <div className="col-span-2 text-center">Loại size</div>
                        <div className="col-span-4 text-center">
                          Số lượng nhập
                        </div>
                        <div className="col-span-1 text-center">Xóa</div>
                      </div>
                      <div className="space-y-3 mt-3">
                        {sizeEntries.map((entry, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-12 gap-3 items-center bg-mono-50 p-4 rounded-lg border border-mono-200 hover:border-mono-400 transition-all"
                          >
                            {/* Size Selection */}
                            <div className="col-span-5">
                              <select
                                value={entry.sizeId}
                                onChange={(e) =>
                                  handleSizeChange(index, e.target.value)
                                }
                                className="w-full border border-mono-300 px-3 py-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
                                required
                              >
                                <option value="">-- Chọn size --</option>
                                {availableSizes.map((sizeItem) => (
                                  <option
                                    key={sizeItem.size._id}
                                    value={sizeItem.size._id}
                                    disabled={isSizeSelected(
                                      sizeItem.size._id,
                                      index
                                    )}
                                  >
                                    {sizeItem.size.value} (
                                    {sizeItem.size.type || "EU"})
                                    {isSizeSelected(sizeItem.size._id, index) &&
                                      " ✓"}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Size Type Display */}
                            <div className="col-span-2 text-center">
                              {entry.sizeType ? (
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                    entry.sizeType === "EU"
                                      ? "bg-blue-100 text-blue-800"
                                      : entry.sizeType === "US"
                                      ? "bg-red-100 text-red-800"
                                      : entry.sizeType === "UK"
                                      ? "bg-purple-100 text-purple-800"
                                      : entry.sizeType === "VN"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-mono-100 text-mono-800"
                                  }`}
                                >
                                  {entry.sizeType}
                                </span>
                              ) : (
                                <span className="text-mono-400">-</span>
                              )}
                            </div>

                            {/* Quantity Input */}
                            <div className="col-span-4">
                              <input
                                type="number"
                                value={entry.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    index,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-full border border-mono-300 px-3 py-2.5 rounded-lg text-sm font-semibold text-mono-900 focus:ring-2 focus:ring-mono-500 focus:border-mono-500 text-center"
                                min="1"
                                required
                              />
                            </div>

                            {/* Delete Button */}
                            <div className="col-span-1 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveSize(index)}
                                className="bg-mono-800 text-white p-2.5 rounded-lg hover:bg-mono-900 transition-colors shadow-sm hover:shadow-md"
                                title="Xóa dòng này"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Total Quantity Summary */}
                  {sizeEntries.length > 0 && (
                    <div className="mt-4 bg-mono-800 text-white rounded-lg p-4 shadow-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold flex items-center gap-2">
                          <ChartBarIcon className="w-5 h-5" />
                          Tổng số lượng nhập:
                        </span>
                        <span className="text-2xl font-bold">
                          {getTotalQuantity()} sản phẩm
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Weighted Average Cost Warning */}
                  {sizeEntries.length > 0 &&
                    hasExistingInventory() &&
                    formData.costPrice > 0 && (
                      <div className="mt-4 bg-amber-50 border border-amber-300 rounded-lg p-4">
                        <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
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
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          ⚠️ Sản phẩm đã có trong kho - Giá sẽ được tính theo
                          trung bình có trọng số
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-amber-700 border-b border-amber-200">
                                <th className="pb-2">Size</th>
                                <th className="pb-2">Tồn hiện tại</th>
                                <th className="pb-2">Giá vốn TB hiện tại</th>
                                <th className="pb-2">SL nhập</th>
                                <th className="pb-2">Giá vốn TB dự kiến</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sizeEntries
                                .filter((entry) => {
                                  const existing = getExistingInfo(
                                    entry.sizeId
                                  );
                                  return (
                                    existing && existing.currentQuantity > 0
                                  );
                                })
                                .map((entry) => {
                                  const existing = getExistingInfo(
                                    entry.sizeId
                                  );
                                  const estimatedAvg =
                                    calculateEstimatedAvgCost(
                                      entry.sizeId,
                                      entry.quantity
                                    );
                                  return (
                                    <tr
                                      key={entry.sizeId}
                                      className="border-b border-amber-100"
                                    >
                                      <td className="py-2 font-medium">
                                        {entry.sizeName}
                                      </td>
                                      <td className="py-2">
                                        {existing?.currentQuantity || 0}
                                      </td>
                                      <td className="py-2">
                                        {(
                                          existing?.currentAvgCost || 0
                                        ).toLocaleString("vi-VN")}
                                        đ
                                      </td>
                                      <td className="py-2">{entry.quantity}</td>
                                      <td className="py-2 font-bold text-green-700">
                                        {Math.round(
                                          estimatedAvg
                                        ).toLocaleString("vi-VN")}
                                        đ
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                        <p className="text-xs text-amber-600 mt-3">
                          💡 Giá bán sẽ được tính dựa trên giá vốn trung bình
                          mới (weighted average cost)
                        </p>
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
                  Thông tin giá chung (áp dụng cho tất cả size)
                </h3>
              </div>
              <div className="p-4 bg-white">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-mono-600 uppercase tracking-wide">
                      Giá vốn (₫) <span className="text-mono-700">*</span>
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
                      placeholder="Nhập giá vốn"
                      className="w-full border border-mono-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500 font-semibold text-mono-900"
                      min="0"
                      required
                    />
                    {/* Đề xuất giá nhanh */}
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
                        1 triệu
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, costPrice: 2000000 })
                        }
                        className="px-3 py-1 text-xs bg-mono-100 hover:bg-mono-200 border border-mono-300 rounded-lg transition-colors"
                      >
                        2 triệu
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, costPrice: 2500000 })
                        }
                        className="px-3 py-1 text-xs bg-mono-100 hover:bg-mono-200 border border-mono-300 rounded-lg transition-colors"
                      >
                        2,5 triệu
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, costPrice: 3500000 })
                        }
                        className="px-3 py-1 text-xs bg-mono-100 hover:bg-mono-200 border border-mono-300 rounded-lg transition-colors"
                      >
                        3,5 triệu
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-mono-600 uppercase tracking-wide">
                      Mục tiêu lãi (%)
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
                    {/* Đề xuất % lợi nhuận */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, targetProfitPercent: 10 })
                        }
                        className="px-3 py-1 text-xs bg-mono-100 hover:bg-mono-200 border border-mono-300 rounded-lg transition-colors"
                      >
                        10%
                      </button>
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
                      Giảm giá (%)
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
                    {/* Đề xuất % giảm giá */}
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
                          setFormData({ ...formData, percentDiscount: 5 })
                        }
                        className="px-3 py-1 text-xs bg-mono-100 hover:bg-mono-200 border border-mono-300 rounded-lg transition-colors"
                      >
                        5%
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
                    Ghi chú
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                    className="w-full border border-mono-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500 text-mono-900"
                    rows={2}
                    placeholder="Nhập ghi chú (không bắt buộc)"
                  />
                </div>
              </div>
            </div>

            {/* Pricing Formula Display */}
            <div className="bg-mono-50 border border-mono-200 rounded-lg p-4">
              <h3 className="font-bold text-sm text-mono-900 mb-3 flex items-center gap-2">
                <CalculatorIcon className="w-5 h-5" />
                Công thức tính giá
              </h3>
              <div className="space-y-2 text-sm">
                <div className="bg-white rounded-lg p-3 border border-mono-200">
                  <code className="text-xs font-mono text-mono-700">
                    Giá gốc = Giá vốn × (1 + Mục tiêu lãi / 100)
                  </code>
                </div>
                <div className="bg-white rounded-lg p-3 border border-mono-200">
                  <code className="text-xs font-mono text-mono-700">
                    Giá bán = Giá gốc × (1 - Giảm giá / 100)
                  </code>
                </div>
                <div className="bg-white rounded-lg p-3 border border-mono-200">
                  <code className="text-xs font-mono text-mono-700">
                    Lãi thực = Giá bán - Giá vốn
                  </code>
                </div>
              </div>
            </div>

            {/* Price Preview */}
            {pricePreview && (
              <div className="bg-gradient-to-r from-mono-800 to-mono-900 text-white rounded-lg p-5 shadow-xl">
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5" />
                  Kết quả tính toán
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-xs text-mono-200 mb-1">
                      Giá bán / sản phẩm
                    </p>
                    <p className="text-xl font-bold">
                      {formatCurrency(pricePreview.calculatedPriceFinal)}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-xs text-mono-200 mb-1">Lãi / sản phẩm</p>
                    <p className="text-xl font-bold text-mono-300">
                      {formatCurrency(pricePreview.profitPerItem)}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-xs text-mono-200 mb-1">Tổng giá vốn</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(getTotalCost())}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-xs text-mono-200 mb-1">
                      Tổng lãi dự kiến
                    </p>
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
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-mono-800 text-white rounded-lg hover:bg-mono-900 font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? "Đang nhập kho..." : "Nhập kho"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockInModal;
