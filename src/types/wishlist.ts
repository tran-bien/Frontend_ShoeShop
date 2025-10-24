/**
 * Wishlist Types
 * Định nghĩa các interface liên quan đến Danh sách yêu thích
 */

// =======================
// WISHLIST PRODUCT TYPES
// =======================

export interface WishlistProductInfo {
  _id: string;
  name: string;
  slug?: string;
  images: Array<{ url: string; public_id?: string }>;
  price?: number;
}

export interface WishlistVariantInfo {
  _id: string;
  price: number;
  priceFinal: number;
  percentDiscount?: number;
  color?: {
    _id: string;
    name: string;
    code: string;
  };
}

export interface WishlistProduct {
  _id: string; // wishlist item id
  product: WishlistProductInfo;
  variant?: WishlistVariantInfo;
  addedAt: string;
}

// =======================
// WISHLIST REQUEST TYPES
// =======================

export interface AddToWishlistRequest {
  productId: string;
  variantId?: string;
}

export interface RemoveFromWishlistRequest {
  wishlistItemId: string;
}

// =======================
// WISHLIST RESPONSE TYPES
// =======================

export interface WishlistResponse {
  success: boolean;
  message?: string;
  wishlist: WishlistProduct[];
  total?: number;
}

export interface AddToWishlistResponse {
  success: boolean;
  message: string;
  isExisting?: boolean;
  wishlistItem?: WishlistProduct;
}

export interface RemoveFromWishlistResponse {
  success: boolean;
  message: string;
}
