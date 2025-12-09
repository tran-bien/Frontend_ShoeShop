/**
 * Report Types
 * Định nghĩa các interface liên quan đến Báo cáo
 */

// =======================
// INVENTORY REPORT TYPES
// =======================

export interface InventoryReportProduct {
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
}

export interface InventoryReportVariant {
  _id: string;
  color?: {
    _id: string;
    name: string;
    code: string;
  };
  gender?: string;
}

export interface InventoryReportSize {
  _id: string;
  value: string | number;
}

export interface InventoryReportItem {
  product: InventoryReportProduct;
  variant: InventoryReportVariant;
  size: InventoryReportSize;
  quantity: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

export interface InventoryReportSummary {
  totalProducts: number;
  outOfStock: number;
  lowStock: number;
  inStock: number;
}

export interface InventoryReportResponse {
  items: InventoryReportItem[];
  summary: InventoryReportSummary;
}

export interface InventoryReportParams {
  lowStock?: number;
  category?: string;
  sortBy?: "stock" | "name";
  order?: "asc" | "desc";
  includeInactive?: boolean;
}
