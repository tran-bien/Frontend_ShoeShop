import { axiosInstanceAuth } from "../utils/axiosIntance";

export interface WishlistProduct {
  _id: string; // wishlist item id
  product: {
    _id: string;
    name: string;
    images: { url: string }[];
    price?: number;
  };
  variant?: {
    _id: string;
    price: number;
    priceFinal: number;
    percentDiscount: number;
  };
  addedAt: string;
}

export interface WishlistResponse {
  success: boolean;
  message?: string;
  wishlist: WishlistProduct[];
}

const wishlistService = {
  // Lấy danh sách sản phẩm yêu thích
  getWishlist: () =>
    axiosInstanceAuth.get<WishlistResponse>("/api/v1/users/wishlist"),

  // Thêm sản phẩm vào danh sách yêu thích
  addToWishlist: (productId: string, variantId: string) =>
    axiosInstanceAuth.post<{
      success: boolean;
      message: string;
      isExisting?: boolean;
    }>("/api/v1/users/wishlist", {
      productId,
      variantId,
    }),

  // Xóa sản phẩm khỏi danh sách yêu thích
  removeFromWishlist: (wishlistItemId: string) =>
    axiosInstanceAuth.delete<{ success: boolean; message: string }>(
      `/api/v1/users/wishlist/${wishlistItemId}`
    ),
};

export default wishlistService;
