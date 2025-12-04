import { axiosInstanceAuth } from "../utils/axiosIntance";
import { ApiResponse } from "../types/api";
import type {
  InventoryItem,
  InventoryTransaction,
  StockInData,
  StockOutData,
  AdjustStockData,
  CalculatePriceData,
  CalculatePriceResponse,
  InventoryListParams,
  TransactionHistoryParams,
  InventoryStats,
  InventoryListResponse,
  TransactionHistoryResponse,
} from "../types/inventory";

// Re-export types for convenience
export type {
  InventoryItem,
  InventoryTransaction,
  StockInData,
  StockOutData,
  AdjustStockData,
  CalculatePriceData,
  InventoryListParams,
  TransactionHistoryParams,
  InventoryStats,
};

// =====================
// ADMIN INVENTORY SERVICE
// =====================

export const adminInventoryService = {
  /**
   * Láº¥y danh sÃ¡ch tá»“n kho vá»›i phÃ¢n trang vÃ  filter
   */
  getInventoryList: (
    params?: InventoryListParams
  ): Promise<{ data: ApiResponse<InventoryListResponse> }> =>
    axiosInstanceAuth.get("/api/v1/admin/inventory", { params }),

  /**
   * Láº¥y chi tiáº¿t má»™t má»¥c tá»“n kho
   */
  getInventoryDetail: (
    id: string
  ): Promise<{ data: ApiResponse<InventoryItem> }> =>
    axiosInstanceAuth.get(`/api/v1/admin/inventory/${id}`),

  /**
   * Láº¥y thá»‘ng kÃª kho hÃ ng tá»•ng quan
   */
  getInventoryStats: (): Promise<{ data: ApiResponse<InventoryStats> }> =>
    axiosInstanceAuth.get("/api/v1/admin/inventory/stats"),

  /**
   * Láº¥y lá»‹ch sá»­ giao dá»‹ch kho
   */
  getTransactionHistory: (
    params?: TransactionHistoryParams
  ): Promise<{ data: ApiResponse<TransactionHistoryResponse> }> =>
    axiosInstanceAuth.get("/api/v1/admin/inventory/transactions", { params }),

  /**
   * Nháº­p hÃ ng vÃ o kho
   */
  stockIn: (
    data: StockInData
  ): Promise<{ data: ApiResponse<InventoryTransaction> }> =>
    axiosInstanceAuth.post("/api/v1/admin/inventory/stock-in", data),

  /**
   * Xuáº¥t hÃ ng khá»i kho
   */
  stockOut: (
    data: StockOutData
  ): Promise<{ data: ApiResponse<InventoryTransaction> }> =>
    axiosInstanceAuth.post("/api/v1/admin/inventory/stock-out", data),

  /**
   * Äiá»u chá»‰nh sá»‘ lÆ°á»£ng tá»“n kho
   */
  adjustStock: (
    data: AdjustStockData
  ): Promise<{ data: ApiResponse<InventoryTransaction> }> =>
    axiosInstanceAuth.post("/api/v1/admin/inventory/adjust", data),

  /**
   * TÃ­nh toÃ¡n giÃ¡ bÃ¡n tá»« giÃ¡ vá»‘n
   */
  calculatePrice: (
    data: CalculatePriceData
  ): Promise<{ data: ApiResponse<CalculatePriceResponse> }> =>
    axiosInstanceAuth.post("/api/v1/admin/inventory/calculate-price", data),

  /**
   * Cáº­p nháº­t ngÆ°á»¡ng cáº£nh bÃ¡o tá»“n kho tháº¥p
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

export default adminInventoryService;
