import { axiosInstanceAuth } from "../utils/axiosIntance";
import type { ApiResponse } from "../types/api";

// =======================
// REPORT TYPES
// =======================

export interface InventoryReportItem {
  product: {
    _id: string;
    name: string;
    slug: string;
    category?: {
      _id: string;
      name: string;
    };
    brand?: {
      _id: string;
      name: string;
    };
  };
  variant: {
    _id: string;
    color?: {
      _id: string;
      name: string;
      code: string;
    };
    gender?: string;
  };
  size: {
    _id: string;
    value: string | number;
  };
  quantity: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

export interface InventoryReportParams {
  lowStock?: number;
  category?: string;
  sortBy?: "stock" | "name";
  order?: "asc" | "desc";
  includeInactive?: boolean;
}

interface InventoryReportResponse {
  items: InventoryReportItem[];
  summary: {
    totalProducts: number;
    outOfStock: number;
    lowStock: number;
    inStock: number;
  };
}

// =======================
// ADMIN REPORT SERVICE
// =======================

export const adminReportService = {
  // Báo cáo tồn kho chi tiết
  getInventoryReport: (
    params?: InventoryReportParams
  ): Promise<{ data: ApiResponse<InventoryReportResponse> }> =>
    axiosInstanceAuth.get("/api/v1/admin/reports/inventory", { params }),
};

export default adminReportService;
