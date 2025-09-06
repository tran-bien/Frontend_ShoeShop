import { axiosInstanceAuth } from "../utils/axiosIntance";

export interface CartItem {
  _id: string;
  variant: {
    _id: string;
    color: {
      name: string;
      code: string;
    };
    price: number;
    priceFinal: number;
    percentDiscount?: number;
  };
  size: {
    _id: string;
    value: string | number;
  };
  quantity: number;
  price: number;
  productName: string;
  image: string;
  isSelected: boolean;
  isAvailable: boolean;
  unavailableReason?: string;
}

export interface Cart {
  _id: string;
  user: string;
  cartItems: CartItem[];
  totalQuantity: number;
  totalPrice: number;
}

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

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  cart?: Cart;
  preview?: any;
  updatedItem?: {
    quantity: number;
    // Các trường khác của cart item
  };
  productInfo?: {
    exceededInventory?: boolean;
    availableQuantity?: number;
    variant?: string;
    size?: string;
    requestedQuantity?: number;
    adjustedQuantity?: number;
  };
}

export const cartService = {
  // Lấy giỏ hàng hiện tại
  getCart: (): Promise<{ data: ApiResponse<Cart> }> => {
    console.log("🛒 CartService: Getting cart...");
    return axiosInstanceAuth
      .get("/api/v1/cart")
      .then((response) => {
        console.log("🛒 CartService: Cart response received:", response.data);
        return response;
      })
      .catch((error) => {
        console.error(
          "🛒 CartService: Error getting cart:",
          error.response?.data || error.message
        );
        throw error;
      });
  },

  // Thêm sản phẩm vào giỏ hàng
  addToCart: (data: AddToCartRequest): Promise<{ data: ApiResponse<Cart> }> => {
    console.log("🛒 CartService: Adding to cart:", data);
    return axiosInstanceAuth
      .post("/api/v1/cart/items", data)
      .then((response) => {
        console.log("🛒 CartService: Add to cart response:", response.data);
        return response;
      })
      .catch((error) => {
        console.error(
          "🛒 CartService: Error adding to cart:",
          error.response?.data || error.message
        );
        throw error;
      });
  },

  // Cập nhật số lượng sản phẩm
  updateCartItemQuantity: (
    itemId: string,
    data: UpdateCartItemRequest
  ): Promise<{ data: ApiResponse<Cart> }> => {
    console.log("🛒 CartService: Updating cart item quantity:", itemId, data);
    return axiosInstanceAuth
      .put(`/api/v1/cart/items/${itemId}`, data)
      .then((response) => {
        console.log("🛒 CartService: Update quantity response:", response.data);
        return response;
      })
      .catch((error) => {
        console.error(
          "🛒 CartService: Error updating quantity:",
          error.response?.data || error.message
        );
        throw error;
      });
  },

  // Chọn/bỏ chọn sản phẩm
  toggleCartItem: (itemId: string): Promise<{ data: ApiResponse<Cart> }> => {
    console.log("🛒 CartService: Toggling cart item:", itemId);
    return axiosInstanceAuth
      .patch(`/api/v1/cart/items/${itemId}/toggle`)
      .then((response) => {
        console.log("🛒 CartService: Toggle item response:", response.data);
        return response;
      })
      .catch((error) => {
        console.error(
          "🛒 CartService: Error toggling item:",
          error.response?.data || error.message
        );
        throw error;
      });
  },

  // Xóa các sản phẩm đã chọn
  removeSelectedItems: (): Promise<{ data: ApiResponse<Cart> }> => {
    console.log("🛒 CartService: Removing selected items");
    return axiosInstanceAuth
      .delete("/api/v1/cart/items")
      .then((response) => {
        console.log(
          "🛒 CartService: Remove selected items response:",
          response.data
        );
        return response;
      })
      .catch((error) => {
        console.error(
          "🛒 CartService: Error removing selected items:",
          error.response?.data || error.message
        );
        throw error;
      });
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: (): Promise<{ data: ApiResponse }> => {
    console.log("🛒 CartService: Clearing cart");
    return axiosInstanceAuth
      .delete("/api/v1/cart")
      .then((response) => {
        console.log("🛒 CartService: Clear cart response:", response.data);
        return response;
      })
      .catch((error) => {
        console.error(
          "🛒 CartService: Error clearing cart:",
          error.response?.data || error.message
        );
        throw error;
      });
  },

  // Xem trước đơn hàng trước khi tạo
  previewBeforeOrder: (
    data: PreviewOrderRequest = {}
  ): Promise<{ data: ApiResponse }> => {
    console.log("🛒 CartService: Previewing order:", data);
    return axiosInstanceAuth
      .post("/api/v1/cart/preview-before-order", data)
      .then((response) => {
        console.log("🛒 CartService: Preview order response:", response.data);
        return response;
      })
      .catch((error) => {
        console.error(
          "🛒 CartService: Error previewing order:",
          error.response?.data || error.message
        );
        throw error;
      });
  },
};

export default cartService;
