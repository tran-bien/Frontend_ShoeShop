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
