import { axiosInstance, axiosInstanceAuth } from "../utils/axiosIntance";
import { toast } from "react-hot-toast";
import {
  Product,
  ProductCardProduct,
  CreateProductData,
  UpdateProductData,
  ProductQueryParams,
} from "../types/product";
import { ApiResponse } from "../types/api";

// Helper type to convert Product to ProductCardProduct
export type ProductToCardProduct = (product: Product) => ProductCardProduct;

// Helper function to convert Product to ProductCardProduct
export const convertToProductCardProduct: ProductToCardProduct = (product) => {
  const priceRange = product.priceRange || {
    min: 0,
    max: 0,
    isSinglePrice: true,
  };

  return {
    _id: product._id,
    name: product.name,
    slug: product.slug,
    images: product.images,
    category:
      typeof product.category === "string" ? undefined : product.category,
    brand: typeof product.brand === "string" ? undefined : product.brand,
    priceRange: {
      min: priceRange.min || 0,
      max: priceRange.max || 0,
      isSinglePrice: priceRange.isSinglePrice !== false,
    },
    originalPrice: product.originalPrice,
    averageRating: product.averageRating || product.rating || 0,
    reviewCount: product.reviewCount || product.numReviews || 0,
    isNew: product.isNew,
    salePercentage: product.salePercentage,
    stockStatus: product.stockStatus,
    totalQuantity: product.totalQuantity,
    price: product.price,
    discountPercent: product.discountPercent,
    hasDiscount: product.hasDiscount,
    mainImage: product.mainImage,
  };
};

// Admin Product Service
export const productAdminService = {
  // Láº¥y danh sÃ¡ch sáº£n pháº©m (cÃ³ phÃ¢n trang vÃ  filter)
  getProducts: (
    params?: ProductQueryParams
  ): Promise<{ data: ApiResponse<Product[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/products", { params }),

  // Láº¥y danh sÃ¡ch sáº£n pháº©m Ä‘Ã£ xÃ³a
  getDeletedProducts: (
    params?: ProductQueryParams
  ): Promise<{ data: ApiResponse<Product[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/products/deleted", { params }),

  // Láº¥y chi tiáº¿t sáº£n pháº©m theo ID
  getProductById: (id: string): Promise<{ data: ApiResponse<Product> }> =>
    axiosInstanceAuth.get(`/api/v1/admin/products/${id}`),

  // Táº¡o sáº£n pháº©m má»›i
  createProduct: (
    data: CreateProductData
  ): Promise<{ data: ApiResponse<Product> }> =>
    axiosInstanceAuth.post("/api/v1/admin/products", data),

  // Cáº­p nháº­t sáº£n pháº©m
  updateProduct: (
    id: string,
    data: UpdateProductData
  ): Promise<{ data: ApiResponse<Product> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/products/${id}`, data),

  // XÃ³a má»m sáº£n pháº©m
  deleteProduct: (id: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/products/${id}`),

  // KhÃ´i phá»¥c sáº£n pháº©m Ä‘Ã£ xÃ³a
  restoreProduct: (
    id: string,
    restoreVariants: boolean = true
  ): Promise<{ data: ApiResponse<Product> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/products/${id}/restore`, {
      restoreVariants,
    }),

  // Cáº­p nháº­t tráº¡ng thÃ¡i active
  updateProductStatus: (
    id: string,
    data: {
      isActive: boolean;
      cascade?: boolean;
    }
  ): Promise<{ data: ApiResponse<Product> }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/products/${id}/status`, data),

  // Cáº­p nháº­t tráº¡ng thÃ¡i tá»“n kho
  updateStockStatus: (id: string): Promise<{ data: ApiResponse<Product> }> =>
    axiosInstanceAuth.post(`/api/v1/admin/products/${id}/update-stock-status`),
};

// Public Product Service
export const productPublicService = {
  // Láº¥y danh sÃ¡ch sáº£n pháº©m cÃ´ng khai vá»›i filter phá»©c táº¡p
  getProducts: (
    params?: ProductQueryParams
  ): Promise<{ data: ApiResponse<Product[]> }> =>
    axiosInstance.get("/api/v1/products", { params }),

  // Láº¥y sáº£n pháº©m ná»•i báº­t
  getFeaturedProducts: (params?: {
    limit?: number;
  }): Promise<{ data: ApiResponse<Product[]> }> =>
    axiosInstance.get("/api/v1/products/featured", { params }),
  // Láº¥y chi tiáº¿t sáº£n pháº©m theo slug
  getProductBySlug: async (slug: string) => {
    try {
      const response = await axiosInstance.get(`/api/v1/products/slug/${slug}`);
      return response;
    } catch (error: unknown) {
      console.error("Error fetching product by slug:", error);
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        toast.error("KhÃ´ng tÃ¬m tháº¥y sáº£n pháº©m");
      } else {
        toast.error("Lá»—i khi táº£i sáº£n pháº©m");
      }
      throw error;
    }
  },

  // Láº¥y sáº£n pháº©m má»›i nháº¥t
  getNewArrivals: (params?: {
    limit?: number;
  }): Promise<{ data: ApiResponse<Product[]> }> =>
    axiosInstance.get("/api/v1/products/new-arrivals", { params }),

  // Láº¥y sáº£n pháº©m bÃ¡n cháº¡y
  getBestSellers: (params?: {
    limit?: number;
  }): Promise<{ data: ApiResponse<Product[]> }> =>
    axiosInstance.get("/api/v1/products/best-sellers", { params }),
  // Láº¥y sáº£n pháº©m liÃªn quan
  getRelatedProducts: async (id: string, params?: { limit?: number }) => {
    try {
      const response = await axiosInstance.get(
        `/api/v1/products/related/${id}`,
        { params }
      );
      return response;
    } catch (error: unknown) {
      console.error("Error fetching related products:", error);
      // KhÃ´ng hiá»ƒn thá»‹ toast error cho related products vÃ¬ Ä‘Ã¢y lÃ  tÃ­nh nÄƒng phá»¥
      throw error;
    }
  },
  // Láº¥y chi tiáº¿t sáº£n pháº©m theo ID
  getProductById: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/api/v1/products/${id}`);
      return response;
    } catch (error: unknown) {
      console.error("Error fetching product by ID:", error);
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        toast.error("KhÃ´ng tÃ¬m tháº¥y sáº£n pháº©m");
      } else {
        toast.error("Lá»—i khi táº£i sáº£n pháº©m");
      }
      throw error;
    }
  },
};

export default productPublicService;
