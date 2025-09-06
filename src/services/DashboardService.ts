import { axiosInstanceAuth } from "../utils/axiosIntance";

// Dashboard Data Interfaces
export interface DashboardData {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
}

export interface DailyRevenueItem {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
  profitMargin: number;
  count: number;
}

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

export interface MonthlyRevenueItem {
  month: number;
  revenue: number;
  cost: number;
  profit: number;
  profitMargin: number;
  count: number;
}

export interface MonthlyRevenueSummary {
  totalYearlyRevenue: number;
  totalYearlyCost: number;
  totalYearlyProfit: number;
  totalYearlyOrders: number;
  yearlyProfitMargin: number;
}

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

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  summary?:
    | DailyRevenueSummary
    | MonthlyRevenueSummary
    | TopSellingProductsSummary;
  year?: number;
  period?: string;
}

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
