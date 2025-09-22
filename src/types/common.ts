// =======================
// COMMON API RESPONSE TYPES
// =======================
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  // Specific API response properties that backend returns
  cart?: any; // For cart APIs
  preview?: any; // For order preview APIs
  cancelRequests?: any; // For cancel request APIs
  productInfo?: any; // For product info APIs
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
// USER & AUTH TYPES
// =======================
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  avatar?: string;
  phone?: string;
  isAdmin: boolean;
}

export interface DeviceInfo {
  type?: string;
  model?: string;
  vendor?: string;
  browser?: {
    name?: string;
    version?: string;
  };
  os?: {
    name?: string;
    version?: string;
  };
}

export interface SessionInfo {
  _id: string;
  userAgent: string;
  ip: string;
  device: DeviceInfo;
  lastActive: string;
  isActive: boolean;
  expiresAt: string;
}

// =======================
// BASIC ENTITY TYPES
// =======================
export interface Brand {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  logo?: {
    url: string;
    public_id?: string;
  };
  isActive?: boolean;
  deletedAt?: string | null;
  deletedBy?: string | { _id: string; name?: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  deletedAt?: string | null;
  deletedBy?: string | { _id: string; name?: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Color {
  _id: string;
  name: string;
  code: string;
  type: "solid" | "half" | "gradient";
  colors?: string[];
  isActive?: boolean;
  deletedAt?: string | null;
  deletedBy?: string | { _id: string; name?: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Size {
  _id: string;
  value: string | number;
  description?: string;
  isActive?: boolean;
  deletedAt?: string | null;
  deletedBy?: string | { _id: string; name?: string } | null;
  createdAt?: string;
  updatedAt?: string;
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
// STOCK & INVENTORY TYPES
// =======================
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface PriceRange {
  min: number | null;
  max: number | null;
  isSinglePrice?: boolean;
}
