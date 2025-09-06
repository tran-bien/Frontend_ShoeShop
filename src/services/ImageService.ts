import { axiosInstanceAuth } from "../utils/axiosIntance";

// Upload logo cho brand
export const uploadBrandLogo = (brandId: string, formData: FormData) =>
  axiosInstanceAuth.post(
    `/api/v1/admin/images/brand/${brandId}/logo`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

// Xóa logo brand
export const removeBrandLogo = (brandId: string) =>
  axiosInstanceAuth.delete(`/api/v1/admin/images/brand/${brandId}/logo`);

// Upload ảnh cho product
export const uploadProductImages = (productId: string, formData: FormData) =>
  axiosInstanceAuth.post(
    `/api/v1/admin/images/product/${productId}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

// Xóa ảnh product (body: { imageIds: string[] })
export const removeProductImages = (productId: string, imageIds: string[]) =>
  axiosInstanceAuth.delete(`/api/v1/admin/images/product/${productId}`, {
    data: { imageIds },
  });

// Upload ảnh cho variant
export const uploadVariantImages = (variantId: string, formData: FormData) =>
  axiosInstanceAuth.post(
    `/api/v1/admin/images/variant/${variantId}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

// Xóa ảnh variant (body: { imageIds: string[] })
export const removeVariantImages = (variantId: string, imageIds: string[]) =>
  axiosInstanceAuth.delete(`/api/v1/admin/images/variant/${variantId}`, {
    data: { imageIds },
  });

// Sắp xếp ảnh product (body: { imageOrders: { _id: string, displayOrder: number }[] })
export const reorderProductImages = (productId: string, imageOrders: any[]) =>
  axiosInstanceAuth.put(`/api/v1/admin/images/product/${productId}/reorder`, {
    imageOrders,
  });

// Sắp xếp ảnh variant (body: { imageOrders: { _id: string, displayOrder: number }[] })
export const reorderVariantImages = (variantId: string, imageOrders: any[]) =>
  axiosInstanceAuth.put(`/api/v1/admin/images/variant/${variantId}/reorder`, {
    imageOrders,
  });

// Đặt ảnh chính cho product (body: { imageId: string })
export const setProductMainImage = (productId: string, imageId: string) =>
  axiosInstanceAuth.put(`/api/v1/admin/images/product/${productId}/set-main`, {
    imageId,
  });

// Đặt ảnh chính cho variant (body: { imageId: string })
export const setVariantMainImage = (variantId: string, imageId: string) =>
  axiosInstanceAuth.put(`/api/v1/admin/images/variant/${variantId}/set-main`, {
    imageId,
  });

// Xóa ảnh trực tiếp từ Cloudinary (body: { publicIds: string[] })
export const deleteFromCloudinary = (publicIds: string[]) =>
  axiosInstanceAuth.delete(`/api/v1/admin/images/cloudinary`, {
    data: { publicIds },
  });
