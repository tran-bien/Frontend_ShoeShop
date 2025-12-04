import { axiosInstanceAuth } from "../utils/axiosIntance";
import type {
  User,
  UserQueryParams,
  UsersResponse,
  UserDetailResponse,
  BlockUserData,
} from "../types/user";
import type { Session } from "../types/session";
import type { ApiResponse } from "../types/api";

// Re-export types for convenience
export type { UserQueryParams, BlockUserData };

// =======================
// RESPONSE TYPES
// =======================

export interface SessionsResponse {
  success: boolean;
  message: string;
  data: {
    sessions: Session[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// =======================
// ADMIN USER SERVICE
// =======================

export const adminUserService = {
  // Lấy danh sách user
  getAllUsers: (params?: UserQueryParams): Promise<{ data: UsersResponse }> =>
    axiosInstanceAuth.get("/api/v1/admin/users", { params }),

  // Lấy chi tiết user theo id
  getUserById: (userId: string): Promise<{ data: UserDetailResponse }> =>
    axiosInstanceAuth.get(`/api/v1/admin/users/${userId}`),

  // Khóa hoặc mở khóa tài khoản user
  blockUser: (
    userId: string,
    data: BlockUserData
  ): Promise<{ data: ApiResponse<User> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/users/${userId}/block`, data),
};

// =======================
// ADMIN SESSION SERVICE
// =======================

export const adminSessionService = {
  // Lấy danh sách session đăng nhập
  getAllSessions: (): Promise<{ data: SessionsResponse }> =>
    axiosInstanceAuth.get("/api/v1/admin/auth/sessions"),

  // Đăng xuất (xóa session) theo userId
  logoutUser: (userId: string): Promise<{ data: ApiResponse<null> }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/auth/logout/${userId}`),
};

export default {
  user: adminUserService,
  session: adminSessionService,
};
