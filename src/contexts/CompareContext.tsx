import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "../types/product";
import { toast } from "react-hot-toast";
import { publicCompareService } from "../services/CompareService";
import { productPublicService } from "../services/ProductService";

interface CompareContextType {
  compareList: Product[];
  addToCompare: (product: Product) => void;
  addToCompareById: (productId: string) => Promise<void>;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  compareCount: number;
  isLoading: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const STORAGE_KEY = "shoe-shop-compare-list";
const MAX_COMPARE = 4;

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter out any undefined or invalid products
        const validProducts = Array.isArray(parsed)
          ? parsed.filter((p) => p && p._id && p.slug)
          : [];
        setCompareList(validProducts);
      }
    } catch (error) {
      console.error("Failed to load compare list:", error);
    }
  }, []);

  // Save to localStorage whenever list changes
  useEffect(() => {
    try {
      // Filter out invalid products before saving
      const validProducts = compareList.filter((p) => p && p._id && p.slug);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validProducts));
    } catch (error) {
      console.error("Failed to save compare list:", error);
    }
  }, [compareList]);

  const addToCompare = (product: Product) => {
    // Validate product before adding
    if (!product || !product._id) {
      toast.error("Sản phẩm không hợp lệ");
      return;
    }

    // Auto-generate slug if missing (fallback)
    if (!product.slug && product.name) {
      product.slug = product.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    if (!product.slug) {
      toast.error("Sản phẩm thiếu thông tin slug");
      return;
    }

    if (compareList.length >= MAX_COMPARE) {
      toast.error(`Chỉ có thể so sánh tối đa ${MAX_COMPARE} sản phẩm`);
      return;
    }

    if (compareList.some((p) => p && p._id === product._id)) {
      toast.error("Sản phẩm đã có trong danh sách so sánh");
      return;
    }

    setCompareList((prev) => [...prev, product]);
    toast.success("Đã thêm vào danh sách so sánh");
  };

  /**
   * Fetch full product data using compare API (if ≥2 products) or single product API
   * Đảm bảo có đầy đủ variantSummary, colors, tags từ compare service
   */
  const addToCompareById = async (productId: string) => {
    if (compareList.length >= MAX_COMPARE) {
      toast.error(`Chỉ có thể so sánh tối đa ${MAX_COMPARE} sản phẩm`);
      return;
    }

    if (compareList.some((p) => p && p._id === productId)) {
      toast.error("Sản phẩm đã có trong danh sách so sánh");
      return;
    }

    setIsLoading(true);
    try {
      let newProduct: Product;

      // If this is the first product, use single product API (compare API requires ≥2 products)
      if (compareList.length === 0) {
        console.log("🔍 Fetching first product via single API:", productId);
        const response = await productPublicService.getProductById(productId);
        console.log("📦 Single product API response:", response.data);
        // Single product API returns { success: true, product: {...} }
        newProduct = response.data.product;
        console.log("✅ Extracted product:", newProduct);
      } else {
        // Use compare API to get complete product data with variantSummary
        const allIds = [...compareList.map((p) => p._id), productId];
        console.log("🔍 Fetching via compare API, IDs:", allIds);
        const response = await publicCompareService.compareProducts(allIds);
        console.log("📦 Compare API response:", response.data);
        // Backend returns { success: true, data: Product[] }
        const compareData = response.data.data;
        console.log("📦 Compare data array:", compareData);

        // Extract the newly added product from the array
        const foundProduct = compareData.find(
          (p: Product) => p._id === productId
        );
        if (!foundProduct) {
          console.error("❌ Product not found in compare data");
          toast.error("Không tìm thấy sản phẩm");
          return;
        }
        newProduct = foundProduct;
        console.log("✅ Extracted product from compare:", newProduct);
      }

      // Validate product before adding
      console.log("🔍 Validating product:", {
        hasProduct: !!newProduct,
        hasId: !!newProduct?._id,
        hasSlug: !!newProduct?.slug,
        product: newProduct,
      });

      if (!newProduct || !newProduct._id || !newProduct.slug) {
        console.error("❌ Validation failed - Product invalid:", newProduct);
        toast.error("Sản phẩm không hợp lệ");
        return;
      }

      setCompareList((prev) => [...prev, newProduct]);
      toast.success("Đã thêm vào danh sách so sánh");
    } catch (error) {
      console.error("Failed to fetch product for compare:", error);
      toast.error("Không thể thêm sản phẩm vào danh sách so sánh. Tối đa 3 sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCompare = (productId: string) => {
    setCompareList((prev) => prev.filter((p) => p._id !== productId));
    toast.success("Đã xóa khỏi danh sách so sánh");
  };

  const clearCompare = () => {
    setCompareList([]);
    toast.success("Đã xóa tất cả sản phẩm so sánh");
  };

  const isInCompare = (productId: string) => {
    return compareList.some((p) => p && p._id === productId);
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        addToCompareById,
        removeFromCompare,
        clearCompare,
        isInCompare,
        compareCount: compareList.length,
        isLoading,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
};

