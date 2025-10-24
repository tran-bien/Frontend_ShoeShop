/**
 * Color Types
 * Định nghĩa các interface liên quan đến Màu sắc
 */

export type ColorType = "solid" | "half" | "gradient";

// =======================
// MAIN COLOR INTERFACE
// =======================

export interface Color {
  _id: string;
  name: string;
  code: string;
  type: ColorType;
  colors?: string[]; // For gradient type
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
  code: string;
  type: ColorType;
  colors?: string[];
  isActive?: boolean;
}

export interface UpdateColorData {
  name?: string;
  code?: string;
  type?: ColorType;
  colors?: string[];
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
