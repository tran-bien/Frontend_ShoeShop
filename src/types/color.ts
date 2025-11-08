/**
 * Color Types
 * Định nghĩa các interface liên quan đến Màu sắc
 * Note: Backend sử dụng "solid" (1 màu với code) và "half" (2+ màu với colors array)
 */

export type ColorType = "solid" | "half";

// =======================
// MAIN COLOR INTERFACE
// =======================

export interface Color {
  _id: string;
  name: string;
  type: ColorType;
  code?: string; // Only for solid type
  hexCode?: string; // Backend mapping field (same as code)
  colors?: string[]; // Only for half type (2+ colors)
  isActive?: boolean;
  deletedAt?: string | null;
  deletedBy?: string | { _id: string; name?: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

// =======================
// COLOR CRUD DATA
// =======================

export interface CreateColorData {
  name: string;
  type: ColorType;
  code?: string; // Required for solid, omit for half
  colors?: string[]; // Required for half (min 2), omit for solid
  isActive?: boolean;
}

export interface UpdateColorData {
  name?: string;
  type?: ColorType;
  code?: string; // For solid type
  colors?: string[]; // For half type
  isActive?: boolean;
}

// =======================
// COLOR QUERY PARAMS
// =======================

export interface ColorQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: ColorType;
  isActive?: boolean;
  includeDeleted?: boolean;
  sort?: string;
}

// =======================
// COLOR FILTER (for product filtering)
// =======================

export interface ColorFilter {
  _id: string;
  id: string;
  name: string;
  type: ColorType;
  code?: string;
  colors?: string[];
}
