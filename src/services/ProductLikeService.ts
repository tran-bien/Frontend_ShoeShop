import { axiosInstanceAuth } from "../utils/axiosIntance";

// Thêm code cần thiết cho service này
const productLikeService = {
  likeProduct: async (productId: string) => {
    return await axiosInstanceAuth.post(`/api/v1/products/${productId}/like`);
  },

  unlikeProduct: async (productId: string) => {
    return await axiosInstanceAuth.delete(`/api/v1/products/${productId}/like`);
  },

  getUserLikedProducts: async () => {
    return await axiosInstanceAuth.get(`/api/v1/users/liked-products`);
  },
};

export default productLikeService;
