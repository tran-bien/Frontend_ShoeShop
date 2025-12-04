/**
 * Banner Types
 * Định nghĩa các interface liên quan đến Banner quảng cáo
 */

// =======================
// BANNER IMAGE TYPES
// =======================

export interface BannerImage {
  url: string;
  public_id: string;
}

// =======================
// MAIN BANNER INTERFACE
// =======================

export interface Banner {
  _id: string;
  title: string;
  image: BannerImage;
  displayOrder: number;
  isActive: boolean;
  link?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  deletedBy?: {
    _id: string;
    name: string;
    email: string;
  } | null;
}

// =======================
// BANNER CRUD DATA
// =======================

export interface CreateBannerData {
  title: string;
  displayOrder: number;
  link?: string;
  isActive?: boolean;
  banner: File; // File for upload
}

export interface UpdateBannerData {
  title?: string;
  displayOrder?: number;
  link?: string;
  isActive?: boolean;
}

// =======================
// BANNER QUERY PARAMS
// =======================

export interface BannerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
  sort?: string;
}

// =======================
// BANNER REORDER DATA
// =======================

export interface ReorderBannerData {
  bannerId: string;
  newOrder: number;
}

// =======================
// BANNER RESPONSE TYPES
// =======================

export interface BannersResponse {
  success: boolean;
  message?: string;
  data?: Banner[];
  banners?: Banner[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface BannerDetailResponse {
  success: boolean;
  message?: string;
  data?: Banner;
  banner?: Banner;
}
