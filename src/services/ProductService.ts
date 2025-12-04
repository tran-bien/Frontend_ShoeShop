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
  // Lấy danh sách sản phẩm (có phân trang và filter)
  getProducts: (
    params?: ProductQueryParams
  ): Promise<{ data: ApiResponse<Product[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/products", { params }),

  // Lấy danh sách sản phẩm đã xóa
  getDeletedProducts: (
    params?: ProductQueryParams
  ): Promise<{ data: ApiResponse<Product[]> }> =>
    axiosInstanceAuth.get("/api/v1/admin/products/deleted", { params }),

  // Lấy chi tiết sản phẩm theo ID
  getProductById: (id: string): Promise<{ data: ApiResponse<Product> }> =>
    axiosInstanceAuth.get(`/api/v1/admin/products/${id}`),

  // Tạo sản phẩm mới
  createProduct: (
    data: CreateProductData
  ): Promise<{ data: ApiResponse<Product> }> =>
    axiosInstanceAuth.post("/api/v1/admin/products", data),

  // Cập nhật sản phẩm
  updateProduct: (
    id: string,
    data: UpdateProductData
  ): Promise<{ data: ApiResponse<Product> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/products/${id}`, data),

  // Xóa mềm sản phẩm
  deleteProduct: (id: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/products/${id}`),

  // Khôi phục sản phẩm đã xóa
  restoreProduct: (
    id: string,
    restoreVariants: boolean = true
  ): Promise<{ data: ApiResponse<Product> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/products/${id}/restore`, {
      restoreVariants,
    }),

  // Cập nhật trạng thái active
  updateProductStatus: (
    id: string,
    data: {
      isActive: boolean;
      cascade?: boolean;
    }
  ): Promise<{ data: ApiResponse<Product> }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/products/${id}/status`, data),

  // Cập nhật trạng thái tồn kho
  updateStockStatus: (id: string): Promise<{ data: ApiResponse<Product> }> =>
    axiosInstanceAuth.post(`/api/v1/admin/products/${id}/update-stock-status`),
};

// Public Product Service
export const productPublicService = {
  // Lấy danh sách sản phẩm công khai với filter phức tạp
  getProducts: (
    params?: ProductQueryParams
  ): Promise<{ data: ApiResponse<Product[]> }> =>
    axiosInstance.get("/api/v1/products", { params }),

  // Lấy sản phẩm nổi bật
  getFeaturedProducts: (params?: {
    limit?: number;
  }): Promise<{ data: ApiResponse<Product[]> }> =>
    axiosInstance.get("/api/v1/products/featured", { params }),
  // Lấy chi tiết sản phẩm theo slug
  getProductBySlug: async (slug: string) => {
    try {
      const response = await axiosInstance.get(`/api/v1/products/slug/${slug}`);
      return response;
    } catch (error: unknown) {
      console.error("Error fetching product by slug:", error);
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        toast.error("Không tìm thấy sản phẩm");
      } else {
        toast.error("Lỗi khi tải sản phẩm");
      }
      throw error;
    }
  },

  // Lấy sản phẩm mới nhất
  getNewArrivals: (params?: {
    limit?: number;
  }): Promise<{ data: ApiResponse<Product[]> }> =>
    axiosInstance.get("/api/v1/products/new-arrivals", { params }),

  // Lấy sản phẩm bán chạy
  getBestSellers: (params?: {
    limit?: number;
  }): Promise<{ data: ApiResponse<Product[]> }> =>
    axiosInstance.get("/api/v1/products/best-sellers", { params }),
  // Lấy sản phẩm liên quan
  getRelatedProducts: async (id: string, params?: { limit?: number }) => {
    try {
      const response = await axiosInstance.get(
        `/api/v1/products/related/${id}`,
        { params }
      );
      return response;
    } catch (error: unknown) {
      console.error("Error fetching related products:", error);
      // Không hiển thị toast error cho related products vì đây là tính năng phụ
      throw error;
    }
  },
  // Lấy chi tiết sản phẩm theo ID
  getProductById: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/api/v1/products/${id}`);
      return response;
    } catch (error: unknown) {
      console.error("Error fetching product by ID:", error);
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        toast.error("Không tìm thấy sản phẩm");
      } else {
        toast.error("Lỗi khi tải sản phẩm");
      }
      throw error;
    }
  },
};

export default productPublicService;
