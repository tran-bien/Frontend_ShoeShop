/**
 * Inventory Types
 * Định nghĩa các interface liên quan đến Kho hàng
 */

// =======================
// INVENTORY ITEM TYPES
// =======================

export interface InventoryItemProduct {
  _id: string;
  name: string;
  slug?: string;
}

export interface InventoryItemVariant {
  _id: string;
  colorName?: string; // For display purposes
  color?: {
    _id: string;
    name: string;
    code?: string;
  };
  gender?: string;
}

export interface InventoryItemSize {
  _id: string;
  value: string | number;
  name?: string; // For display purposes
  description?: string;
}

// =======================
// MAIN INVENTORY ITEM INTERFACE
// =======================

export interface InventoryItem {
  _id: string;
  product: InventoryItemProduct;
  variant: InventoryItemVariant;
  size: InventoryItemSize;
  sku?: string;
  quantity: number;
  costPrice: number;
  averageCostPrice: number;
  sellingPrice: number;
  percentDiscount?: number;
  finalPrice: number;
  profit: number;
  profitPercentage: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  createdAt: string;
  updatedAt: string;
}

// =======================
// INVENTORY CRUD DATA
// =======================

export interface CreateInventoryItemData {
  product: string;
  variant: string;
  size: string;
  sku?: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  percentDiscount?: number;
  lowStockThreshold?: number;
}

export interface UpdateInventoryItemData {
  sku?: string;
  quantity?: number;
  costPrice?: number;
  sellingPrice?: number;
  percentDiscount?: number;
  lowStockThreshold?: number;
}

export interface AdjustInventoryData {
  quantity: number;
  type: "increase" | "decrease";
  reason: string;
  note?: string;
}

// =======================
// INVENTORY QUERY PARAMS
// =======================

export interface InventoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  product?: string;
  variant?: string;
  size?: string;
  sku?: string;
  isLowStock?: boolean;
  isOutOfStock?: boolean;
  sort?: string;
}

// =======================
// INVENTORY TRANSACTION TYPES
// =======================

export type InventoryTransactionType = "IN" | "OUT" | "ADJUST";

export interface InventoryTransaction {
  _id: string;
  inventoryItem: InventoryItem | string;
  type: InventoryTransactionType;
  quantityBefore: number;
  quantityChange: number;
  quantityAfter: number;
  costPrice: number;
  totalCost: number;
  targetProfitPercent?: number;
  percentDiscount?: number;
  calculatedPrice?: number;
  calculatedPriceFinal?: number;
  profitPerItem?: number;
  margin?: number;
  markup?: number;
  reason: string;
  notes?: string;
  performedBy: {
    _id: string;
    name?: string;
    email?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

// =======================
// INVENTORY STATS TYPES
// =======================

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalQuantity: number;
}

// =======================
// INVENTORY RESPONSE TYPES
// =======================

export interface InventoryItemsResponse {
  success: boolean;
  message?: string;
  data?: InventoryItem[];
  inventory?: InventoryItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats?: InventoryStats;
}

export interface InventoryItemDetailResponse {
  success: boolean;
  message?: string;
  data?: InventoryItem;
  inventoryItem?: InventoryItem;
}
