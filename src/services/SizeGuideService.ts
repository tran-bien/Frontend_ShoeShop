import { axiosInstance, axiosInstanceAuth } from "../utils/axiosIntance";
import type {
  SizeGuideQueryParams,
  CreateSizeGuideData,
  UpdateSizeGuideData,
  SizeGuidesResponse,
  SizeGuideDetailResponse,
} from "../types/sizeGuide";

// =======================
// PUBLIC SIZE GUIDE SERVICE
// =======================

export const publicSizeGuideService = {
  // Lấy danh sách size guide (public)
  getSizeGuides: (
    params: SizeGuideQueryParams = {}
  ): Promise<{ data: SizeGuidesResponse }> =>
    axiosInstance.get("/api/v1/size-guides", { params }),

  // Lấy chi tiết size guide
  getSizeGuideById: (
    sizeGuideId: string
  ): Promise<{ data: SizeGuideDetailResponse }> =>
    axiosInstance.get(`/api/v1/size-guides/${sizeGuideId}`),

  // Lấy size guide theo category
  getSizeGuideByCategory: (
    categoryId: string,
    gender?: string
  ): Promise<{ data: SizeGuideDetailResponse }> =>
    axiosInstance.get(`/api/v1/size-guides/category/${categoryId}`, {
      params: { gender },
    }),
};

// =======================
// ADMIN SIZE GUIDE SERVICE
// =======================

export const adminSizeGuideService = {
  // Lấy danh sách size guide (admin)
  getAllSizeGuides: (
    params: SizeGuideQueryParams = {}
  ): Promise<{ data: SizeGuidesResponse }> =>
    axiosInstanceAuth.get("/api/v1/admin/size-guides", { params }),

  // Lấy chi tiết size guide
  getSizeGuideById: (
    sizeGuideId: string
  ): Promise<{ data: SizeGuideDetailResponse }> =>
    axiosInstanceAuth.get(`/api/v1/admin/size-guides/${sizeGuideId}`),

  // Tạo size guide mới
  createSizeGuide: (
    data: CreateSizeGuideData
  ): Promise<{ data: SizeGuideDetailResponse }> =>
    axiosInstanceAuth.post("/api/v1/admin/size-guides", data),

  // Cập nhật size guide
  updateSizeGuide: (
    sizeGuideId: string,
    data: UpdateSizeGuideData
  ): Promise<{ data: SizeGuideDetailResponse }> =>
    axiosInstanceAuth.put(`/api/v1/admin/size-guides/${sizeGuideId}`, data),

  // Xóa size guide
  deleteSizeGuide: (
    sizeGuideId: string
  ): Promise<{ data: { success: boolean; message: string } }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/size-guides/${sizeGuideId}`),
};

// =======================
// Backward compatibility
// =======================

export const sizeGuideApi = {
  // Public APIs
  getSizeGuides: publicSizeGuideService.getSizeGuides,
  getSizeGuideById: publicSizeGuideService.getSizeGuideById,
  getSizeGuideByCategory: publicSizeGuideService.getSizeGuideByCategory,

  // Admin APIs
  adminGetAll: adminSizeGuideService.getAllSizeGuides,
  adminGetById: adminSizeGuideService.getSizeGuideById,
  adminCreate: adminSizeGuideService.createSizeGuide,
  adminUpdate: adminSizeGuideService.updateSizeGuide,
  adminDelete: adminSizeGuideService.deleteSizeGuide,
};

export default publicSizeGuideService;
