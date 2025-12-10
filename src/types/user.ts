/**
 * User Types
 * Định nghĩa các interface liên quan đến Người dùng
 */

// =======================
// USER ROLE & GENDER TYPES
// =======================

export type UserRole = "user" | "staff" | "admin" | "shipper";
export type UserGender = "male" | "female" | "other";

// =======================
// USER AVATAR TYPES
// =======================

export interface UserAvatar {
  url: string;
  public_id: string;
}

// =======================
// USER ADDRESS TYPES
// =======================

export interface UserAddress {
  _id?: string;
  name: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
  isDefault?: boolean;
}

// =======================
// USER WISHLIST TYPES
// =======================

export interface WishlistItem {
  product: string;
  variant?: string;
  addedAt: Date | string;
}

// =======================
// NOTIFICATION PREFERENCES
// =======================

// BE Schema structure:
// preferences: {
//   emailNotifications: { orderUpdates: boolean },
//   inAppNotifications: boolean
// }
export interface NotificationPreferences {
  emailNotifications: {
    orderUpdates: boolean;
  };
  inAppNotifications: boolean;
}

// =======================
// MAIN USER INTERFACE
// =======================

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: UserGender;
  dateOfBirth?: Date | string;
  role: UserRole;
  avatar?: UserAvatar;
  wishlist?: WishlistItem[];
  addresses?: UserAddress[];
  notificationPreferences?: NotificationPreferences;
  isActive?: boolean; // Account active status
  isVerified?: boolean; // Email verification status
  isBlock?: boolean;
  blockReason?: string;
  blockedAt?: Date | string;
  deletedAt?: Date | string | null;
  deletedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

// =======================
// USER CRUD DATA
// =======================

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  gender?: UserGender;
  dateOfBirth?: string;
  role?: UserRole;
}

export interface UpdateUserData {
  name?: string;
  email: string;
  phone?: string;
  gender?: UserGender;
  dateOfBirth?: string;
  role?: UserRole;
}

export interface UpdateUserProfileData {
  name?: string;
  phone?: string;
  gender?: UserGender;
  dateOfBirth?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface BlockUserData {
  isBlock: boolean;
  reason?: string;
}

export interface ChangeRoleData {
  role: "user" | "staff" | "admin" | "shipper";
}

// =======================
// USER QUERY PARAMS
// =======================

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isBlock?: boolean;
  includeDeleted?: boolean;
  sort?: string;
}

// =======================
// USER STATS TYPES
// =======================

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  deletedUsers: number;
  userCount: number;
  staffCount: number;
  adminCount: number;
  shipperCount: number;
}

// =======================
// USER RESPONSE TYPES
// =======================

export interface UsersResponse {
  success: boolean;
  message?: string;
  data?: User[];
  users?: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats?: UserStats;
}

export interface UserDetailResponse {
  success: boolean;
  message?: string;
  data?: User;
  user?: User;
}
