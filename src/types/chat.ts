/**
 * Chat Types
 * Định nghĩa các interface liên quan đến AI Chatbot và Real-time Chat
 */

// =======================
// AI CHATBOT TYPES
// =======================

/**
 * Interface cho tin nhắn trong AI chat
 */
export interface AIChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isError?: boolean;
  isWarning?: boolean;
}

/**
 * Alias cho backward compatibility
 */
export type ChatMessage = AIChatMessage;

/**
 * Interface cho history item gửi lên BE
 */
export interface ChatHistoryItem {
  role: string;
  text: string;
}

// =======================
// AI API REQUEST/RESPONSE TYPES
// =======================

/**
 * Interface cho request body gửi lên BE
 */
export interface ChatRequestBody {
  message: string;
  sessionId?: string;
  history: ChatHistoryItem[];
}

/**
 * Interface cho response data từ BE
 * SYNC với BE: gemini.controller.js
 */
export interface ChatResponseData {
  response: string;
  sessionId: string;
  // Training status
  trained: boolean; // AI đã được train chưa (có KB)
  hasContext: boolean; // Có tìm thấy context từ KB không
  // Error flags
  outOfScope: boolean; // Câu hỏi ngoài phạm vi (chỉ khi trained=true)
  noContext: boolean; // Không tìm thấy context liên quan (trained=true)
  cached: boolean; // Response từ cache
  rateLimited: boolean; // Bị rate limit
  quotaExhausted: boolean; // Hết quota API
}

/**
 * Interface cho full response từ BE
 */
export interface ChatApiResponse {
  success: boolean;
  data?: ChatResponseData;
  message?: string;
}

/**
 * Interface cho Training Status API
 * GET /api/v1/public/ai-chat/status
 */
export interface TrainingStatusResponse {
  trained: boolean;
  totalDocuments: number;
  description: string;
}

// =======================
// REAL-TIME CHAT TYPES (Conversation với Staff/Admin)
// =======================

export interface ChatParticipant {
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: { url: string };
  };
  role: "user" | "staff" | "admin" | "shipper";
  joinedAt: string;
  lastReadAt?: string;
}

export interface ConversationMessage {
  _id: string;
  conversationId: string;
  senderId: {
    _id: string;
    name: string;
    avatar?: { url: string };
  };
  type: "text" | "image" | "system";
  text?: string;
  images?: Array<{ url: string; public_id: string }>;
  isRead: boolean;
  readBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatConversation {
  _id: string;
  participants: ChatParticipant[];
  status: "active" | "closed";
  lastMessage?: {
    text?: string;
    type: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationData {
  targetUserId?: string;
  participantIds?: string[];
  initialMessage?: string;
  message?: string;
  orderId?: string;
}

export interface SendMessageData {
  type: "text" | "image";
  text?: string;
  images?: Array<{ url: string; public_id: string }>;
}

export interface ConversationsQueryParams {
  status?: string;
  page?: number;
  limit?: number;
}

export interface MessagesQueryParams {
  page?: number;
  limit?: number;
}
