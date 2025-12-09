import { axiosInstanceAuth } from "../utils/axiosIntance";
import type { ApiResponse } from "../types/api";
import type {
  ChatParticipant,
  ConversationMessage,
  ChatConversation,
  CreateConversationData,
  SendMessageData,
  ConversationsQueryParams,
  MessagesQueryParams,
} from "../types/chat";

// Re-export types để tiện sử dụng
export type {
  ChatParticipant,
  ConversationMessage,
  ChatConversation,
  CreateConversationData,
  SendMessageData,
  ConversationsQueryParams,
  MessagesQueryParams,
};

// =======================
// RESPONSE TYPES
// =======================

interface GetConversationsResponse {
  conversations: ChatConversation[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface GetMessagesResponse {
  messages: ConversationMessage[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =======================
// CHAT SERVICE
// =======================

export const chatService = {
  // Get all conversations for current user
  getConversations: (
    params: ConversationsQueryParams = {}
  ): Promise<{ data: ApiResponse<GetConversationsResponse> }> =>
    axiosInstanceAuth.get("/api/v1/users/chat/conversations", { params }),

  // Create a new conversation
  createConversation: (
    data: CreateConversationData
  ): Promise<{ data: ApiResponse<ChatConversation> }> =>
    axiosInstanceAuth.post("/api/v1/users/chat/conversations", data),

  // Get messages in a conversation
  getMessages: (
    conversationId: string,
    params: MessagesQueryParams = {}
  ): Promise<{ data: ApiResponse<GetMessagesResponse> }> =>
    axiosInstanceAuth.get(
      `/api/v1/users/chat/conversations/${conversationId}/messages`,
      { params }
    ),

  // Send a message (HTTP fallback when Socket.IO is not available)
  sendMessage: (
    conversationId: string,
    data: SendMessageData
  ): Promise<{ data: ApiResponse<ConversationMessage> }> =>
    axiosInstanceAuth.post(
      `/api/v1/users/chat/conversations/${conversationId}/messages`,
      data
    ),

  // Mark conversation as read
  markAsRead: (conversationId: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.put(
      `/api/v1/users/chat/conversations/${conversationId}/read`
    ),

  // Close a conversation
  closeConversation: (
    conversationId: string
  ): Promise<{ data: ApiResponse<ChatConversation> }> =>
    axiosInstanceAuth.put(
      `/api/v1/users/chat/conversations/${conversationId}/close`
    ),
};

export default chatService;
