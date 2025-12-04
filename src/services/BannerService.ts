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
  // Lấy danh sách banner (có phân trang và filter)
  getBanners: (
    params?: BannerQueryParams
  ): Promise<{ data: ApiResponse<Banner[]> }> =>
    axiosInstanceAuth.get(ADMIN_API_PREFIX, { params }),

  // Lấy chi tiết banner theo ID
  getBannerById: (id: string): Promise<{ data: ApiResponse<Banner> }> =>
    axiosInstanceAuth.get(`${ADMIN_API_PREFIX}/${id}`),

  // Tạo banner mới với upload ảnh
  createBanner: (formData: FormData): Promise<{ data: ApiResponse<Banner> }> =>
    axiosInstanceAuth.post(ADMIN_API_PREFIX, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Cập nhật thông tin banner (không bao gồm ảnh)
  updateBanner: (
    id: string,
    data: UpdateBannerData
  ): Promise<{ data: ApiResponse<Banner> }> =>
    axiosInstanceAuth.put(`${ADMIN_API_PREFIX}/${id}`, data),

  // Cập nhật ảnh banner
  updateBannerImage: (
    id: string,
    formData: FormData
  ): Promise<{ data: ApiResponse<Banner> }> =>
    axiosInstanceAuth.put(`${ADMIN_API_PREFIX}/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Xóa mềm banner
  deleteBanner: (id: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(`${ADMIN_API_PREFIX}/${id}`),

  // Khôi phục banner đã xóa
  restoreBanner: (
    id: string,
    newDisplayOrder?: number
  ): Promise<{ data: ApiResponse<Banner> }> =>
    axiosInstanceAuth.put(`${ADMIN_API_PREFIX}/${id}/restore`, {
      newDisplayOrder,
    }),

  // Toggle trạng thái active của banner
  toggleBannerStatus: (id: string): Promise<{ data: ApiResponse<Banner> }> =>
    axiosInstanceAuth.put(`${ADMIN_API_PREFIX}/${id}/toggle-status`),

  // Sắp xếp lại thứ tự banner
  reorderBanners: (
    bannerOrders: ReorderBannerData[]
  ): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.put(`${ADMIN_API_PREFIX}/reorder`, { bannerOrders }),
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
