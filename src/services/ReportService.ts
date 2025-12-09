import { axiosInstanceAuth } from "../utils/axiosIntance";
import type { ApiResponse } from "../types/api";
import type {
  InventoryReportItem,
  InventoryReportParams,
  InventoryReportResponse,
} from "../types/report";

// Re-export types để tiện sử dụng
export type {
  InventoryReportItem,
  InventoryReportParams,
  InventoryReportResponse,
};

// =======================
// ADMIN REPORT SERVICE
// =======================

export const adminReportService = {
  // Báo cáo tồn kho chi tiết
  getInventoryReport: (
    params?: InventoryReportParams
  ): Promise<{ data: ApiResponse<InventoryReportResponse> }> =>
    axiosInstanceAuth.get("/api/v1/admin/reports/inventory", { params }),
};

export default adminReportService;
