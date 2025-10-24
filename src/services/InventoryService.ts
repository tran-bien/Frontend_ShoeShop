import { axiosInstanceAuth } from "../utils/axiosIntance";
import { ApiResponse } from "../types/common";
import type { InventoryItem, InventoryTransaction } from "../types/inventory";

export interface StockInData {
  productId: string;
  variantId: string;
  sizeId: string;
  quantity: number;
  costPrice: number;
  targetProfitPercent?: number;
  percentDiscount?: number;
  note?: string;
}

export interface StockOutData {
  productId: string;
  variantId: string;
  sizeId: string;
  quantity: number;
  note?: string;
  orderId?: string;
}

export interface AdjustStockData {
  productId: string;
  variantId: string;
  sizeId: string;
  newQuantity: number;
  reason: string;
}

export interface CalculatePriceData {
  costPrice: number;
  targetProfitPercent: number;
  percentDiscount?: number;
}

export interface InventoryListParams {
  page?: number;
  limit?: number;
  productId?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface TransactionHistoryParams {
  page?: number;
  limit?: number;
  productId?: string;
  variantId?: string;
  sizeId?: string;
  type?: "IN" | "OUT" | "ADJUST";
  startDate?: string;
  endDate?: string;
}

export interface InventoryStats {
  totalItems: number;
  lowStockItems: InventoryItem[];
  outOfStockItems: InventoryItem[];
  totalValue: number;
}

export interface InventoryListResponse {
  items: InventoryItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TransactionHistoryResponse {
  transactions: InventoryTransaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// =====================
// INVENTORY SERVICE
// =====================

export const inventoryService = {
  /**
   * Lấy danh sách tồn kho với phân trang và filter
   */
  getInventoryList: (
    params?: InventoryListParams
  ): Promise<{ data: ApiResponse<InventoryListResponse> }> =>
    axiosInstanceAuth.get("/api/v1/admin/inventory", { params }),

  /**
   * Lấy chi tiết một mục tồn kho
   */
  getInventoryDetail: (
    id: string
  ): Promise<{ data: ApiResponse<InventoryItem> }> =>
    axiosInstanceAuth.get(`/api/v1/admin/inventory/${id}`),

  /**
   * Lấy thống kê kho hàng tổng quan
   */
  getInventoryStats: (): Promise<{ data: ApiResponse<InventoryStats> }> =>
    axiosInstanceAuth.get("/api/v1/admin/inventory/stats"),

  /**
   * Lấy lịch sử giao dịch kho
   */
  getTransactionHistory: (
    params?: TransactionHistoryParams
  ): Promise<{ data: ApiResponse<TransactionHistoryResponse> }> =>
    axiosInstanceAuth.get("/api/v1/admin/inventory/transactions", { params }),

  /**
   * Nhập hàng vào kho
   */
  stockIn: (
    data: StockInData
  ): Promise<{ data: ApiResponse<InventoryTransaction> }> =>
    axiosInstanceAuth.post("/api/v1/admin/inventory/stock-in", data),

  /**
   * Xuất hàng khỏi kho
   */
  stockOut: (
    data: StockOutData
  ): Promise<{ data: ApiResponse<InventoryTransaction> }> =>
    axiosInstanceAuth.post("/api/v1/admin/inventory/stock-out", data),

  /**
   * Điều chỉnh số lượng tồn kho
   */
  adjustStock: (
    data: AdjustStockData
  ): Promise<{ data: ApiResponse<InventoryTransaction> }> =>
    axiosInstanceAuth.post("/api/v1/admin/inventory/adjust", data),

  /**
   * Tính toán giá bán từ giá vốn
   */
  calculatePrice: (
    data: CalculatePriceData
  ): Promise<{
    data: ApiResponse<{
      calculatedPrice: number;
      calculatedPriceFinal: number;
      profitPerItem: number;
      margin: number;
      markup: number;
    }>;
  }> => axiosInstanceAuth.post("/api/v1/admin/inventory/calculate-price", data),

  /**
   * Cập nhật ngưỡng cảnh báo tồn kho thấp
   */
  updateLowStockThreshold: (
    id: string,
    lowStockThreshold: number
  ): Promise<{ data: ApiResponse<InventoryItem> }> =>
    axiosInstanceAuth.patch(
      `/api/v1/admin/inventory/${id}/low-stock-threshold`,
      { lowStockThreshold }
    ),
};

// Export default for backward compatibility
export default inventoryService;
