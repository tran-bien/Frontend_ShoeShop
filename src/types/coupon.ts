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
  sort?: string;
}
