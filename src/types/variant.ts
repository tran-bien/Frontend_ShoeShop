/**
 * Variant Types
 * Äá»‹nh nghÄ©a cÃ¡c interface liÃªn quan Ä‘áº¿n Biáº¿n thá»ƒ sáº£n pháº©m
 * GiÃ¡ vÃ  sá»‘ lÆ°á»£ng giá» Ä‘Æ°á»£c quáº£n lÃ½ trong Inventory, khÃ´ng cÃ²n trong Variant
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

  // REMOVED tá»« BE schema: price, costPrice, percentDiscount, priceFinal, profit, profitPercentage
  // GiÃ¡ vÃ  lá»£i nhuáº­n giá» Ä‘Æ°á»£c quáº£n lÃ½ qua InventoryItem vÃ  InventoryTransaction

  // Inventory summary tá»« BE (cho admin view)
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

export interface UpdateVariantData extends Partial<CreateVariantData> {
  // Partial makes all fields optional
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
  // GiÃ¡ giá» khÃ´ng filter á»Ÿ Variant ná»¯a
}
