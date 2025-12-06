import { axiosInstance, axiosInstanceAuth } from "../utils/axiosIntance";
import {
  RegisterRequest,
  OtpVerificationRequest,
  ForgotPasswordRequest,
  ChangePasswordRequest,
  AuthResponse,
  LoginResponse,
  User,
  SessionInfo,
} from "../types/auth";

const authService = {
  // Đăng nhập - Cập nhật signature để phù hợp với useAuth
  login: async (email: string, password: string) => {
    const response = await axiosInstance.post<LoginResponse>(
      "/api/v1/auth/login",
      {
        email,
        password,
      }
    );
    return response.data; // Trả về data trực tiếp vì backend không wrap trong success
  },

  // Đăng ký
  register: async (data: RegisterRequest) => {
    const response = await axiosInstance.post<AuthResponse>(
      "/api/v1/auth/register",
      data
    );
    return response;
  },

  // Xác thực OTP
  verifyOtp: async (data: OtpVerificationRequest) => {
    return axiosInstance.post<AuthResponse>("/api/v1/auth/verify-otp", data);
  },

  // Quên mật khẩu
  forgotPassword: async (data: ForgotPasswordRequest) => {
    return axiosInstance.post<AuthResponse>(
      "/api/v1/auth/forgot-password",
      data
    );
  },

  // Reset mật khẩu - cập nhật signature phù hợp với useAuth
  resetPassword: async (
    resetToken: string,
    password: string,
    confirmPassword: string
  ) => {
    return axiosInstance.post<AuthResponse>("/api/v1/auth/reset-password", {
      resetToken,
      password,
      confirmPassword,
    });
  },

  // Thêm mới: đổi mật khẩu (cho người dùng đã đăng nhập)
  changePassword: async (data: ChangePasswordRequest) => {
    return axiosInstanceAuth.post<AuthResponse>(
      "/api/v1/auth/change-password",
      data
    );
  },

  // Refresh token
  refreshToken: async (refreshToken: string) => {
    const response = await axiosInstance.post<AuthResponse>(
      "/api/v1/auth/refresh-token",
      {
        refreshToken,
      }
    );
    return response;
  },

  // Lấy thông tin user hiện tại (sử dụng endpoint profile)
  getMe: async () => {
    return axiosInstanceAuth.get<AuthResponse<User>>("/api/v1/users/profile");
  },

  // Lấy danh sách session
  getSessions: async () => {
    return axiosInstanceAuth.get<AuthResponse<SessionInfo[]>>(
      "/api/v1/auth/sessions"
    );
  },

  // Đăng xuất hiện tại (session hiện tại)
  logout: async () => {
    return axiosInstanceAuth.delete("/api/v1/auth/logout");
  },

  // Đăng xuất session cụ thể
  logoutSession: async (sessionId: string) => {
    return axiosInstanceAuth.delete(`/api/v1/auth/sessions/${sessionId}`);
  },

  // Đăng xuất tất cả session khác
  logoutAllOtherSessions: async () => {
    return axiosInstanceAuth.delete("/api/v1/auth/sessions");
  },

  // Đăng xuất tất cả session
  logoutAll: async () => {
    return axiosInstanceAuth.delete("/api/v1/auth/logout-all");
  },
};

export default authService;
