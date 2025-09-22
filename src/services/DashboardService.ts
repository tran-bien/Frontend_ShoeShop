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
  // Lấy dữ liệu tổng quan của dashboard
  getDashboardData: (): Promise<{ data: ApiResponse<DashboardData> }> =>
    axiosInstanceAuth.get("/api/v1/admin/dashboard"),

  // Lấy dữ liệu doanh thu theo ngày
  getDailyRevenue: (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    data: ApiResponse<DailyRevenueItem[]> & { summary: DailyRevenueSummary };
  }> =>
    axiosInstanceAuth.get("/api/v1/admin/dashboard/revenue/daily", { params }),

  // Lấy dữ liệu doanh thu theo tháng
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
  // Lấy thống kê sản phẩm bán chạy nhất
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
