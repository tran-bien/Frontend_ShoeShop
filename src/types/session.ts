/**
 * Session Types
 * Định nghĩa các interface liên quan đến Phiên đăng nhập
 */

// =======================
// SESSION DEVICE TYPES
// =======================

export interface SessionDevice {
  type?: string;
  brand?: string;
  model?: string;
  os?: string;
  browser?: string;
}

// =======================
// MAIN SESSION INTERFACE
// =======================

export interface Session {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: {
      url: string;
      public_id: string;
    };
  };
  token: string;
  refreshToken: string;
  userAgent: string;
  ip: string;
  device: SessionDevice;
  expiresAt: Date | string;
  isActive: boolean;
  lastActive: Date | string;
  createdAt: string;
  updatedAt: string;
}

// =======================
// SESSION QUERY PARAMS
// =======================

export interface SessionQueryParams {
  page?: number;
  limit?: number;
  user?: string;
  isActive?: boolean;
  sort?: string;
}

// =======================
// SESSION STATS TYPES
// =======================

export interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
}

// =======================
// SESSION RESPONSE TYPES
// =======================

export interface SessionsResponse {
  success: boolean;
  message?: string;
  data?: Session[];
  sessions?: Session[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats?: SessionStats;
}

export interface SessionDetailResponse {
  success: boolean;
  message?: string;
  data?: Session;
  session?: Session;
}
