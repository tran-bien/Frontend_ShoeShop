import { axiosInstance, axiosInstanceAuth } from "../utils/axiosIntance";

// Request interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface OtpVerificationRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Response interfaces
export interface AuthResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginResponse {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  avatar?: string;
  token: string;
  refreshToken: string;
}

export interface DeviceInfo {
  type?: string;
  model?: string;
  vendor?: string;
  browser?: {
    name?: string;
    version?: string;
  };
  os?: {
    name?: string;
    version?: string;
  };
}

export interface SessionInfo {
  _id: string;
  userAgent: string;
  ip: string;
  device: DeviceInfo;
  lastActive: string;
  isActive: boolean;
  expiresAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  avatar?: string;
  phone?: string;
  isAdmin: boolean;
}

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
    try {
      const response = await axiosInstance.post<AuthResponse>(
        "/api/v1/auth/register",
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Đăng xuất
  logout: async () => {
    return axiosInstanceAuth.delete("/api/v1/auth/logout");
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
    try {
      const response = await axiosInstance.post<AuthResponse>(
        "/api/v1/auth/refresh-token",
        {
          refreshToken,
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Lấy thông tin user hiện tại
  getMe: async () => {
    return axiosInstanceAuth.get<AuthResponse<User>>("/api/v1/auth/me");
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
