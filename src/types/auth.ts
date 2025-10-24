import { ApiResponse } from "./common";
import type { User } from "./user";
import type {
  SessionDevice as DeviceInfo,
  Session as SessionInfo,
} from "./session";

// =======================
// AUTH REQUEST INTERFACES
// =======================
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

// =======================
// AUTH RESPONSE INTERFACES
// =======================
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

// Re-export common types for convenience
export type { User, DeviceInfo, SessionInfo, ApiResponse };
