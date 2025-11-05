import type { Product } from "./product";

export interface ViewHistory {
  _id: string;
  user?: string;
  product: string | Product;
  viewedAt: string;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ViewHistoryQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface ViewHistoryResponse {
  success: boolean;
  data: {
    viewHistory: ViewHistory[];
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

export interface TrackViewResponse {
  success: boolean;
  message: string;
  data?: {
    viewHistory: ViewHistory;
  };
}
