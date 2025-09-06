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
    product?: {
      _id: string;
      name?: string;
    };
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

export interface PreviewOrderData {
  couponCode?: string;
}

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

export const cartApi = {
  // Lấy giỏ hàng hiện tại
  getCart: (): Promise<{ data: { success: boolean; cart: Cart } }> =>
    axiosInstanceAuth.get("/api/v1/cart"),

  // Thêm sản phẩm vào giỏ hàng
  addToCart: (data: {
    variantId: string;
    sizeId: string;
    quantity: number;
  }): Promise<{ data: any }> =>
    axiosInstanceAuth.post("/api/v1/cart/items", data),

  // Cập nhật số lượng sản phẩm
  updateCartItem: (
    itemId: string,
    data: { quantity: number }
  ): Promise<{ data: any }> =>
    axiosInstanceAuth.put(`/api/v1/cart/items/${itemId}`, data),

  // Toggle chọn sản phẩm
  toggleSelectCartItem: (itemId: string): Promise<{ data: any }> =>
    axiosInstanceAuth.patch(`/api/v1/cart/items/${itemId}/toggle`),

  // Xóa sản phẩm đã chọn
  removeSelectedItems: (): Promise<{ data: any }> =>
    axiosInstanceAuth.delete("/api/v1/cart/items"),

  // Xóa toàn bộ giỏ hàng
  clearCart: (): Promise<{ data: any }> =>
    axiosInstanceAuth.delete("/api/v1/cart"),

  // Xem trước đơn hàng trước khi tạo
  previewBeforeOrder: (
    data: PreviewOrderData = {}
  ): Promise<{ data: PreviewOrderResponse }> =>
    axiosInstanceAuth.post("/api/v1/cart/preview-before-order", data),
};

export default cartApi;
