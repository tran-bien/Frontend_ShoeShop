/**
 * Product Compare Types
 * Định nghĩa các interface liên quan đến So sánh sản phẩm
 */

import type { Product } from "./product";

// =======================
// COMPARE TYPES
// =======================

export type CompareProduct = Product;

export interface CompareList {
  products: CompareProduct[];
  maxProducts: number;
}

// =======================
// COMPARE RESPONSES
// =======================

export interface CompareProductsResponse {
  success: boolean;
  data: CompareProduct[];
}
