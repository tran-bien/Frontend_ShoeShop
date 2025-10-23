import {
  Color,
  Size,
  PriceRange,
  ProductImage,
  Brand,
  Category,
  StockStatus,
} from "./common";

// =======================
// VARIANT TYPES
// =======================
export interface VariantSize {
  size: Size | string;
  quantity: number;
  _id?: string;
  sizeId?: string;
  sizeValue?: string | number;
  sizeDescription?: string;
  description?: string;
  sku?: string;

  // Thông tin giá từ InventoryItem (BE trả về trong variants.sizes)
  price?: number; // sellingPrice từ InventoryItem
  finalPrice?: number; // finalPrice từ InventoryItem
  discountPercent?: number; // discountPercent từ InventoryItem

  // Stock status
  isAvailable?: boolean; // quantity > 0
  isLowStock?: boolean;
  isOutOfStock?: boolean;
  isSizeAvailable?: boolean; // deprecated, dùng isAvailable
}

export interface Variant {
  _id: string;
  product: Product | string;
  color: Color | string;
  gender: string;
  sizes: VariantSize[];
  isActive: boolean;
  deletedAt?: Date | null;
  imagesvariant?: Array<{
    _id?: string;
    url: string;
    public_id?: string;
    isMain: boolean;
    displayOrder: number;
  }>;

  // REMOVED: Các fields này đã bị xóa khỏi BE Variant schema
  // price, costPrice, percentDiscount, priceFinal, profit, profitPercentage
  // Giá giờ được lưu trong InventoryItem và trả về qua variants.sizes[]

  // ADDED: Inventory summary từ BE (cho admin view)
  inventorySummary?: {
    totalQuantity: number;
    availableSizes: number;
    totalSizes: number;
    stockStatus: "in_stock" | "low_stock" | "out_of_stock";
    sizeInventory?: Array<{
      sizeId: string;
      sizeValue: string;
      quantity: number;
      sku: string;
      isAvailable: boolean;
      isLowStock?: boolean;
      isOutOfStock?: boolean;
    }>;
    pricing?: {
      minPrice: number;
      maxPrice: number;
      hasDiscount: boolean;
      maxDiscountPercent: number;
      isSinglePrice: boolean;
    };
  };

  createdAt?: string;
  updatedAt?: string;
  deletedBy?: string | { _id: string; name?: string } | null;
}

// =======================
// PRODUCT ATTRIBUTES
// =======================
export interface ProductAttributes {
  genders?: Array<{
    id: string;
    name: string;
  }>;
  colors?: Color[];
  sizes?: Size[];
  priceRange?: PriceRange;
  inventoryMatrix?: {
    summary?: {
      total: number;
    };
  };
}

export interface ProductVariants {
  [key: string]: {
    id: string;
    colorId?: string;
    colorName?: string;
    gender?: string;
    sizes?: VariantSize[]; // Mỗi size có price, finalPrice, discountPercent
    totalQuantity?: number;
    // REMOVED: price, priceFinal, percentDiscount ở variant level
    // Giá được lưu ở từng size trong sizes[]
  };
}

export interface ProductImages {
  [key: string]: Array<{
    url: string;
    alt?: string;
  }>;
}

// =======================
// MAIN PRODUCT INTERFACE
// =======================
export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  images: ProductImage[];
  category: Category | string;
  brand: Brand | string;
  tags?:
    | Array<{
        _id: string;
        name: string;
        type: "MATERIAL" | "USECASE" | "CUSTOM";
        description?: string;
      }>
    | string[];
  variants: string[] | Variant[];
  totalQuantity: number;
  stockStatus: StockStatus;
  isActive: boolean;
  rating: number;
  numReviews: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  deletedBy?: string | { _id: string; name?: string } | null;

  // Additional computed fields
  priceRange?: PriceRange;
  originalPrice?: number;
  averageRating?: number;
  reviewCount?: number;
  isNew?: boolean;
  salePercentage?: number;
  price?: number;
  discountPercent?: number;
  hasDiscount?: boolean;
  maxDiscountPercent?: number;
  mainImage?: string;
  totalInventory?: number;

  // Variant summary
  variantSummary?: {
    total: number;
    active: number;
    colors: Color[];
    colorCount: number;
    sizeCount: number;
    priceRange: PriceRange;
    discount: {
      hasDiscount: boolean;
      maxPercent: number;
    };
  };
}

// =======================
// PRODUCT FOR CARDS
// =======================
export interface ProductCardProduct {
  _id: string;
  name: string;
  slug?: string;
  images?: ProductImage[];
  category?: Category;
  brand?: Brand;
  priceRange: PriceRange;
  originalPrice?: number;
  averageRating: number;
  reviewCount: number;
  isNew?: boolean;
  salePercentage?: number;
  stockStatus?: StockStatus;
  totalQuantity?: number;
  price?: number;
  discountPercent?: number;
  hasDiscount?: boolean;
  mainImage?: string;
}

// =======================
// PRODUCT QUERY PARAMS
// =======================
export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  priceMin?: number;
  priceMax?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  sort?: string;
  isActive?: boolean;
  stockStatus?: StockStatus;
  gender?: string;
  color?: string;
  colors?: string | string[];
  size?: string;
  sizes?: string | string[];
  rating?: number;
}

// =======================
// PRODUCT CRUD DATA
// =======================
export interface CreateProductData {
  name: string;
  description: string;
  category: string;
  brand: string;
  tags?: string[];
  images?: ProductImage[];
  isActive?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  _id?: string;
}

// =======================
// PRODUCT INVENTORY INFO
// =======================
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
    colors: Color[];
    sizes: Size[];
    genders: Array<{
      id: string;
      name: string;
    }>;
    stock: Record<string, Record<string, Record<string, VariantSize>>>;
    summary: {
      byGender: Record<string, number>;
      byColor: Record<string, number>;
      bySize: Record<string, number>;
      total: number;
    };
  };
}
