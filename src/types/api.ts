// =======================
// API RESPONSE TYPES
// =======================

/**
 * Generic API Response interface
 * Sử dụng cho tất cả response từ backend API
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
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
  // Backwards compatibility với các response cũ
  product?: T;
  products?: T[];
  count?: number;
  total?: number;
  currentPage?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
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
