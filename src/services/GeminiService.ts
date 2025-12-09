import { axiosInstance, axiosInstanceAuth } from "../utils/axiosIntance";
import type { ApiResponse } from "../types/api";

// =======================
// RESPONSE TYPES
// =======================

interface DemoModeResponse {
  isDemoMode: boolean;
  message?: string;
}

interface AIChatResponse {
  reply: string;
  conversationId?: string;
  suggestions?: string[];
}

// =======================
// PUBLIC GEMINI SERVICE (AI Chat - không cần đăng nhập)
// =======================

export const publicGeminiService = {
  // Chat với AI (public - có thể dùng mà không cần đăng nhập)
  chatWithAI: (
    message: string,
    conversationId?: string
  ): Promise<{ data: ApiResponse<AIChatResponse> }> =>
    axiosInstance.post("/api/v1/public/ai-chat", { message, conversationId }),
};

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

export default {
  public: publicGeminiService,
  admin: adminGeminiService,
};
