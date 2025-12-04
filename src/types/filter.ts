/**
 * Filter Types
 * Định nghĩa các interface liên quan đến Filter/Search sản phẩm
 */

import type { ColorFilter } from "./color";
import type { SizeFilter } from "./size";

// Re-export for convenience
export type { ColorFilter, SizeFilter };

// =======================
// FILTER ENTITY TYPES
// =======================

export interface CategoryFilter {
  _id: string;
  name: string;
  slug: string;
}

export interface BrandFilter {
  _id: string;
  name: string;
  slug: string;
  logo?: {
    url: string;
    public_id: string;
  };
}

export interface GenderFilter {
  id: string;
  name: string;
}

export interface PriceRangeFilter {
  min: number;
  max: number;
}

// =======================
// FILTERS RESPONSE
// =======================

export interface FiltersResponse {
  success: boolean;
  filters: {
    categories: CategoryFilter[];
    brands: BrandFilter[];
    colors: ColorFilter[];
    sizes: SizeFilter[];
    priceRange: PriceRangeFilter;
    genders: GenderFilter[];
  };
}

// =======================
// SEARCH SUGGESTION TYPES
// =======================

export type SuggestionType = "product" | "category" | "brand";

export interface SearchSuggestion {
  type: SuggestionType;
  id: string;
  name: string;
  slug: string;
  image?: string;
  logo?: {
    url: string;
    public_id: string;
  };
  price?: number;
  description?: string;
}

export interface SuggestionsParams {
  keyword: string;
  limit?: number;
}

export interface SuggestionsResponse {
  success: boolean;
  suggestions: SearchSuggestion[];
  keyword: string;
  totalResults?: number;
}

// =======================
// PRODUCT FILTER PARAMS
// =======================

export interface ProductFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  color?: string;
  size?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  rating?: number;
  isActive?: boolean;
}
