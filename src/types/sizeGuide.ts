/**
 * Size Guide Types
 * Định nghĩa các interface liên quan đến Hướng dẫn Size
 */

// =======================
// SIZE GUIDE TYPES
// =======================

// Size chart entry (from API response - new format)
export interface SizeChartEntry {
  size: string;
  length: number;
  width?: number;
  note?: string;
}

// Category reference type
export interface CategoryRef {
  _id: string;
  name: string;
  slug?: string;
}

// Old structure for sizeChart (single object with image and description)
export interface SizeChartOldFormat {
  image?: {
    url: string;
    public_id: string;
  };
  description?: string;
}

export interface MeasurementGuide {
  image?: {
    url: string;
    public_id: string;
  };
  description?: string;
}

export interface SizeGuide {
  _id: string;
  title?: string;
  description?: string;
  category?: CategoryRef | string;
  gender?: "male" | "female" | "unisex";
  measurementInstructions?: string[];
  // New format: array of size chart entries
  sizeChart?: SizeChartEntry[];
  notes?: string;
  product?: {
    _id: string;
    name: string;
    slug?: string;
  };
  measurementGuide?: MeasurementGuide;
  isActive?: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Legacy SizeGuide type for admin pages that use old format
export interface LegacySizeGuide {
  _id: string;
  product: {
    _id: string;
    name: string;
    slug?: string;
  };
  sizeChart: SizeChartOldFormat;
  measurementGuide: MeasurementGuide;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Response that wraps sizeGuide (for detail responses)
export interface SizeGuideApiData {
  sizeGuide: SizeGuide;
}

// =======================
// SIZE GUIDE QUERY PARAMS
// =======================

export interface SizeGuideQueryParams {
  productId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// =======================
// SIZE GUIDE CRUD DATA
// =======================

export interface CreateSizeGuideData {
  productId: string;
  sizeChart: {
    image?: {
      url: string;
      public_id: string;
    };
    description: string;
  };
  measurementGuide: {
    image?: {
      url: string;
      public_id: string;
    };
    description: string;
  };
}

export interface UpdateSizeGuideData extends Partial<CreateSizeGuideData> {
  isActive?: boolean;
}

// =======================
// SIZE GUIDE RESPONSES
// =======================

export interface SizeGuidesResponse {
  success: boolean;
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  data: SizeGuide[];
}

export interface SizeGuideDetailResponse {
  success: boolean;
  message: string;
  data: SizeGuide;
}
