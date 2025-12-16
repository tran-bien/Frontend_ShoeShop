// =======================
// COUPON TYPES
// =======================

// Coupon scope - applies to which items
export type CouponScope = "ALL" | "PRODUCTS" | "CATEGORIES";

// Coupon priority for display sorting
export type CouponPriority = "HIGH" | "MEDIUM" | "LOW";

// Advanced conditions for coupon
export interface CouponConditions {
  minQuantity?: number;
  maxUsagePerUser?: number;
  requiredTiers?: string[]; // LoyaltyTier IDs
  firstOrderOnly?: boolean;
  requiredTotalSpent?: number;
}

export interface Coupon {
  _id: string;
  code: string;
  description: string;
  type: "percent" | "fixed";
  value: number;
  maxDiscount?: number;
  minOrderValue: number;
  startDate: string;
  endDate: string;
  maxUses?: number;
  currentUses: number;
  status: "active" | "inactive" | "expired" | "archived";
  isPublic: boolean;

  // Redeem with loyalty points
  isRedeemable?: boolean;
  pointCost?: number;
  maxRedeemPerUser?: number;

  // Advanced coupon - scope restriction
  scope?: CouponScope;
  applicableProducts?: string[];
  applicableCategories?: string[];

  // Advanced conditions
  conditions?: CouponConditions;

  // Priority for display
  priority?: CouponPriority;

  createdAt: string;
  updatedAt: string;
}

export interface UserCoupon {
  _id: string;
  user: string;
  coupon: Coupon;
  collectedAt: string;
  usedAt?: string;
  isUsed: boolean;
}

export interface CouponQuery {
  page?: number;
  limit?: number;
  code?: string;
  type?: "percent" | "fixed";
  status?: "active" | "inactive" | "expired" | "archived";
  isPublic?: boolean;
  isRedeemable?: boolean;
  sort?: string;
}

// =======================
// COUPON RESPONSE TYPES
// =======================

export interface PublicCouponsResponse {
  success: boolean;
  message: string;
  coupons: Coupon[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminCouponsResponse {
  success: boolean;
  message: string;
  data: {
    coupons: Coupon[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface AdminCouponDetailResponse {
  success: boolean;
  message: string;
  data: Coupon;
}

// =======================
// COUPON REQUEST TYPES (Create/Update)
// =======================

export interface CreateCouponData {
  code: string;
  description: string;
  type: "percent" | "fixed";
  value: number;
  maxDiscount?: number;
  minOrderValue: number;
  startDate: string;
  endDate: string;
  maxUses?: number;
  status?: "active" | "inactive" | "expired" | "archived";
  isPublic: boolean;

  // Redeem with loyalty points
  isRedeemable?: boolean;
  pointCost?: number;
  maxRedeemPerUser?: number;

  // Advanced coupon - scope restriction
  scope?: CouponScope;
  applicableProducts?: string[];
  applicableCategories?: string[];

  // Advanced conditions
  conditions?: CouponConditions;

  // Priority for display
  priority?: CouponPriority;
}

export type UpdateCouponData = Partial<Omit<CreateCouponData, "status">> & {
  status?: "active" | "inactive" | "expired" | "archived";
};

export interface UpdateCouponStatusData {
  status: "active" | "inactive" | "expired" | "archived";
}

// Collect coupon response (when redeeming with points)
export interface CollectCouponResponse {
  success: boolean;
  message: string;
  pointsUsed?: number;
  coupon: Coupon;
}
