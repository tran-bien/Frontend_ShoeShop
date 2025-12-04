// =======================
// API RESPONSE TYPES
// =======================

/**
 * Generic API Response interface
 * Sử dụng cho tất cả response từ backend API
 * Single Source of Truth - các file khác nên import từ đây
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;

  // Pagination properties
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    total?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };

  // Specific API response properties that backend returns
  cart?: unknown;
  preview?: unknown;
  cancelRequests?: unknown;
  productInfo?: unknown;

  // Backwards compatibility với các response cũ
  product?: T;
  products?: T[];
  brand?: T;
  brands?: T[];
  categories?: T[];
  tags?: T[];
  variants?: T[];
  variant?: T;
  sizeGuides?: T[];

  // Alternative pagination properties
  count?: number;
  total?: number;
  totalPages?: number;
  currentPage?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  hasNext?: boolean;
  hasPrev?: boolean;
}

/**
 * Error Response interface
 */
export interface ApiError {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}

/**
 * Pagination Query Parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Sort Query Parameters
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Search Query Parameters
 */
export interface SearchParams {
  search?: string;
  query?: string;
}

/**
 * Base Query Parameters
 * Kết hợp pagination, sort và search
 */
export interface BaseQueryParams
  extends PaginationParams,
    SortParams,
    SearchParams {}
