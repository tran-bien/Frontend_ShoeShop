/**
 * Profile Service
 * Quáº£n lÃ½ thÃ´ng tin ngÆ°á»i dÃ¹ng vÃ  Ä‘á»‹a chá»‰
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
  // Láº¥y thÃ´ng tin profile
  getProfile: (): Promise<{ data: ProfileResponse }> =>
    axiosInstanceAuth.get("/api/v1/users/profile"),

  // Cáº­p nháº­t thÃ´ng tin ngÆ°á»i dÃ¹ng
  updateProfile: (
    data: UpdateUserProfileData
  ): Promise<{ data: ApiResponse<User> }> =>
    axiosInstanceAuth.put("/api/v1/users/profile", data),

  // Cáº­p nháº­t avatar (form-data)
  updateAvatar: (formData: FormData): Promise<{ data: ApiResponse<User> }> =>
    axiosInstanceAuth.post("/api/v1/users/images/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // XÃ³a avatar
  deleteAvatar: (): Promise<{ data: ApiResponse<User> }> =>
    axiosInstanceAuth.delete("/api/v1/users/images/avatar"),
};

// =======================
// USER ADDRESS SERVICE
// =======================

export const addressService = {
  // Láº¥y danh sÃ¡ch Ä‘á»‹a chá»‰
  getAddresses: (): Promise<{ data: ApiResponse<UserAddress[]> }> =>
    axiosInstanceAuth.get("/api/v1/users/addresses"),

  // ThÃªm Ä‘á»‹a chá»‰ má»›i
  addAddress: (
    data: Omit<UserAddress, "_id">
  ): Promise<{ data: AddressResponse }> =>
    axiosInstanceAuth.post("/api/v1/users/addresses", data),

  // Cáº­p nháº­t Ä‘á»‹a chá»‰
  updateAddress: (
    addressId: string,
    data: Partial<UserAddress>
  ): Promise<{ data: AddressResponse }> =>
    axiosInstanceAuth.put(`/api/v1/users/addresses/${addressId}`, data),

  // XÃ³a Ä‘á»‹a chá»‰
  deleteAddress: (addressId: string): Promise<{ data: ApiResponse<null> }> =>
    axiosInstanceAuth.delete(`/api/v1/users/addresses/${addressId}`),

  // Äáº·t Ä‘á»‹a chá»‰ máº·c Ä‘á»‹nh
  setDefaultAddress: (addressId: string): Promise<{ data: AddressResponse }> =>
    axiosInstanceAuth.put(`/api/v1/users/addresses/${addressId}/default`),
};

export default profileService;
