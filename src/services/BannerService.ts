import { axiosInstanceAuth, axiosInstance } from "../utils/axiosIntance";
import type {
  Banner,
  CreateBannerData,
  UpdateBannerData,
  BannerQueryParams,
  ReorderBannerData,
} from "../types/banner";
import { ApiResponse } from "../types/api";

// Re-export types for convenience
export type { Banner, CreateBannerData, UpdateBannerData };

// Admin API endpoints
const ADMIN_API_PREFIX = "/api/v1/admin/banners";

// Admin Banner Service
export const bannerAdminService = {
  // Láº¥y danh sÃ¡ch banner (cÃ³ phÃ¢n trang vÃ  filter)
  getBanners: (
    params?: BannerQueryParams
  ): Promise<{ data: ApiResponse<Banner[]> }> =>
    axiosInstanceAuth.get(ADMIN_API_PREFIX, { params }),

  // Láº¥y chi tiáº¿t banner theo ID
  getBannerById: (id: string): Promise<{ data: ApiResponse<Banner> }> =>
    axiosInstanceAuth.get(`${ADMIN_API_PREFIX}/${id}`),

  // Táº¡o banner má»›i vá»›i upload áº£nh
  createBanner: (formData: FormData): Promise<{ data: ApiResponse<Banner> }> =>
    axiosInstanceAuth.post(ADMIN_API_PREFIX, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Cáº­p nháº­t thÃ´ng tin banner (khÃ´ng bao gá»“m áº£nh)
  updateBanner: (
    id: string,
    data: UpdateBannerData
  ): Promise<{ data: ApiResponse<Banner> }> =>
    axiosInstanceAuth.put(`${ADMIN_API_PREFIX}/${id}`, data),

  // Cáº­p nháº­t áº£nh banner
  updateBannerImage: (
    id: string,
    formData: FormData
  ): Promise<{ data: ApiResponse<Banner> }> =>
    axiosInstanceAuth.put(`${ADMIN_API_PREFIX}/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // XÃ³a má»m banner
  deleteBanner: (id: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(`${ADMIN_API_PREFIX}/${id}`),

  // KhÃ´i phá»¥c banner Ä‘Ã£ xÃ³a
  restoreBanner: (
    id: string,
    newDisplayOrder?: number
  ): Promise<{ data: ApiResponse<Banner> }> =>
    axiosInstanceAuth.put(`${ADMIN_API_PREFIX}/${id}/restore`, {
      newDisplayOrder,
    }),

  // Toggle tráº¡ng thÃ¡i active cá»§a banner
  toggleBannerStatus: (id: string): Promise<{ data: ApiResponse<Banner> }> =>
    axiosInstanceAuth.put(`${ADMIN_API_PREFIX}/${id}/toggle-status`),

  // Sáº¯p xáº¿p láº¡i thá»© tá»± banner
  reorderBanners: (
    bannerOrders: ReorderBannerData[]
  ): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.put(`${ADMIN_API_PREFIX}/reorder`, { bannerOrders }),
};

// Public Banner Service
export const bannerPublicService = {
  // Láº¥y danh sÃ¡ch banner cÃ´ng khai (chá»‰ active)
  getPublicBanners: (): Promise<{ data: ApiResponse<Banner[]> }> =>
    axiosInstance.get("/api/v1/banners"),
};

// Helper functions Ä‘á»ƒ táº¡o FormData
export const createBannerFormData = (data: CreateBannerData): FormData => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("displayOrder", data.displayOrder.toString());
  if (data.link) formData.append("link", data.link);
  if (data.isActive !== undefined)
    formData.append("isActive", data.isActive.toString());
  formData.append("banner", data.banner);
  return formData;
};

export const createImageFormData = (file: File): FormData => {
  const formData = new FormData();
  formData.append("banner", file);
  return formData;
};

export default {
  admin: bannerAdminService,
  public: bannerPublicService,
  helpers: {
    createFormData: createBannerFormData,
    createImageFormData: createImageFormData,
  },
};
