import { ApiResponse } from "./api";

// =======================
// CART VARIANT & SIZE TYPES
// =======================

export interface CartVariant {
  _id: string;
  color: {
    _id: string;
    name: string;
    code: string;
    type: string;
  };
  price: number;
  priceFinal: number;
  percentDiscount?: number;
  product?: {
    _id: string;
    name?: string;
    slug?: string; // Add slug for navigation
  };
}

export interface CartSize {
  _id: string;
  value: string | number;
  description?: string;
}

// =======================
// CART ITEM TYPES
// =======================

export interface CartItem {
  _id: string;
  productName: string;
  image: string;
  variant: CartVariant;
  size: CartSize;
  quantity: number;
  price: number;
  isSelected: boolean;
  isAvailable: boolean;
  unavailableReason?: string;
}

// =======================
// CART DATA TYPES
// =======================

export interface CartData {
  _id: string;
  user: string;
  cartItems: CartItem[];
  // Làm totalQuantity optional vì backend có thể không trả về
  totalQuantity?: number;
  subTotal?: number;
  createdAt: string;
  updatedAt: string;
}

// Legacy Cart interface for backward compatibility
export interface Cart {
  _id: string;
  user: string;
  cartItems: CartItem[];
  totalQuantity: number;
  totalPrice: number;
}

// =======================
// CART REQUEST TYPES
// =======================

export interface AddToCartRequest {
  variantId: string;
  sizeId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface PreviewOrderRequest {
  couponCode?: string;
}

export interface PreviewOrderData {
  couponCode?: string;
}

// =======================
// CART RESPONSE TYPES
// =======================

export interface PreviewOrderResponse {
  success: boolean;
  message: string;
  preview: {
    items: number;
    itemsDetail: Array<{
      productName: string;
      color: { name: string; code: string };
      sizeValue: string | number;
      price: number;
      quantity: number;
      image: string;
      totalPrice: number;
    }>;
    totalQuantity: number;
    subTotal: number;
    discount: number;
    shippingFee: number;
    totalPrice: number;
    couponApplied: boolean;
    couponDetail?: {
      code: string;
      type: "percent" | "fixed";
      value: number;
      maxDiscount?: number;
    };
  };
}

/**
 * Cart specific API response
 */
export interface CartApiResponse<T = unknown> extends ApiResponse<T> {
  cart?: Cart;
  preview?: PreviewOrderResponse["preview"];
  updatedItem?: {
    quantity: number;
  };
  productInfo?: {
    exceededInventory?: boolean;
    availableQuantity?: number;
    variant?: string;
    size?: string;
  };
}
