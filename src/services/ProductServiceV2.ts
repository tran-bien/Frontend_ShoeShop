import { axiosInstance, axiosInstanceAuth } from "../utils/axiosIntance";
import { toast } from "react-hot-toast";

// Product Interfaces
export interface ProductImage {
  url: string;
  public_id: string;
  isMain: boolean;
  displayOrder: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  images: ProductImage[];
  category: {
    _id: string;
    name: string;
  };
  brand: {
    _id: string;
    name: string;
    logo?: {
      url: string;
      public_id: string;
    };
  };
  variants: string[] | any[];
  totalQuantity: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  isActive: boolean;
  rating: number;
  numReviews: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  deletedBy?: string | { _id: string; name?: string } | null;

  // Add missing fields for ProductCard compatibility
  priceRange?: {
    min: number | null;
    max: number | null;
    isSinglePrice?: boolean;
  };
  originalPrice?: number;
  averageRating?: number;
  reviewCount?: number;
  isNew?: boolean;
  salePercentage?: number;

  variantSummary?: {
    total: number;
    active: number;
    colors: any[];
    colorCount: number;
    sizeCount: number;
    priceRange: {
      min: number | null;
      max: number | null;
      isSinglePrice: boolean;
    };
    discount: { hasDiscount: boolean; maxPercent: number };
  };
  price?: number;
  discountPercent?: number;
  hasDiscount?: boolean;
  maxDiscountPercent?: number;
  mainImage?: string;
  totalInventory?: number;
}

// Add ProductCardProduct interface for explicit ProductCard usage
export interface ProductCardProduct {
  _id: string;
  name: string;
  slug?: string; // Cập nhật để có thể là optional
  images?: ProductImage[];
  category?: {
    _id: string;
    name: string;
  };
  brand?: {
    _id: string;
    name: string;
    logo?: {
      url: string;
      public_id: string;
    };
  };
  priceRange: {
    min: number;
    max: number;
    isSinglePrice?: boolean;
  };
  originalPrice?: number;
  averageRating: number;
  reviewCount: number;
  isNew?: boolean;
  salePercentage?: number;
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
  totalQuantity?: number;
  price?: number;
  discountPercent?: number;
  hasDiscount?: boolean;
  mainImage?: string;
}

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
    category: product.category,
    brand: product.brand,
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

export interface CreateProductData {
  name: string;
  description: string;
  images?: ProductImage[];
  category: string;
  brand: string;
  isActive?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  _id?: string;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
  category?: string;
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
  isActive?: boolean;
  sort?: string;
  gender?: "male" | "female";
  sizes?: string | string[];
  colors?: string | string[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNext?: boolean;
    hasPrev?: boolean;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
  product?: Product;
  products?: Product[];
  count?: number;
  total?: number;
  currentPage?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  // Thêm các thuộc tính có thể có từ backend
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface ProductInventoryInfo {
  colors: Array<{
    _id: string;
    name: string;
    code: string;
    type?: string;
    colors?: string[];
  }>;
  sizes: Array<{
    _id: string;
    value: string | number;
    description: string;
  }>;
  priceRange: {
    min: number;
    max: number;
  };
  genders: Array<{
    id: string;
    name: string;
  }>;
  inventoryMatrix: {
    colors: any[];
    sizes: any[];
    genders: any[];
    stock: Record<string, Record<string, Record<string, any>>>;
    summary: {
      byGender: Record<string, number>;
      byColor: Record<string, number>;
      bySize: Record<string, number>;
      total: number;
    };
  };
}

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
    } catch (error: any) {
      console.error("Error fetching product by slug:", error);
      if (error.response?.status === 404) {
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
    } catch (error: any) {
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
    } catch (error: any) {
      console.error("Error fetching product by ID:", error);
      if (error.response?.status === 404) {
        toast.error("Không tìm thấy sản phẩm");
      } else {
        toast.error("Lỗi khi tải sản phẩm");
      }
      throw error;
    }
  },
};

// Backward compatibility - deprecated, use productAdminService or productPublicService
export const productApi = {
  // Admin methods
  getAll: productAdminService.getProducts,
  getDeleted: productAdminService.getDeletedProducts,
  getById: productAdminService.getProductById,
  create: productAdminService.createProduct,
  update: productAdminService.updateProduct,
  delete: productAdminService.deleteProduct,
  restore: productAdminService.restoreProduct,
  updateStatus: productAdminService.updateProductStatus,
  updateStockStatus: productAdminService.updateStockStatus,

  // Public methods
  getAllProductUser: productPublicService.getProducts,
  getAllProductNew: productPublicService.getNewArrivals,
  getProductById: productPublicService.getProductById,
  getRelatedProducts: productPublicService.getRelatedProducts,
  getFeaturedProducts: productPublicService.getFeaturedProducts,
  getBestSellers: productPublicService.getBestSellers,
  getProductBySlug: productPublicService.getProductBySlug,
};
