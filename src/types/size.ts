/**
 * Size Types
 * Äá»‹nh nghÄ©a cÃ¡c interface liÃªn quan Ä‘áº¿n KÃ­ch thÆ°á»›c
 */

// =======================
// SIZE TYPE ENUM
// =======================

export type SizeType = "EU" | "US" | "UK" | "VN" | "CM" | "INCHES";

// =======================
// MAIN SIZE INTERFACE
// =======================

export interface Size {
  _id: string;
  value: string | number;
  type: SizeType; // Required in backend
  description?: string;
  isActive?: boolean;
  deletedAt?: string | null;
  deletedBy?: string | { _id: string; name?: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

// =======================
// SIZE CRUD DATA
// =======================

export interface CreateSizeData {
  value: string | number;
  type: SizeType; // Required in backend
  description: string; // Required in backend
  isActive?: boolean;
}

export interface UpdateSizeData {
  value?: string | number;
  description?: string;
  isActive?: boolean;
}

// =======================
// SIZE QUERY PARAMS
// =======================

export interface SizeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
  sort?: string;
}

// =======================
// SIZE FILTER (for product filtering)
// =======================

export interface SizeFilter {
  _id: string;
  id: string;
  value: number | string;
  description?: string;
}
