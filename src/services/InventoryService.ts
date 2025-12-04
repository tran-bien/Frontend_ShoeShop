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
  ): Promise<{ data: ApiResponse<CalculatePriceResponse> }> =>
    axiosInstanceAuth.post("/api/v1/admin/inventory/calculate-price", data),

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

export default adminInventoryService;
