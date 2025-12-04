import { axiosInstanceAuth } from "../utils/axiosIntance";
import type { ApiResponse } from "../types/api";

// =======================
// RESPONSE TYPES
// =======================

interface DemoModeResponse {
  isDemoMode: boolean;
  message?: string;
}

// =======================
// ADMIN GEMINI SERVICE
// =======================

export const adminGeminiService = {
  // Lấy trạng thái Demo Mode
  getDemoMode: (): Promise<{ data: ApiResponse<DemoModeResponse> }> =>
    axiosInstanceAuth.get("/api/v1/admin/gemini/demo-mode"),

  // Toggle Demo Mode
  toggleDemoMode: (
    enabled: boolean
  ): Promise<{ data: ApiResponse<DemoModeResponse> }> =>
    axiosInstanceAuth.post("/api/v1/admin/gemini/demo-mode", { enabled }),
};

export default adminGeminiService;
