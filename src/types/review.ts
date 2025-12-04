/**
 * Review Types
 * Äá»‹nh nghÄ©a cÃ¡c interface liÃªn quan Ä‘áº¿n ÄÃ¡nh giÃ¡ sáº£n pháº©m
 */

// =======================
// REVIEW USER TYPES
// =======================

export interface ReviewUser {
  _id: string;
  name: string;
  avatar?: {
    url: string;
    public_id: string;
  };
}

// =======================
// REVIEW PRODUCT TYPES
// =======================

export interface ReviewProduct {
  _id: string;
  name: string;
  slug: string;
  images?: Array<{
    url: string;
    public_id: string;
    isMain?: boolean;
  }>;
}

// =======================
// REVIEW REPLY TYPES
// =======================

export interface ReviewReply {
  content: string;
  repliedBy: {
    _id: string;
    name: string;
    role: "admin" | "staff";
    avatar?: {
      url: string;
      public_id: string;
    };
  };
  repliedAt: string;
}

// =======================
// MAIN REVIEW INTERFACE
// =======================

export interface Review {
  _id: string;
  user: ReviewUser;
  product: ReviewProduct;
  orderItem: string;
  rating: number;
  content: string;
  numberOfLikes: number;
  isActive: boolean;
  reply?: ReviewReply;
  deletedAt: string | null;
  deletedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// =======================
// REVIEW CRUD DATA
// =======================

export interface CreateReviewData {
  orderId: string;
  orderItemId: string;
  rating: number;
  content: string;
}

export interface UpdateReviewData {
  rating?: number;
  content?: string;
}

// =======================
// REVIEW QUERY PARAMS
// =======================

export interface ReviewQueryParams {
  page?: number;
  limit?: number;
  rating?: number;
  sort?: string;
  product?: string;
  user?: string;
  isActive?: boolean;
}

// =======================
// REVIEWABLE PRODUCT TYPES
// =======================

export interface ReviewableProductVariant {
  _id: string;
  color: {
    _id: string;
    name: string;
    code: string;
  };
  price: number;
}

export interface ReviewableProductSize {
  _id: string;
  value: string | number;
  description?: string;
}

export interface ReviewableProduct {
  orderItemId: string;
  orderId: string;
  orderCode: string;
  product: ReviewProduct;
  variant: ReviewableProductVariant;
  size: ReviewableProductSize;
  price: number;
  quantity: number;
  image?: string;
  deliveredAt: string;
  reviewExpiresAt?: string;
  daysLeftToReview: number;
}

// =======================
// REVIEW RESPONSE TYPES
// =======================

export interface ReviewsResponse {
  success: boolean;
  message?: string;
  data?: Review[];
  reviews?: Review[];
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    total?: number; // backwards compatibility
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  product?: {
    _id: string;
    name: string;
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
}

export interface ReviewableProductsResponse {
  success: boolean;
  message?: string;
  data?: ReviewableProduct[];
  products?: ReviewableProduct[];
}
