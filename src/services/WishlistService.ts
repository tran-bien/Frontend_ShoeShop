import { axiosInstanceAuth } from "../utils/axiosIntance";
import type {
  WishlistResponse,
  AddToWishlistResponse,
  RemoveFromWishlistResponse,
} from "../types/wishlist";

const wishlistService = {
  // Lấy danh sách sản phẩm yêu thích
  getWishlist: () =>
    axiosInstanceAuth.get<WishlistResponse>("/api/v1/users/wishlist"),

  // Thêm sản phẩm vào danh sách yêu thích
  addToWishlist: (productId: string, variantId: string) =>
    axiosInstanceAuth.post<AddToWishlistResponse>("/api/v1/users/wishlist", {
      productId,
      variantId,
    }),

  // Xóa sản phẩm khỏi danh sách yêu thích
  removeFromWishlist: (wishlistItemId: string) =>
    axiosInstanceAuth.delete<RemoveFromWishlistResponse>(
      `/api/v1/users/wishlist/${wishlistItemId}`
    ),
};

export default wishlistService;
