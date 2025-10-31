import { axiosInstanceAuth } from "../utils/axiosIntance";
import type {
  ImageOrder,
  UploadImageResponse,
  DeleteImageResponse,
  ReorderImageResponse,
  SetMainImageResponse,
} from "../types/image";

// Re-export types for convenience
export type { ImageOrder };

// =======================
// BRAND IMAGE SERVICE
// =======================

export const brandImageService = {
  // Upload logo cho brand
  uploadLogo: (
    brandId: string,
    formData: FormData
  ): Promise<{ data: UploadImageResponse }> =>
    axiosInstanceAuth.post(
      `/api/v1/admin/images/brand/${brandId}/logo`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    ),

  // Xóa logo brand
  removeLogo: (brandId: string): Promise<{ data: DeleteImageResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/images/brand/${brandId}/logo`),
};

// =======================
// PRODUCT IMAGE SERVICE
// =======================

export const productImageService = {
  // Upload ảnh cho product
  uploadImages: (
    productId: string,
    formData: FormData
  ): Promise<{ data: UploadImageResponse }> =>
    axiosInstanceAuth.post(
      `/api/v1/admin/images/product/${productId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    ),

  // Xóa ảnh product
  removeImages: (
    productId: string,
    imageIds: string[]
  ): Promise<{ data: DeleteImageResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/images/product/${productId}`, {
      data: { imageIds },
    }),

  // Sắp xếp ảnh product
  reorderImages: (
    productId: string,
    imageOrders: ImageOrder[]
  ): Promise<{ data: ReorderImageResponse }> =>
    axiosInstanceAuth.put(`/api/v1/admin/images/product/${productId}/reorder`, {
      imageOrders,
    }),

  // Đặt ảnh chính cho product
  setMainImage: (
    productId: string,
    imageId: string
  ): Promise<{ data: SetMainImageResponse }> =>
    axiosInstanceAuth.put(
      `/api/v1/admin/images/product/${productId}/set-main`,
      {
        imageId,
      }
    ),
};

// =======================
// VARIANT IMAGE SERVICE
// =======================

export const variantImageService = {
  // Upload ảnh cho variant
  uploadImages: (
    variantId: string,
    formData: FormData
  ): Promise<{ data: UploadImageResponse }> =>
    axiosInstanceAuth.post(
      `/api/v1/admin/images/variant/${variantId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    ),

  // Xóa ảnh variant
  removeImages: (
    variantId: string,
    imageIds: string[]
  ): Promise<{ data: DeleteImageResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/images/variant/${variantId}`, {
      data: { imageIds },
    }),

  // Sắp xếp ảnh variant
  reorderImages: (
    variantId: string,
    imageOrders: ImageOrder[]
  ): Promise<{ data: ReorderImageResponse }> =>
    axiosInstanceAuth.put(`/api/v1/admin/images/variant/${variantId}/reorder`, {
      imageOrders,
    }),

  // Đặt ảnh chính cho variant
  setMainImage: (
    variantId: string,
    imageId: string
  ): Promise<{ data: SetMainImageResponse }> =>
    axiosInstanceAuth.put(
      `/api/v1/admin/images/variant/${variantId}/set-main`,
      {
        imageId,
      }
    ),
};

// =======================
// CLOUDINARY SERVICE
// =======================

export const cloudinaryService = {
  // Xóa ảnh trực tiếp từ Cloudinary
  deleteImages: (publicIds: string[]): Promise<{ data: DeleteImageResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/images/cloudinary`, {
      data: { publicIds },
    }),
};

// =======================
// LEGACY EXPORTS (Backward Compatibility)
// =======================

export const uploadBrandLogo = brandImageService.uploadLogo;
export const removeBrandLogo = brandImageService.removeLogo;
export const uploadProductImages = productImageService.uploadImages;
export const removeProductImages = productImageService.removeImages;
export const reorderProductImages = productImageService.reorderImages;
export const setProductMainImage = productImageService.setMainImage;
export const uploadVariantImages = variantImageService.uploadImages;
export const removeVariantImages = variantImageService.removeImages;
export const reorderVariantImages = variantImageService.reorderImages;
export const setVariantMainImage = variantImageService.setMainImage;
export const deleteFromCloudinary = cloudinaryService.deleteImages;

// Default export
export default {
  brand: brandImageService,
  product: productImageService,
  variant: variantImageService,
  cloudinary: cloudinaryService,
};
