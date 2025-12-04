/**
 * Profile Service
 * Quản lý thông tin người dùng và địa chỉ
 * BE Routes: /api/v1/users/profile, /api/v1/users/addresses
 */

import { axiosInstanceAuth } from "../utils/axiosIntance";
import type { User, UpdateUserProfileData, UserAddress } from "../types/user";
import type { ApiResponse } from "../types/api";

// Re-export types for convenience
export type { UpdateUserProfileData, UserAddress };

// =======================
// RESPONSE TYPES
// =======================

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface AddressResponse {
  success: boolean;
  message: string;
  data: {
    address: UserAddress;
    addresses?: UserAddress[];
  };
}

// =======================
// USER PROFILE SERVICE
// =======================

export const profileService = {
  // Lấy thông tin profile
  getProfile: (): Promise<{ data: ProfileResponse }> =>
    axiosInstanceAuth.get("/api/v1/users/profile"),

  // Cập nhật thông tin người dùng
  updateProfile: (
    data: UpdateUserProfileData
  ): Promise<{ data: ApiResponse<User> }> =>
    axiosInstanceAuth.put("/api/v1/users/profile", data),

  // Cập nhật avatar (form-data)
  updateAvatar: (formData: FormData): Promise<{ data: ApiResponse<User> }> =>
    axiosInstanceAuth.post("/api/v1/users/images/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Xóa avatar
  deleteAvatar: (): Promise<{ data: ApiResponse<User> }> =>
    axiosInstanceAuth.delete("/api/v1/users/images/avatar"),
};

// =======================
// USER ADDRESS SERVICE
// =======================

export const addressService = {
  // Thêm địa chỉ mới
  addAddress: (
    data: Omit<UserAddress, "_id">
  ): Promise<{ data: AddressResponse }> =>
    axiosInstanceAuth.post("/api/v1/users/addresses", data),

  // Cập nhật địa chỉ
  updateAddress: (
    addressId: string,
    data: Partial<UserAddress>
  ): Promise<{ data: AddressResponse }> =>
    axiosInstanceAuth.put(`/api/v1/users/addresses/${addressId}`, data),

  // Xóa địa chỉ
  deleteAddress: (addressId: string): Promise<{ data: ApiResponse<null> }> =>
    axiosInstanceAuth.delete(`/api/v1/users/addresses/${addressId}`),
};

export default profileService;
