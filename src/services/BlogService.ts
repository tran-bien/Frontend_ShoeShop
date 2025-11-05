import { axiosInstance, axiosInstanceAuth } from "../utils/axiosIntance";
import type {
  BlogCategoryQueryParams,
  BlogPostQueryParams,
  CreateBlogCategoryData,
  UpdateBlogCategoryData,
  CreateBlogPostData,
  UpdateBlogPostData,
  BlogCategoriesResponse,
  BlogCategoryDetailResponse,
  BlogPostsResponse,
  BlogPostDetailResponse,
} from "../types/blog";

// =======================
// PUBLIC BLOG SERVICE
// =======================

export const publicBlogService = {
  // Lấy danh sách categories
  getCategories: (
    params: BlogCategoryQueryParams = {}
  ): Promise<{ data: BlogCategoriesResponse }> =>
    axiosInstance.get("/api/v1/blog/categories", { params }),

  // Lấy danh sách bài viết
  getPosts: (
    params: BlogPostQueryParams = {}
  ): Promise<{ data: BlogPostsResponse }> =>
    axiosInstance.get("/api/v1/blog/posts", { params }),

  // Lấy chi tiết bài viết
  getPostBySlug: (slug: string): Promise<{ data: BlogPostDetailResponse }> =>
    axiosInstance.get(`/api/v1/blog/posts/${slug}`),

  // Lấy bài viết nổi bật
  getHighlightedPosts: (
    limit: number = 5
  ): Promise<{ data: BlogPostsResponse }> =>
    axiosInstance.get("/api/v1/blog/posts/highlighted", {
      params: { limit },
    }),

  // Lấy bài viết liên quan
  getRelatedPosts: (
    postId: string,
    limit: number = 4
  ): Promise<{ data: BlogPostsResponse }> =>
    axiosInstance.get(`/api/v1/blog/posts/${postId}/related`, {
      params: { limit },
    }),
};

// =======================
// ADMIN BLOG SERVICE
// =======================

export const adminBlogService = {
  // === CATEGORY MANAGEMENT ===
  // Lấy tất cả categories
  getAllCategories: (
    params: BlogCategoryQueryParams = {}
  ): Promise<{ data: BlogCategoriesResponse }> =>
    axiosInstanceAuth.get("/api/v1/admin/blog/categories", { params }),

  // Lấy chi tiết category
  getCategoryById: (
    categoryId: string
  ): Promise<{ data: BlogCategoryDetailResponse }> =>
    axiosInstanceAuth.get(`/api/v1/admin/blog/categories/${categoryId}`),

  // Tạo category mới
  createCategory: (
    data: CreateBlogCategoryData
  ): Promise<{ data: BlogCategoryDetailResponse }> =>
    axiosInstanceAuth.post("/api/v1/admin/blog/categories", data),

  // Cập nhật category
  updateCategory: (
    categoryId: string,
    data: UpdateBlogCategoryData
  ): Promise<{ data: BlogCategoryDetailResponse }> =>
    axiosInstanceAuth.put(`/api/v1/admin/blog/categories/${categoryId}`, data),

  // Xóa category
  deleteCategory: (
    categoryId: string
  ): Promise<{ data: { success: boolean; message: string } }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/blog/categories/${categoryId}`),

  // === POST MANAGEMENT ===
  // Lấy tất cả posts
  getAllPosts: (
    params: BlogPostQueryParams = {}
  ): Promise<{ data: BlogPostsResponse }> =>
    axiosInstanceAuth.get("/api/v1/admin/blog/posts", { params }),

  // Lấy chi tiết post
  getPostById: (postId: string): Promise<{ data: BlogPostDetailResponse }> =>
    axiosInstanceAuth.get(`/api/v1/admin/blog/posts/${postId}`),

  // Tạo post mới
  createPost: (
    data: CreateBlogPostData
  ): Promise<{ data: BlogPostDetailResponse }> =>
    axiosInstanceAuth.post("/api/v1/admin/blog/posts", data),

  // Cập nhật post
  updatePost: (
    postId: string,
    data: UpdateBlogPostData
  ): Promise<{ data: BlogPostDetailResponse }> =>
    axiosInstanceAuth.put(`/api/v1/admin/blog/posts/${postId}`, data),

  // Xóa post
  deletePost: (
    postId: string
  ): Promise<{ data: { success: boolean; message: string } }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/blog/posts/${postId}`),

  // Publish post
  publishPost: (postId: string): Promise<{ data: BlogPostDetailResponse }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/blog/posts/${postId}/publish`),

  // Archive post
  archivePost: (postId: string): Promise<{ data: BlogPostDetailResponse }> =>
    axiosInstanceAuth.patch(`/api/v1/admin/blog/posts/${postId}/archive`),
};

// =======================
// Backward compatibility
// =======================

export const blogApi = {
  // Public APIs
  getCategories: publicBlogService.getCategories,
  getPosts: publicBlogService.getPosts,
  getPostBySlug: publicBlogService.getPostBySlug,
  getHighlightedPosts: publicBlogService.getHighlightedPosts,
  getRelatedPosts: publicBlogService.getRelatedPosts,

  // Admin APIs
  adminGetAllCategories: adminBlogService.getAllCategories,
  adminGetCategoryById: adminBlogService.getCategoryById,
  adminCreateCategory: adminBlogService.createCategory,
  adminUpdateCategory: adminBlogService.updateCategory,
  adminDeleteCategory: adminBlogService.deleteCategory,
  adminGetAllPosts: adminBlogService.getAllPosts,
  adminGetPostById: adminBlogService.getPostById,
  adminCreatePost: adminBlogService.createPost,
  adminUpdatePost: adminBlogService.updatePost,
  adminDeletePost: adminBlogService.deletePost,
  adminPublishPost: adminBlogService.publishPost,
  adminArchivePost: adminBlogService.archivePost,
};

export default publicBlogService;
