/**
 * Loyalty Types
 * Định nghĩa các interface liên quan đến Điểm thưởng và Hạng thành viên
 */

// =======================
// LOYALTY TIER TYPES
// =======================

export interface LoyaltyTier {
  _id: string;
  name: string;
  slug: string;
  minPoints: number;
  maxPoints?: number;
  benefits: {
    pointsMultiplier: number;
    prioritySupport: boolean;
  };
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// =======================
// LOYALTY TRANSACTION TYPES
// =======================

export type LoyaltyTransactionType =
  | "earn_order"
  | "earn_review"
  | "earn_referral"
  | "earn_birthday"
  | "earn_promotion"
  | "deduct_order"
  | "deduct_return"
  | "deduct_cancellation"
  | "expire"
  | "adjust";

export interface LoyaltyTransaction {
  _id: string;
  user: string;
  type: LoyaltyTransactionType;
  points: number;
  balanceAfter: number;
  description: string;
  relatedOrder?: string;
  relatedReview?: string;
  expiresAt?: string;
  createdAt: string;
}

// =======================
// USER LOYALTY INFO
// =======================

export interface UserLoyaltyInfo {
  currentPoints: number;
  lifetimePoints?: number;
  totalEarned?: number;
  totalRedeemed?: number;
  currentTier?: LoyaltyTier;
  tier?: LoyaltyTier;
  tierName?: string;
  nextTier?:
    | LoyaltyTier
    | {
        name: string;
        minPoints: number;
        pointsNeeded: number;
      };
  pointsToNextTier?: number;
  expiringPoints?:
    | number
    | {
        points: number;
        expiresAt: string;
      };
}

// =======================
// LOYALTY QUERY PARAMS
// =======================

export interface LoyaltyTransactionQueryParams {
  page?: number;
  limit?: number;
  type?: LoyaltyTransactionType;
  fromDate?: string;
  toDate?: string;
}

export interface LoyaltyTierQueryParams {
  isActive?: boolean;
  sort?: string;
}

// =======================
// LOYALTY CRUD DATA
// =======================

export interface CreateLoyaltyTierData {
  name: string;
  minPoints: number;
  maxPoints?: number;
  benefits: {
    pointsMultiplier: number;
    prioritySupport: boolean;
  };
  displayOrder: number;
}

export interface UpdateLoyaltyTierData extends Partial<CreateLoyaltyTierData> {
  isActive?: boolean;
}

export interface AdjustPointsData {
  userId: string;
  points: number;
  description: string;
}

// =======================
// LOYALTY RESPONSES
// =======================

export interface LoyaltyInfoResponse {
  success: boolean;
  message: string;
  data: UserLoyaltyInfo;
}

export interface LoyaltyTransactionsResponse {
  success: boolean;
  message: string;
  data: {
    transactions: LoyaltyTransaction[];
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

export interface LoyaltyTiersResponse {
  success: boolean;
  message: string;
  data: {
    tiers: LoyaltyTier[];
  };
}

export interface LoyaltyTierDetailResponse {
  success: boolean;
  message: string;
  data: LoyaltyTier;
}

export interface AdjustPointsResponse {
  success: boolean;
  message: string;
  data: {
    transaction: LoyaltyTransaction;
    newBalance: number;
  };
}
