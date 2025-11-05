/**
 * Recommendation & View History Types
 * Định nghĩa các interface liên quan đến Gợi ý sản phẩm và Lịch sử xem
 */

import type { Product } from "./product";

// =======================
// VIEW HISTORY TYPES
// =======================

export interface ViewHistory {
  _id: string;
  user?: string;
  product: Product;
  viewedAt: string;
}

// =======================
// USER BEHAVIOR TYPES
// =======================

export interface UserBehavior {
  _id: string;
  user: string;
  viewedProducts: Array<{
    product: string;
    viewCount: number;
    lastViewedAt: string;
  }>;
  favoriteCategories: Array<{
    category: string;
    interactionCount: number;
  }>;
  favoriteBrands: Array<{
    brand: string;
    interactionCount: number;
  }>;
  priceRange: {
    min: number;
    max: number;
  };
  createdAt: string;
  updatedAt: string;
}

// =======================
// RECOMMENDATION TYPES
// =======================

export type RecommendationType =
  | "personalized"
  | "trending"
  | "similar"
  | "collaborative";

export interface Recommendation {
  product: Product;
  score: number;
  reason: string;
  type: RecommendationType;
}

// =======================
// QUERY PARAMS
// =======================

export interface ViewHistoryQueryParams {
  page?: number;
  limit?: number;
}

export interface RecommendationQueryParams {
  limit?: number;
  type?: RecommendationType;
  categoryId?: string;
  excludeProductIds?: string[];
}

// =======================
// RESPONSES
// =======================

export interface ViewHistoryResponse {
  success: boolean;
  message: string;
  data: {
    history: ViewHistory[];
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

export interface RecommendationsResponse {
  success: boolean;
  message: string;
  data: {
    recommendations: Recommendation[];
  };
}

export interface UserBehaviorResponse {
  success: boolean;
  message: string;
  data: UserBehavior;
}
