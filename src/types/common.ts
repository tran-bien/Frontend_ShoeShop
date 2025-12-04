/**
 * Common Types
 * Các interface dùng chung trong ứng dụng - chỉ chứa shared utilities
 *
 * QUAN TRỌNG: File này CHỈ chứa các types được dùng chung ở nhiều nơi.
 * Các types cụ thể cho từng module nên ở trong types/{module}.ts
 */

// =======================
// RE-EXPORT API TYPES FROM api.ts (Single Source of Truth)
// =======================
export type {
  ApiResponse,
  ApiError,
  PaginationParams,
  SortParams,
  SearchParams,
  BaseQueryParams,
} from "./api";

// =======================
// PRODUCT IMAGE TYPE
// =======================

export interface ProductImage {
  url: string;
  public_id: string;
  isMain: boolean;
  displayOrder: number;
  alt?: string;
}

// =======================
// SHARED BUSINESS TYPES
// =======================

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface PriceRange {
  min: number | null;
  max: number | null;
  isSinglePrice?: boolean;
}

// =======================
// GENDER TYPE
// =======================

export interface Gender {
  id: string;
  name: string;
}
