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
// SIZE GUIDE IMAGE SERVICE
// =======================

export const sizeGuideImageService = {
  // Upload/cập nhật ảnh size chart
  uploadSizeChartImage: (
    sizeGuideId: string,
    formData: FormData
  ): Promise<{ data: UploadImageResponse }> =>
    axiosInstanceAuth.put(
      `/api/v1/admin/images/size-guide/${sizeGuideId}/size-chart`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    ),

  // Upload/cập nhật ảnh measurement guide
  uploadMeasurementGuideImage: (
    sizeGuideId: string,
    formData: FormData
  ): Promise<{ data: UploadImageResponse }> =>
    axiosInstanceAuth.put(
      `/api/v1/admin/images/size-guide/${sizeGuideId}/measurement`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    ),
};

// =======================
// BLOG IMAGE SERVICE
// =======================

export const blogImageService = {
  // Upload ảnh content cho blog (dùng trong markdown editor)
  uploadBlogContentImage: (
    formData: FormData
  ): Promise<{ data: UploadImageResponse }> =>
    axiosInstanceAuth.post(`/api/v1/admin/images/blog-content`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Upload/cập nhật thumbnail cho blog post
  uploadThumbnail: (
    postId: string,
    formData: FormData
  ): Promise<{ data: UploadImageResponse }> =>
    axiosInstanceAuth.put(
      `/api/v1/admin/images/blog/${postId}/thumbnail`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    ),

  // Xóa thumbnail của blog post
  removeThumbnail: (postId: string): Promise<{ data: DeleteImageResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/images/blog/${postId}/thumbnail`),

  // Upload/cập nhật featured image cho blog post
  uploadFeaturedImage: (
    postId: string,
    formData: FormData
  ): Promise<{ data: UploadImageResponse }> =>
    axiosInstanceAuth.put(
      `/api/v1/admin/images/blog/${postId}/featured-image`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    ),

  // Xóa featured image của blog post
  removeFeaturedImage: (
    postId: string
  ): Promise<{ data: DeleteImageResponse }> =>
    axiosInstanceAuth.delete(
      `/api/v1/admin/images/blog/${postId}/featured-image`
    ),

  // Xóa ảnh tạm trên cloudinary (cho blog chưa tạo)
  deleteCloudinaryImage: (
    publicId: string
  ): Promise<{ data: DeleteImageResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/images/cloudinary`, {
      data: { publicId },
    }),
};

// Default export
export default {
  brand: brandImageService,
  product: productImageService,
  variant: variantImageService,
  cloudinary: cloudinaryService,
  sizeGuide: sizeGuideImageService,
  blog: blogImageService,
};
