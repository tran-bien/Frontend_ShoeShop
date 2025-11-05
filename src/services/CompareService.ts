import { axiosInstance } from "../utils/axiosIntance";
import type { CompareProductsResponse } from "../types/compare";

// =======================
// PUBLIC COMPARE SERVICE
// =======================

export const publicCompareService = {
  // So sánh các sản phẩm
  compareProducts: (
    productIds: string[]
  ): Promise<{ data: CompareProductsResponse }> =>
    axiosInstance.post("/api/v1/compare", { productIds }),
};

// =======================
// LOCAL STORAGE MANAGEMENT
// =======================

const COMPARE_STORAGE_KEY = "shoe_shop_compare_list";
const MAX_COMPARE_PRODUCTS = 4;

export const compareLocalService = {
  // Lấy danh sách so sánh từ localStorage
  getCompareList: (): string[] => {
    try {
      const stored = localStorage.getItem(COMPARE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // Thêm sản phẩm vào danh sách so sánh
  addToCompare: (productId: string): boolean => {
    const list = compareLocalService.getCompareList();

    if (list.includes(productId)) {
      return false; // Already in list
    }

    if (list.length >= MAX_COMPARE_PRODUCTS) {
      return false; // Max limit reached
    }

    list.push(productId);
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(list));
    return true;
  },

  // Xóa sản phẩm khỏi danh sách so sánh
  removeFromCompare: (productId: string): boolean => {
    const list = compareLocalService.getCompareList();
    const filtered = list.filter((id) => id !== productId);

    if (filtered.length === list.length) {
      return false; // Product not found
    }

    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  // Xóa toàn bộ danh sách so sánh
  clearCompareList: (): void => {
    localStorage.removeItem(COMPARE_STORAGE_KEY);
  },

  // Kiểm tra sản phẩm có trong danh sách không
  isInCompareList: (productId: string): boolean => {
    const list = compareLocalService.getCompareList();
    return list.includes(productId);
  },

  // Lấy số lượng sản phẩm trong danh sách
  getCompareCount: (): number => {
    return compareLocalService.getCompareList().length;
  },

  // Kiểm tra có thể thêm sản phẩm không
  canAddMore: (): boolean => {
    return compareLocalService.getCompareCount() < MAX_COMPARE_PRODUCTS;
  },
};

// =======================
// Backward compatibility
// =======================

export const compareApi = {
  compareProducts: publicCompareService.compareProducts,
  ...compareLocalService,
};

export default publicCompareService;
