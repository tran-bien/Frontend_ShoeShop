import { axiosInstance } from "../utils/axiosIntance";
import type { ApiResponse } from "../types/api";
import type {
  ChatApiResponse,
  ChatRequestBody,
  TrainingStatusResponse,
} from "../types/chat";

// =======================
// PUBLIC GEMINI SERVICE (AI Chat - không cần đăng nhập)
// =======================

export const publicGeminiService = {
  /**
   * Chat với AI
   * POST /api/v1/public/ai-chat
   *
   * LOGIC:
   * - trained=false: AI chưa được train, trả lời bất cứ gì (demo)
   * - trained=true: AI đã được train, chỉ trả lời trong phạm vi KB
   */
  chatWithAI: (
    message: string,
    sessionId?: string,
    history: Array<{ role: string; text: string }> = []
  ): Promise<{ data: ChatApiResponse }> => {
    const requestBody: ChatRequestBody = {
      message,
      history,
    };

    if (sessionId) {
      requestBody.sessionId = sessionId;
    }

    return axiosInstance.post("/api/v1/public/ai-chat", requestBody);
  },

  /**
   * Lấy trạng thái training của AI
   * GET /api/v1/public/ai-chat/status
   *
   * Response:
   * - trained: boolean - AI đã được train chưa
   * - totalDocuments: number - Số documents trong KB
   * - description: string - Mô tả trạng thái
   */
  getTrainingStatus: (): Promise<{
    data: ApiResponse<TrainingStatusResponse>;
  }> => axiosInstance.get("/api/v1/public/ai-chat/status"),
};

export default publicGeminiService;
