import { axiosInstance } from "../utils/axiosIntance";

// Filter Interfaces
export interface ColorFilter {
  _id: string;
  id: string;
  name: string;
  type: "solid" | "half";
  code?: string;
  colors?: string[];
}

export interface SizeFilter {
  _id: string;
  id: string;
  value: number | string;
  description: string;
}

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

export interface FiltersResponse {
  success: boolean;
  filters: {
    categories: CategoryFilter[];
    brands: BrandFilter[];
    colors: ColorFilter[];
    sizes: SizeFilter[];
    priceRange: {
      min: number;
      max: number;
    };
    genders: GenderFilter[];
  };
}

export interface SearchSuggestion {
  type: "product" | "category" | "brand";
  id: string;
  name: string;
  slug: string;
  image?: string;
  logo?: {
    url: string;
    public_id: string;
  };
}

export interface SuggestionsResponse {
  success: boolean;
  suggestions: SearchSuggestion[];
  keyword: string;
}

export interface SuggestionsParams {
  keyword: string;
  limit?: number;
}

// Filter Service
export const filterService = {
  // Lấy thuộc tính lọc cho sản phẩm
  getFilterAttributes: (): Promise<{ data: FiltersResponse }> =>
    axiosInstance.get("/api/v1/filters/attributes"),

  // Lấy gợi ý tìm kiếm
  getSuggestions: (
    params: SuggestionsParams
  ): Promise<{ data: SuggestionsResponse }> =>
    axiosInstance.get("/api/v1/filters/suggestions", { params }),
};

// Export default service
export default filterService;
