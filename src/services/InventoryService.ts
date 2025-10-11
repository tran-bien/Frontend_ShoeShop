import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface InventoryItem {
  _id: string;
  product: any;
  variant: any;
  size: any;
  quantity: number;
  costPrice: number;
  averageCostPrice: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  _id: string;
  type: "IN" | "OUT" | "ADJUST";
  inventoryItem: InventoryItem;
  quantityBefore: number;
  quantityChange: number;
  quantityAfter: number;
  costPrice: number;
  totalCost: number;
  calculatedPrice?: number;
  profitPerItem?: number;
  margin?: number;
  markup?: number;
  reason: string;
  notes?: string;
  performedBy: any;
  createdAt: string;
}

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

class InventoryService {
  private getAuthHeader() {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async getInventoryList(params: InventoryListParams = {}) {
    const response = await axios.get(`${API_URL}/admin/inventory`, {
      ...this.getAuthHeader(),
      params,
    });
    return response.data;
  }

  async getInventoryDetail(id: string) {
    const response = await axios.get(
      `${API_URL}/admin/inventory/${id}`,
      this.getAuthHeader()
    );
    return response.data;
  }

  async getInventoryStats() {
    const response = await axios.get(
      `${API_URL}/admin/inventory/stats`,
      this.getAuthHeader()
    );
    return response.data;
  }

  async getTransactionHistory(params: TransactionHistoryParams = {}) {
    const response = await axios.get(
      `${API_URL}/admin/inventory/transactions`,
      {
        ...this.getAuthHeader(),
        params,
      }
    );
    return response.data;
  }

  async stockIn(data: StockInData) {
    const response = await axios.post(
      `${API_URL}/admin/inventory/stock-in`,
      data,
      this.getAuthHeader()
    );
    return response.data;
  }

  async stockOut(data: StockOutData) {
    const response = await axios.post(
      `${API_URL}/admin/inventory/stock-out`,
      data,
      this.getAuthHeader()
    );
    return response.data;
  }

  async adjustStock(data: AdjustStockData) {
    const response = await axios.post(
      `${API_URL}/admin/inventory/adjust`,
      data,
      this.getAuthHeader()
    );
    return response.data;
  }

  async calculatePrice(data: CalculatePriceData) {
    const response = await axios.post(
      `${API_URL}/admin/inventory/calculate-price`,
      data,
      this.getAuthHeader()
    );
    return response.data;
  }

  async updateLowStockThreshold(id: string, lowStockThreshold: number) {
    const response = await axios.patch(
      `${API_URL}/admin/inventory/${id}/low-stock-threshold`,
      { lowStockThreshold },
      this.getAuthHeader()
    );
    return response.data;
  }
}

export default new InventoryService();
