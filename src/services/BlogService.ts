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
  // Lấy danh sách categories - Note: Backend không có public category endpoint
  getCategories: (
    params: BlogCategoryQueryParams = {}
  ): Promise<{ data: BlogCategoriesResponse }> =>
    axiosInstance.get("/api/v1/blogs/categories", { params }),

  // Lấy danh sách bài viết
  // Backend: GET /api/v1/blogs
  getPosts: (
    params: BlogPostQueryParams = {}
  ): Promise<{ data: BlogPostsResponse }> =>
    axiosInstance.get("/api/v1/blogs", { params }),

  // Lấy chi tiết bài viết
  // Backend: GET /api/v1/blogs/:slug
  getPostBySlug: (slug: string): Promise<{ data: BlogPostDetailResponse }> =>
    axiosInstance.get(`/api/v1/blogs/${slug}`),

  // Lấy bài viết nổi bật - Note: Backend không có endpoint này
  getHighlightedPosts: (
    limit: number = 5
  ): Promise<{ data: BlogPostsResponse }> =>
    axiosInstance.get("/api/v1/blogs", {
      params: { isHighlighted: true, limit },
    }),

  // Lấy bài viết liên quan - Note: Backend không có endpoint này
  getRelatedPosts: (
    postId: string,
    limit: number = 4
  ): Promise<{ data: BlogPostsResponse }> =>
    axiosInstance.get(`/api/v1/blogs`, {
      params: { relatedTo: postId, limit },
    }),
};

// =======================
// ADMIN BLOG SERVICE
// =======================

export const adminBlogService = {
  // === CATEGORY MANAGEMENT ===
  // Backend: /api/v1/admin/blogs/categories
  // Lấy tất cả categories
  getAllCategories: (
    params: BlogCategoryQueryParams = {}
  ): Promise<{ data: BlogCategoriesResponse }> =>
    axiosInstanceAuth.get("/api/v1/admin/blogs/categories", { params }),

  // Lấy chi tiết category
  getCategoryById: (
    categoryId: string
  ): Promise<{ data: BlogCategoryDetailResponse }> =>
    axiosInstanceAuth.get(`/api/v1/admin/blogs/categories/${categoryId}`),

  // Tạo category mới
  createCategory: (
    data: CreateBlogCategoryData
  ): Promise<{ data: BlogCategoryDetailResponse }> =>
    axiosInstanceAuth.post("/api/v1/admin/blogs/categories", data),

  // Cập nhật category
  updateCategory: (
    categoryId: string,
    data: UpdateBlogCategoryData
  ): Promise<{ data: BlogCategoryDetailResponse }> =>
    axiosInstanceAuth.put(`/api/v1/admin/blogs/categories/${categoryId}`, data),

  // Xóa category
  deleteCategory: (
    categoryId: string
  ): Promise<{ data: { success: boolean; message: string } }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/blogs/categories/${categoryId}`),

  // === POST MANAGEMENT ===
  // Backend: /api/v1/admin/blogs (không có /posts)
  // Lấy tất cả posts
  getAllPosts: (
    params: BlogPostQueryParams = {}
  ): Promise<{ data: BlogPostsResponse }> =>
    axiosInstanceAuth.get("/api/v1/admin/blogs", { params }),

  // Lấy chi tiết post
  getPostById: (postId: string): Promise<{ data: BlogPostDetailResponse }> =>
    axiosInstanceAuth.get(`/api/v1/admin/blogs/${postId}`),

  // Tạo post mới
  createPost: (
    data: CreateBlogPostData
  ): Promise<{ data: BlogPostDetailResponse }> =>
    axiosInstanceAuth.post("/api/v1/admin/blogs", data),

  // Cập nhật post
  updatePost: (
    postId: string,
    data: UpdateBlogPostData
  ): Promise<{ data: BlogPostDetailResponse }> =>
    axiosInstanceAuth.put(`/api/v1/admin/blogs/${postId}`, data),

  // Xóa post
  deletePost: (
    postId: string
  ): Promise<{ data: { success: boolean; message: string } }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/blogs/${postId}`),

  // Publish post - Sử dụng updatePost với status PUBLISHED
  publishPost: (postId: string): Promise<{ data: BlogPostDetailResponse }> =>
    axiosInstanceAuth.put(`/api/v1/admin/blogs/${postId}`, {
      status: "PUBLISHED",
    }),

  // Archive post - Sử dụng updatePost với status ARCHIVED
  archivePost: (postId: string): Promise<{ data: BlogPostDetailResponse }> =>
    axiosInstanceAuth.put(`/api/v1/admin/blogs/${postId}`, {
      status: "ARCHIVED",
    }),
};

export default publicBlogService;
