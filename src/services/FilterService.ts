import { axiosInstance } from "../utils/axiosIntance";
import type {
  FiltersResponse,
  SuggestionsResponse,
  SuggestionsParams,
  ColorFilter,
  SizeFilter,
  CategoryFilter,
  BrandFilter,
  SearchSuggestion,
  DynamicFiltersResponse,
  DynamicFilterParams,
} from "../types/filter";

// Re-export types for convenience
export type {
  ColorFilter,
  SizeFilter,
  CategoryFilter,
  BrandFilter,
  SearchSuggestion,
};

// Filter Service
export const filterService = {
  // Lấy tất cả thuộc tính lọc cho sản phẩm (static)
  getFilterAttributes: (): Promise<{ data: FiltersResponse }> =>
    axiosInstance.get("/api/v1/filters/attributes"),

  // Lấy thuộc tính lọc động dựa trên kết quả tìm kiếm
  getFilterAttributesBySearch: (
    params: DynamicFilterParams
  ): Promise<{ data: DynamicFiltersResponse }> =>
    axiosInstance.get("/api/v1/filters/attributes/search", { params }),

  // Lấy gợi ý tìm kiếm
  getSuggestions: (
    params: SuggestionsParams
  ): Promise<{ data: SuggestionsResponse }> =>
    axiosInstance.get("/api/v1/filters/suggestions", { params }),
};

// Export default service
export default filterService;
