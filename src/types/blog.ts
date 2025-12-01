/**
 * Blog Types
 * Định nghĩa các interface liên quan đến Blog/CMS
 */

// =======================
// BLOG CATEGORY TYPES
// =======================

export interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  postCount?: number;
  createdAt: string;
  updatedAt: string;
}

// =======================
// BLOG POST TYPES
// =======================

export type BlogPostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: {
    url: string;
    public_id: string;
    alt?: string;
  };
  author: {
    _id: string;
    name: string;
    email: string;
    avatar?: {
      url: string;
    };
  };
  category: BlogCategory;
  tags: string[];
  status: BlogPostStatus;
  viewCount: number;
  isHighlighted: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// =======================
// BLOG QUERY PARAMS
// =======================

export interface BlogCategoryQueryParams {
  isActive?: boolean;
  sort?: string;
}

export interface BlogPostQueryParams {
  page?: number;
  limit?: number;
  status?: BlogPostStatus;
  categoryId?: string;
  tag?: string;
  search?: string;
  isHighlighted?: boolean;
  sort?: string;
}

// =======================
// BLOG CRUD DATA
// =======================

export interface CreateBlogCategoryData {
  name: string;
  description?: string;
  displayOrder?: number;
}

export interface UpdateBlogCategoryData
  extends Partial<CreateBlogCategoryData> {
  isActive?: boolean;
}

export interface CreateBlogPostData {
  title: string;
  excerpt: string;
  content: string;
  featuredImage?: {
    url: string;
    public_id: string;
    alt?: string;
  };
  category: string;
  tags: string[];
  status: BlogPostStatus;
  isHighlighted?: boolean;
  publishedAt?: string;
}

export type UpdateBlogPostData = Partial<CreateBlogPostData>;

// =======================
// BLOG RESPONSES
// =======================

export interface BlogCategoriesResponse {
  success: boolean;
  message: string;
  data: {
    categories: BlogCategory[];
  };
}

export interface BlogCategoryDetailResponse {
  success: boolean;
  message: string;
  data: BlogCategory;
}

export interface BlogPostsResponse {
  success: boolean;
  message: string;
  data: {
    posts: BlogPost[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface BlogPostDetailResponse {
  success: boolean;
  message: string;
  data: BlogPost;
}
