/**
 * Size Guide Types
 * Định nghĩa các interface liên quan đến Hướng dẫn Size
 */

// =======================
// SIZE GUIDE TYPES
// =======================

export interface SizeGuide {
  _id: string;
  product: {
    _id: string;
    name: string;
    slug: string;
  };
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
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// =======================
// SIZE GUIDE QUERY PARAMS
// =======================

export interface SizeGuideQueryParams {
  productId?: string;
  isActive?: boolean;
}

// =======================
// SIZE GUIDE CRUD DATA
// =======================

export interface CreateSizeGuideData {
  product: string;
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
  message: string;
  data: {
    sizeGuides: SizeGuide[];
  };
}

export interface SizeGuideDetailResponse {
  success: boolean;
  message: string;
  data: SizeGuide;
}
