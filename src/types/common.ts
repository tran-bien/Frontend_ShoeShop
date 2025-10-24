/**
 * Common Types
 * Các interface dùng chung trong ứng dụng - chỉ chứa shared utilities
 *
 * QUAN TRỌNG: File này CHỈ chứa các types được dùng chung ở nhiều nơi.
 * Các types cụ thể cho từng module nên ở trong types/{module}.ts
 */

// =======================
// API RESPONSE WRAPPER
// =======================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;

  // Specific API response properties that backend returns
  cart?: unknown; // For cart APIs
  preview?: unknown; // For order preview APIs
  cancelRequests?: unknown; // For cancel request APIs
  productInfo?: unknown; // For product info APIs

  // Pagination properties
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNext?: boolean;
    hasPrev?: boolean;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };

  // Alternative pagination properties (for backward compatibility)
  product?: T;
  products?: T[];
  count?: number;
  total?: number;
  currentPage?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  hasNext?: boolean;
  hasPrev?: boolean;
}

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
