/**
 * Brand Types
 * Định nghĩa các interface liên quan đến Thương hiệu
 */

export interface BrandLogo {
  url: string;
  public_id: string;
}

export interface Brand {
  _id: string;
  name: string;
  slug?: string;
  logo?: BrandLogo;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null | undefined;
  deletedBy?: string | { _id: string; name?: string } | null;
}

export interface CreateBrandData {
  name: string;
  description?: string;
  logo?: string;
  isActive?: boolean;
}

export interface UpdateBrandData {
  name?: string;
  description?: string;
  logo?: string;
  isActive?: boolean;
}

export interface BrandQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sort?: string;
}
