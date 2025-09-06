import { axiosInstanceAuth } from "../utils/axiosIntance";

export const sessionUserApi = {
  // Lấy danh sách user
  getAllUsers: () => axiosInstanceAuth.get("/api/v1/admin/users"),

  // Lấy chi tiết user theo id
  getUserById: (userId: string) =>
    axiosInstanceAuth.get(`/api/v1/admin/users/${userId}`),

  // Lấy danh sách session đăng nhập
  getAllSessions: () => axiosInstanceAuth.get("/api/v1/admin/auth/sessions"),

  // Đăng xuất (xóa session) theo userId
  logoutUser: (userId: string) =>
    axiosInstanceAuth.delete(`/api/v1/admin/auth/logout/${userId}`),

  // Khóa hoặc mở khóa tài khoản user
  blockUser: (userId: string, isBlock: boolean, reason?: string) =>
    axiosInstanceAuth.put(
      `/api/v1/admin/users/${userId}/block`,
      isBlock
        ? { isBlock: true, reason: reason || "Bị khóa bởi admin" }
        : { isBlock: false }
    ),
};
