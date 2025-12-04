import { axiosInstanceAuth } from "../utils/axiosIntance";
import {
  DashboardData,
  DailyRevenueItem,
  DailyRevenueSummary,
  MonthlyRevenueItem,
  MonthlyRevenueSummary,
  TopSellingProduct,
  TopSellingProductsSummary,
} from "../types/dashboard";
import { ApiResponse } from "../types/api";

// Dashboard Service
export const dashboardService = {
  // Láº¥y dá»¯ liá»‡u tá»•ng quan cá»§a dashboard
  getDashboardData: (): Promise<{ data: ApiResponse<DashboardData> }> =>
    axiosInstanceAuth.get("/api/v1/admin/dashboard"),

  // Láº¥y dá»¯ liá»‡u doanh thu theo ngÃ y
  getDailyRevenue: (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    data: ApiResponse<DailyRevenueItem[]> & { summary: DailyRevenueSummary };
  }> =>
    axiosInstanceAuth.get("/api/v1/admin/dashboard/revenue/daily", { params }),

  // Láº¥y dá»¯ liá»‡u doanh thu theo thÃ¡ng
  getMonthlyRevenue: (params?: {
    year?: number;
  }): Promise<{
    data: ApiResponse<MonthlyRevenueItem[]> & {
      summary: MonthlyRevenueSummary;
      year: number;
    };
  }> =>
    axiosInstanceAuth.get("/api/v1/admin/dashboard/revenue/monthly", {
      params,
    }),
  // Láº¥y thá»‘ng kÃª sáº£n pháº©m bÃ¡n cháº¡y nháº¥t
  getTopSellingProducts: (params?: {
    period?: "week" | "month" | "year";
    limit?: number;
  }): Promise<{
    data: ApiResponse<TopSellingProduct[]> & {
      summary: TopSellingProductsSummary;
      period: string;
    };
  }> =>
    axiosInstanceAuth.get("/api/v1/admin/dashboard/top-selling-products", {
      params,
    }),
};

export default dashboardService;
