import { axiosInstanceAuth } from "../utils/axiosIntance";
import {
  Cart,
  AddToCartRequest,
  UpdateCartItemRequest,
  PreviewOrderRequest,
  CartApiResponse,
} from "../types/cart";

// Cart Service
export const cartService = {
  // Lấy giỏ hàng hiện tại
  getCart: (): Promise<{ data: CartApiResponse<Cart> }> => {
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
  addToCart: (
    data: AddToCartRequest
  ): Promise<{ data: CartApiResponse<Cart> }> => {
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
  ): Promise<{ data: CartApiResponse<Cart> }> => {
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
  toggleCartItem: (
    itemId: string
  ): Promise<{ data: CartApiResponse<Cart> }> => {
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
  removeSelectedItems: (): Promise<{ data: CartApiResponse<Cart> }> => {
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
  clearCart: (): Promise<{ data: CartApiResponse }> => {
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
  ): Promise<{ data: CartApiResponse }> => {
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

// Backward compatibility - alias cartApi to cartService
export const cartApi = cartService;

export default cartService;
