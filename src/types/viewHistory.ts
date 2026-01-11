import type { Product } from "./product";

export interface ViewHistory {
  _id: string;
  user?: string;
  product: string | Product;
  viewedAt: string;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
  lastViewedAt: string; // Thời gian xem gần nhất
}

export interface ViewHistoryQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface ViewHistoryResponse {
  success: boolean;
  data: {
    history: ViewHistory[]; // BE trả về 'history' thay vì 'viewHistory'
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
