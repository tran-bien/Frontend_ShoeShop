import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "../types/product";
import { toast } from "react-hot-toast";

interface CompareContextType {
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  compareCount: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const STORAGE_KEY = "shoe-shop-compare-list";
const MAX_COMPARE = 4;

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [compareList, setCompareList] = useState<Product[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCompareList(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load compare list:", error);
    }
  }, []);

  // Save to localStorage whenever list changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList));
    } catch (error) {
      console.error("Failed to save compare list:", error);
    }
  }, [compareList]);

  const addToCompare = (product: Product) => {
    if (compareList.length >= MAX_COMPARE) {
      toast.error(`Chỉ có thể so sánh tối đa ${MAX_COMPARE} sản phẩm`);
      return;
    }

    if (compareList.some((p) => p._id === product._id)) {
      toast.error("Sản phẩm đã có trong danh sách so sánh");
      return;
    }

    setCompareList((prev) => [...prev, product]);
    toast.success("Đã thêm vào danh sách so sánh");
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
    return compareList.some((p) => p._id === productId);
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        compareCount: compareList.length,
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
