// src/services/AuthenticationService.ts
import { axiosInstance, axiosInstanceAuth } from "../utils/axiosIntance";

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

export const authenticateApi = {
  login: async (data: LoginRequest) => {
    return axiosInstance.post(`/api/v1/auth/login`, data);
  },

  register: async (data: RegisterRequest) => {
    return axiosInstance.post(`/api/v1/auth/register`, data);
  },

  logout: async () => {
    return axiosInstanceAuth.delete(`/api/v1/auth/logout`);
  },

  verifyOtp: async (data: OtpVerificationRequest) => {
    return axiosInstance.post(`/api/v1/auth/verify-otp`, data);
  },

  forgotPassword: async (data: ForgotPasswordRequest) => {
    return axiosInstance.post(`/api/v1/auth/forgot-password`, data);
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    return axiosInstance.post(`/api/v1/auth/reset-password`, data);
  },

  refreshToken: async (refreshToken: string) => {
    return axiosInstance.post(`/api/v1/auth/refresh-token`, { refreshToken });
  },

  // Lấy danh sách session đang active
  getSessions: async () => {
    return axiosInstanceAuth.get(`/api/v1/auth/sessions`);
  },

  // Đăng xuất khỏi session cụ thể
  logoutSession: async (sessionId: string) => {
    return axiosInstanceAuth.delete(`/api/v1/auth/sessions/${sessionId}`);
  },

  // Đăng xuất khỏi tất cả session ngoại trừ session hiện tại
  logoutAllOtherSessions: async () => {
    return axiosInstanceAuth.delete(`/api/v1/auth/sessions`);
  },

  // Đăng xuất khỏi tất cả session
  logoutAll: async () => {
    return axiosInstanceAuth.delete(`/api/v1/auth/logout-all`);
  },
};

// Thêm hàm đăng ký vào service để export
export const register = async (
  name: string,
  email: string,
  password: string
) => {
  try {
    const response = await axiosInstance.post("/api/v1/auth/register", {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
