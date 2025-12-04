import { ApiResponse } from "./api";

// =======================
// DASHBOARD DATA TYPES
// =======================

/**
 * Dashboard overview data
 */
export interface DashboardData {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
}

// =======================
// REVENUE TYPES
// =======================

/**
 * Daily revenue item
 */
export interface DailyRevenueItem {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
  profitMargin: number;
  count: number;
}

/**
 * Daily revenue summary
 */
export interface DailyRevenueSummary {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalOrders: number;
  profitMargin: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

/**
 * Monthly revenue item
 */
export interface MonthlyRevenueItem {
  month: number;
  revenue: number;
  cost: number;
  profit: number;
  profitMargin: number;
  count: number;
}

/**
 * Monthly revenue summary
 */
export interface MonthlyRevenueSummary {
  totalYearlyRevenue: number;
  totalYearlyCost: number;
  totalYearlyProfit: number;
  totalYearlyOrders: number;
  yearlyProfitMargin: number;
}

// =======================
// TOP SELLING PRODUCTS TYPES
// =======================

/**
 * Top selling product item
 */
export interface TopSellingProduct {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  image: string;
  percentage: number;
  profitMargin: number;
}

/**
 * Top selling products summary
 */
export interface TopSellingProductsSummary {
  totalQuantity: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

// =======================
// DASHBOARD API RESPONSE TYPES
// =======================

/**
 * Dashboard specific API response interface
 * Extends base ApiResponse with dashboard-specific summary types
 */
export interface DashboardApiResponse<T = unknown> extends ApiResponse<T> {
  summary?:
    | DailyRevenueSummary
    | MonthlyRevenueSummary
    | TopSellingProductsSummary;
  year?: number;
  period?: string;
}
