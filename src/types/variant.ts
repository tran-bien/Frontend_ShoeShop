/**
 * Variant Types
 * Định nghĩa các interface liên quan đến Biến thể sản phẩm
 * Giá và số lượng giờ được quản lý trong Inventory, không còn trong Variant
 */

import type { ProductImage } from "./common";
import type { Color } from "./color";
import type { Size } from "./size";
import { Product } from "./product";

// =======================
// VARIANT SIZE TYPES
// =======================

export interface VariantSize {
  _id?: string;
  size: Size | string;
  sku?: string;
  quantity?: number; // For inventory summary
}

// =======================
// MAIN VARIANT INTERFACE
// =======================

export interface Variant {
  _id: string;
  product: Product | string;
  color: Color | string;
  gender: "male" | "female" | "unisex";
  sizes: VariantSize[];
  isActive: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
  imagesvariant?: ProductImage[];

  // REMOVED từ BE schema: price, costPrice, percentDiscount, priceFinal, profit, profitPercentage
  // Giá và lợi nhuận giờ được quản lý qua InventoryItem và InventoryTransaction

  // Inventory summary từ BE (cho admin view)
  inventorySummary?: {
    totalQuantity: number;
    availableSizes: number;
    totalSizes: number;
    stockStatus: "in_stock" | "low_stock" | "out_of_stock";
    sizeInventory?: Array<{
      sizeId: string;
      sizeValue: string | number;
      quantity: number;
      costPrice: number;
      sellingPrice: number;
      isLowStock: boolean;
      isOutOfStock: boolean;
    }>;
  };
}

// =======================
// VARIANT CRUD DATA
// =======================

export interface CreateVariantData {
  product: string;
  color: string;
  gender: "male" | "female" | "unisex";
  sizes: Array<{
    size: string;
    sku?: string;
  }>;
  isActive?: boolean;
}

// =======================
// VARIANT QUERY PARAMS
// =======================

export interface VariantQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  product?: string;
  color?: string;
  gender?: "male" | "female" | "unisex";
  isActive?: boolean;
  includeDeleted?: boolean;
  sort?: string;
  // REMOVED: costPriceMin, costPriceMax, priceMin, priceMax, finalPriceMin, finalPriceMax
  // Giá giờ không filter ở Variant nữa
}
