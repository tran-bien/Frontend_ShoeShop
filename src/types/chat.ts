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
 */
export interface ChatResponseData {
  response: string;
  sessionId: string;
  outOfScope?: boolean;
  cached?: boolean;
  noKnowledge?: boolean;
  demoMode?: boolean;
  rateLimited?: boolean;
  quotaExhausted?: boolean;
}

/**
 * Interface cho full response từ BE
 */
export interface ChatApiResponse {
  success: boolean;
  data?: ChatResponseData;
  message?: string;
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
  participantIds?: string[];
  initialMessage?: string;
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

// Alias for backward compatibility
export type ChatMessage = AIChatMessage;
