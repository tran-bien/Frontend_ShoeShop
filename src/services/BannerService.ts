import { axiosInstanceAuth, axiosInstance } from "../utils/axiosIntance";
import type {
  Banner,
  CreateBannerData,
  UpdateBannerData,
  BannerQueryParams,
} from "../types/banner";
import { ApiResponse } from "../types/api";

// Re-export types for convenience
export type { Banner, CreateBannerData, UpdateBannerData };

// Admin API endpoints
const ADMIN_BANNER_PREFIX = "/api/v1/admin/banners";
const ADMIN_IMAGE_PREFIX = "/api/v1/admin/images";

// Admin Banner Service
export const bannerAdminService = {
  // Lấy danh sách banner (có phân trang và filter)
  getBanners: (
    params?: BannerQueryParams
  ): Promise<{ data: ApiResponse<Banner[]> }> =>
    axiosInstanceAuth.get(ADMIN_BANNER_PREFIX, { params }),

  // Lấy chi tiết banner theo ID
  getBannerById: (id: string): Promise<{ data: ApiResponse<Banner> }> =>
    axiosInstanceAuth.get(`${ADMIN_BANNER_PREFIX}/${id}`),

  // Tạo banner mới với upload ảnh (dùng image routes)
  createBanner: (formData: FormData): Promise<{ data: ApiResponse<Banner> }> =>
    axiosInstanceAuth.post(`${ADMIN_IMAGE_PREFIX}/banner`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Cập nhật thông tin banner (không bao gồm ảnh)
  updateBanner: (
    id: string,
    data: UpdateBannerData
  ): Promise<{ data: ApiResponse<Banner> }> =>
    axiosInstanceAuth.put(`${ADMIN_BANNER_PREFIX}/${id}`, data),

  // Cập nhật ảnh banner (dùng image routes)
  updateBannerImage: (
    id: string,
    formData: FormData
  ): Promise<{ data: ApiResponse<Banner> }> =>
    axiosInstanceAuth.put(`${ADMIN_IMAGE_PREFIX}/banner/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Xóa banner (dùng image routes)
  deleteBanner: (id: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(`${ADMIN_IMAGE_PREFIX}/banner/${id}`),

  // Khôi phục banner đã xóa
  restoreBanner: (
    id: string,
    newDisplayOrder?: number
  ): Promise<{ data: ApiResponse<Banner> }> =>
    axiosInstanceAuth.put(`${ADMIN_BANNER_PREFIX}/${id}/restore`, {
      newDisplayOrder,
    }),

  // Toggle trạng thái active của banner
  toggleBannerStatus: (id: string): Promise<{ data: ApiResponse<Banner> }> =>
    axiosInstanceAuth.put(`${ADMIN_BANNER_PREFIX}/${id}/toggle-status`),

};

// Public Banner Service
export const bannerPublicService = {
  // Lấy danh sách banner công khai (chỉ active)
  getPublicBanners: (): Promise<{ data: ApiResponse<Banner[]> }> =>
    axiosInstance.get("/api/v1/banners"),
};

// Helper functions để tạo FormData
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
