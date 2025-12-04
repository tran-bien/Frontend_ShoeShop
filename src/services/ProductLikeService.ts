import { axiosInstanceAuth } from "../utils/axiosIntance";
import type { Product } from "../types/product";
import { ApiResponse } from "../types/api";

// User Wishlist Service (Product Like)
export const userWishlistService = {
  // Thích sản phẩm (thêm vào wishlist)
  likeProduct: (productId: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.post("/api/v1/users/wishlist/like", { productId }),

  // Bỏ thích sản phẩm (xóa khỏi wishlist)
  unlikeProduct: (productId: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/users/wishlist/${productId}`),

  // Lấy danh sách sản phẩm đã thích
  getUserLikedProducts: (): Promise<{ data: ApiResponse<Product[]> }> =>
    axiosInstanceAuth.get("/api/v1/users/wishlist"),
};

export default userWishlistService;
