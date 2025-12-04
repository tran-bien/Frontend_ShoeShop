import { axiosInstanceAuth } from "../utils/axiosIntance";
import type { Variant, VariantQueryParams } from "../types/variant";
import { ApiResponse } from "../types/api";

// Admin Variant Service
export const adminVariantService = {
  // Láº¥y danh sÃ¡ch táº¥t cáº£ variant
  getAllVariants: (
    params?: VariantQueryParams
  ): Promise<{ data: ApiResponse<Variant[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/variants", { params }),

  // Láº¥y danh sÃ¡ch variant Ä‘Ã£ xÃ³a
  getDeletedVariants: (
    params?: VariantQueryParams
  ): Promise<{ data: ApiResponse<Variant[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/variants/deleted", { params }),

  // Láº¥y variant theo ID
  getVariantById: (
    variantId: string
  ): Promise<{ data: ApiResponse<Variant> }> =>
    axiosInstanceAuth.get(`/api/v1/admin/variants/${variantId}`),

  // ThÃªm variant má»›i
  createVariant: (data: {
    product: string;
    color: string;
    images: Array<{ url: string; public_id: string }>;
    sizes: Array<{ size: string; price: number; quantity: number }>;
    isActive?: boolean;
  }): Promise<{ data: ApiResponse<Variant> }> =>
    axiosInstanceAuth.post("/api/v1/admin/variants", data),

  // Cáº­p nháº­t variant
  updateVariant: (
    variantId: string,
    data: {
      color?: string;
      images?: Array<{ url: string; public_id: string }>;
      sizes?: Array<{ size: string; price: number; quantity: number }>;
      isActive?: boolean;
    }
  ): Promise<{ data: ApiResponse<Variant> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/variants/${variantId}`, data),

  // XÃ³a má»m variant
  deleteVariant: (variantId: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/variants/${variantId}`),

  // KhÃ´i phá»¥c variant Ä‘Ã£ xÃ³a
  restoreVariant: (
    variantId: string
  ): Promise<{ data: ApiResponse<Variant> }> =>
    axiosInstanceAuth.post(`/api/v1/admin/variants/${variantId}/restore`),

  // Chá»‰nh sá»­a tráº¡ng thÃ¡i isActive
  updateStatus: (
    variantId: string,
    isActive: boolean
  ): Promise<{ data: ApiResponse<Variant> }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/variants/${variantId}/status`, {
      isActive,
    }),
};

export default adminVariantService;
