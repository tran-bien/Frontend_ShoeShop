import { useState, useEffect } from "react";
import {
  FaPlus,
  FaBox,
  FaChartLine,
  FaExclamationTriangle,
  FaDollarSign,
  FaTimes,
} from "react-icons/fa";
import InventoryService, {
  InventoryStats,
} from "../../../services/InventoryService";
import { productAdminService } from "../../../services/ProductService";
import type { InventoryItem } from "../../../types/inventory";
import type { Product } from "../../../types/product";
import StockInModal from "../../../components/Admin/Inventory/StockInModal";
import StockOutModal from "../../../components/Admin/Inventory/StockOutModal";
import AdjustStockModal from "../../../components/Admin/Inventory/AdjustStockModal";
import TransactionHistoryModal from "../../../components/Admin/Inventory/TransactionHistoryModal";
import InventoryDetailModal from "../../../components/Admin/Inventory/InventoryDetailModal";

// Interface cho variant đã populate
interface PopulatedVariant {
  _id: string;
  color?: {
    _id: string;
    name: string;
    hexCode?: string;
  };
  imagesvariant?: { url: string }[];
}

const InventoryPage = () => {
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    lowStock: false,
    outOfStock: false,
    productId: "",
    variantId: "",
  });

  // Product selection state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Product list from inventory (for dropdown)
  const [inventoryProducts, setInventoryProducts] = useState<
    { _id: string; name: string }[]
  >([]);

  // Variant selection state
  const [variants, setVariants] = useState<PopulatedVariant[]>([]);
  const [selectedVariant, setSelectedVariant] =
    useState<PopulatedVariant | null>(null);

  // Summary state
  const [productSummary, setProductSummary] = useState<{
    totalQuantity: number;
    totalValue: number;
    variantCount: number;
    // Pricing info
    avgCostPrice: number;
    avgSellingPrice: number;
    avgFinalPrice: number;
    avgDiscountPercent: number;
    expectedProfit: number;
    profitMargin: number;
  } | null>(null);

  // Modals
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showStockOutModal, setShowStockOutModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      console.log("Fetching inventory with params:", {
        page: currentPage,
        limit: 20,
        lowStock: filter.lowStock || undefined,
        outOfStock: filter.outOfStock || undefined,
        productId: filter.productId || undefined,
        variantId: filter.variantId || undefined,
      });

      const response = await InventoryService.getInventoryList({
        page: currentPage,
        limit: 20,
        lowStock: filter.lowStock || undefined,
        outOfStock: filter.outOfStock || undefined,
        productId: filter.productId || undefined,
        variantId: filter.variantId || undefined,
      });

      console.log("Inventory response:", response);

      // Response structure: { data: { success, data: { items, pagination } } }
      const responseData = response.data.data as unknown as {
        items: InventoryItem[];
        pagination: { totalPages: number };
      };
      const items = responseData?.items || [];
      const pages = responseData?.pagination?.totalPages || 1;

      console.log("Setting inventory list:", items.length, "items");
      console.log("Total pages:", pages);

      setInventoryList(items);
      setTotalPages(pages);

      // Calculate summary if filtering by product
      if (filter.productId && items.length > 0) {
        const totalQuantity = items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const totalValue = items.reduce(
          (sum, item) => sum + item.quantity * item.averageCostPrice,
          0
        );
        const variantIds = new Set(items.map((item) => item.variant?._id));

        // Calculate weighted average prices
        const totalWeightedCostPrice = items.reduce(
          (sum, item) => sum + item.quantity * (item.averageCostPrice || 0),
          0
        );
        const totalWeightedSellingPrice = items.reduce(
          (sum, item) => sum + item.quantity * (item.sellingPrice || 0),
          0
        );
        const totalWeightedFinalPrice = items.reduce(
          (sum, item) => sum + item.quantity * (item.finalPrice || 0),
          0
        );
        const totalWeightedDiscount = items.reduce(
          (sum, item) => sum + item.quantity * (item.percentDiscount || 0),
          0
        );

        const avgCostPrice =
          totalQuantity > 0 ? totalWeightedCostPrice / totalQuantity : 0;
        const avgSellingPrice =
          totalQuantity > 0 ? totalWeightedSellingPrice / totalQuantity : 0;
        const avgFinalPrice =
          totalQuantity > 0 ? totalWeightedFinalPrice / totalQuantity : 0;
        const avgDiscountPercent =
          totalQuantity > 0 ? totalWeightedDiscount / totalQuantity : 0;

        // Calculate expected profit
        const expectedProfit = items.reduce(
          (sum, item) =>
            sum +
            item.quantity *
              ((item.finalPrice || 0) - (item.averageCostPrice || 0)),
          0
        );

        // Calculate profit margin
        const profitMargin =
          avgFinalPrice > 0
            ? ((avgFinalPrice - avgCostPrice) / avgFinalPrice) * 100
            : 0;

        setProductSummary({
          totalQuantity,
          totalValue,
          variantCount: variantIds.size,
          avgCostPrice: Math.round(avgCostPrice),
          avgSellingPrice: Math.round(avgSellingPrice),
          avgFinalPrice: Math.round(avgFinalPrice),
          avgDiscountPercent: Math.round(avgDiscountPercent * 10) / 10,
          expectedProfit: Math.round(expectedProfit),
          profitMargin: Math.round(profitMargin * 10) / 10,
        });
      } else {
        setProductSummary(null);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setInventoryList([]);
      setTotalPages(1);
      setProductSummary(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle variant selection
  const handleSelectVariant = (variant: PopulatedVariant | null) => {
    setSelectedVariant(variant);
    setFilter({ ...filter, variantId: variant?._id || "" });
    setCurrentPage(1);
  };

  // Clear product filter
  const handleClearProductFilter = () => {
    setSelectedProduct(null);
    setSelectedVariant(null);
    setVariants([]);
    setFilter({ ...filter, productId: "", variantId: "" });
    setCurrentPage(1);
  };

  const fetchStats = async () => {
    try {
      const response = await InventoryService.getInventoryStats();
      // Response structure: { data: { success, data } }
      setStats(response.data.data || null);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats(null);
    }
  };

  // Fetch unique products from inventory for dropdown
  const fetchInventoryProducts = async () => {
    try {
      // Get all inventory items to extract unique products
      const response = await InventoryService.getInventoryList({
        page: 1,
        limit: 100, // Get all to extract unique products
      });

      const responseData = response.data.data as unknown as {
        items: InventoryItem[];
      };
      const items = responseData?.items || [];

      // Extract unique products
      const uniqueProducts = new Map<string, { _id: string; name: string }>();
      items.forEach((item) => {
        if (item.product?._id && item.product?.name) {
          uniqueProducts.set(item.product._id, {
            _id: item.product._id,
            name: item.product.name,
          });
        }
      });

      setInventoryProducts(Array.from(uniqueProducts.values()));
    } catch (error) {
      console.error("Error fetching inventory products:", error);
      setInventoryProducts([]);
    }
  };

  // Handle product selection from dropdown
  const handleSelectProductFromDropdown = async (productId: string) => {
    if (!productId) {
      handleClearProductFilter();
      return;
    }

    // Find product info from inventoryProducts or fetch it
    const productInfo = inventoryProducts.find((p) => p._id === productId);
    if (productInfo) {
      // Create a minimal product object for display
      const product = {
        _id: productInfo._id,
        name: productInfo.name,
      } as Product;

      setSelectedProduct(product);
      setFilter({ ...filter, productId: productInfo._id, variantId: "" });
      setSelectedVariant(null);
      setCurrentPage(1);

      // Fetch variants for this product
      try {
        const response = await productAdminService.getProductById(productId);
        const fullProduct = response.data.data as Product;
        if (fullProduct?.variants) {
          setVariants(fullProduct.variants as unknown as PopulatedVariant[]);
        }
      } catch (error) {
        console.error("Error fetching variants:", error);
        setVariants([]);
      }
    }
  };

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchInventory();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filter]);

  // Fetch inventory products on mount
  useEffect(() => {
    fetchInventoryProducts();
  }, []);

  const handleStockIn = () => {
    setShowStockInModal(true);
  };

  const handleViewTransactions = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowTransactionModal(true);
  };

  const handleViewDetail = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleStockOut = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowStockOutModal(true);
  };

  const handleAdjustStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowAdjustModal(true);
  };

  const onSuccess = () => {
    fetchInventory();
    fetchStats();
    setShowStockInModal(false);
    setShowStockOutModal(false);
    setShowAdjustModal(false);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-mono-800">Quản lý Kho hàng</h1>
        <button
          onClick={handleStockIn}
          className="bg-mono-black hover:bg-mono-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaPlus size={20} />
          Nhập kho
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-mono-500 text-sm">Tổng mã sản phẩm</p>
                <p className="text-2xl font-bold text-mono-800">
                  {stats.totalItems}
                </p>
              </div>
              <FaBox className="text-mono-500" size={40} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-mono-500 text-sm">Tồn kho thấp</p>
                <p className="text-2xl font-bold text-mono-700">
                  {stats.lowStockItems || 0}
                </p>
              </div>
              <FaChartLine className="text-mono-600" size={40} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-mono-500 text-sm">Hết hàng</p>
                <p className="text-2xl font-bold text-mono-900">
                  {stats.outOfStockItems || 0}
                </p>
              </div>
              <FaExclamationTriangle className="text-mono-800" size={40} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-mono-500 text-sm">Giá trị tồn kho</p>
                <p className="text-2xl font-bold text-mono-800">
                  {stats.totalValue?.toLocaleString("vi-VN")}đ
                </p>
              </div>
              <FaDollarSign className="text-mono-700" size={40} />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col gap-4">
          {/* Row 1: Product and Variant filters */}
          <div className="flex flex-wrap gap-4 items-end">
            {/* Product Dropdown - Select from inventory products */}
            <div className="min-w-[300px] flex-1 max-w-[400px]">
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Lọc theo sản phẩm
              </label>
              <select
                value={filter.productId}
                onChange={(e) =>
                  handleSelectProductFromDropdown(e.target.value)
                }
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 bg-white"
              >
                <option value="">-- Tất cả sản phẩm --</option>
                {inventoryProducts.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Variant Dropdown - only show when product is selected */}
            {selectedProduct && variants.length > 0 && (
              <div className="min-w-[200px]">
                <label className="block text-sm font-medium text-mono-700 mb-1">
                  Lọc theo biến thể
                </label>
                <select
                  value={selectedVariant?._id || ""}
                  onChange={(e) => {
                    const variant = variants.find(
                      (v) => v._id === e.target.value
                    );
                    handleSelectVariant(variant || null);
                  }}
                  className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500"
                >
                  <option value="">Tất cả biến thể</option>
                  {variants.map((variant) => (
                    <option key={variant._id} value={variant._id}>
                      {variant.color?.name || "Không xác định"}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Clear filter button */}
            {selectedProduct && (
              <button
                onClick={handleClearProductFilter}
                className="px-3 py-2 text-sm text-mono-600 hover:text-mono-800 hover:bg-mono-100 rounded-lg border border-mono-300 flex items-center gap-1"
                title="Xóa bộ lọc"
              >
                <FaTimes size={12} />
                Xóa lọc
              </button>
            )}
          </div>

          {/* Row 2: Stock status filters */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filter.lowStock}
                onChange={(e) =>
                  setFilter({ ...filter, lowStock: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-sm text-mono-700">Tồn kho thấp</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filter.outOfStock}
                onChange={(e) =>
                  setFilter({ ...filter, outOfStock: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-sm text-mono-700">Hết hàng</span>
            </label>
          </div>
        </div>
      </div>

      {/* Product Summary - show when filtering by product */}
      {selectedProduct && productSummary && (
        <div className="bg-gradient-to-r from-mono-100 to-mono-50 p-4 rounded-lg shadow mb-6 border border-mono-200">
          <h3 className="text-lg font-semibold text-mono-800 mb-3">
            📦 Tổng quan tồn kho: {selectedProduct.name}
            {selectedVariant && (
              <span className="text-mono-600 font-normal ml-2">
                - Màu: {selectedVariant.color?.name}
              </span>
            )}
          </h3>

          {/* Row 1: Inventory Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-mono-500">Tổng số lượng tồn</p>
              <p className="text-2xl font-bold text-mono-800">
                {productSummary.totalQuantity.toLocaleString("vi-VN")}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-mono-500">Giá trị tồn kho (giá vốn)</p>
              <p className="text-2xl font-bold text-mono-800">
                {productSummary.totalValue.toLocaleString("vi-VN")}đ
              </p>
            </div>
            {!selectedVariant && (
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-mono-500">Số biến thể có tồn</p>
                <p className="text-2xl font-bold text-mono-800">
                  {productSummary.variantCount}
                </p>
              </div>
            )}
            <div className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-green-500">
              <p className="text-sm text-mono-500">Lợi nhuận dự kiến</p>
              <p className="text-2xl font-bold text-green-600">
                {productSummary.expectedProfit.toLocaleString("vi-VN")}đ
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-mono-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                Sản phẩm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                Hình ảnh
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                Biến thể / Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                Tồn kho
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                Giá vốn TB
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-mono-500">
                  Đang tải...
                </td>
              </tr>
            ) : inventoryList.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-mono-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              inventoryList.map((item) => (
                <tr key={item._id} className="hover:bg-mono-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-mono-900">
                      {item.product?.name || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Hiển thị ảnh biến thể nếu có */}
                      {item.variant?.imagesvariant?.[0]?.url ? (
                        <img
                          src={item.variant.imagesvariant[0].url}
                          alt={item.variant.color?.name || "Variant"}
                          className="w-16 h-16 object-cover rounded-lg border-2 border-mono-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-mono-100 rounded-lg flex items-center justify-center border-2 border-mono-200">
                          <span className="text-mono-400 text-xs">No img</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {/* Hiển thị màu sắc với color swatch */}
                      <div className="flex items-center gap-2">
                        {item.variant?.color?.hexCode && (
                          <div
                            className="w-5 h-5 rounded-full border-2 border-mono-300 shadow-sm"
                            style={{
                              backgroundColor: item.variant.color.hexCode,
                            }}
                            title={item.variant.color.name}
                          />
                        )}
                        <span className="text-sm font-semibold text-mono-900">
                          {item.variant?.color?.name || "N/A"}
                        </span>
                      </div>
                      {/* Hiển thị size */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-mono-600">Size:</span>
                        <span className="text-sm font-bold text-mono-900 bg-mono-100 px-2 py-0.5 rounded">
                          {item.size?.value || "N/A"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-mono-900">
                      {item.quantity}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-mono-900">
                      {item.averageCostPrice?.toLocaleString("vi-VN")}đ
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.isOutOfStock ? (
                      <span className="px-2 py-1 text-xs font-semibold text-mono-900 bg-mono-200 rounded">
                        Hết hàng
                      </span>
                    ) : item.isLowStock ? (
                      <span className="px-2 py-1 text-xs font-semibold text-mono-800 bg-mono-200 rounded">
                        Tồn kho thấp
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold text-mono-800 bg-mono-100 rounded">
                        Bình thường
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => handleViewDetail(item)}
                        className="px-3 py-1.5 text-xs font-medium text-mono-700 bg-mono-100 hover:bg-mono-200 rounded border border-mono-300 transition-colors"
                        title="Xem chi tiết"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => handleStockOut(item)}
                        className="px-3 py-1.5 text-xs font-medium text-mono-700 bg-white hover:bg-mono-50 rounded border border-mono-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Xuất kho"
                        disabled={item.isOutOfStock}
                      >
                        Xuất kho
                      </button>
                      <button
                        onClick={() => handleAdjustStock(item)}
                        className="px-3 py-1.5 text-xs font-medium text-mono-700 bg-white hover:bg-mono-50 rounded border border-mono-300 transition-colors"
                        title="Điều chỉnh tồn kho"
                      >
                        Điều chỉnh
                      </button>
                      <button
                        onClick={() => handleViewTransactions(item)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-mono-black hover:bg-mono-800 rounded border border-mono-black transition-colors"
                      >
                        Lịch sử
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-mono-200 rounded disabled:opacity-50"
          >
            Trước
          </button>
          <span className="px-4 py-2">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-mono-200 rounded disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}

      {/* Modals */}
      {showStockInModal && (
        <StockInModal
          onClose={() => setShowStockInModal(false)}
          onSuccess={onSuccess}
        />
      )}
      {showStockOutModal && selectedItem && (
        <StockOutModal
          item={selectedItem}
          onClose={() => setShowStockOutModal(false)}
          onSuccess={onSuccess}
        />
      )}
      {showAdjustModal && selectedItem && (
        <AdjustStockModal
          item={selectedItem}
          onClose={() => setShowAdjustModal(false)}
          onSuccess={onSuccess}
        />
      )}
      {showDetailModal && selectedItem && (
        <InventoryDetailModal
          itemId={selectedItem._id}
          onClose={() => setShowDetailModal(false)}
          onUpdate={() => {
            fetchInventory();
            fetchStats();
          }}
        />
      )}
      {showTransactionModal && selectedItem && (
        <TransactionHistoryModal
          item={selectedItem}
          onClose={() => setShowTransactionModal(false)}
        />
      )}
    </div>
  );
};

export default InventoryPage;
