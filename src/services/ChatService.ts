import { axiosInstanceAuth } from "../utils/axiosIntance";

// =======================
// TYPES
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

export interface ChatMessage {
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

// =======================
// CHAT SERVICE
// =======================

export const chatService = {
  // Get all conversations for current user
  getConversations: (
    params: { status?: string; page?: number; limit?: number } = {}
  ) => axiosInstanceAuth.get("/api/v1/users/chat/conversations", { params }),

  // Create a new conversation
  createConversation: (data: CreateConversationData) =>
    axiosInstanceAuth.post("/api/v1/users/chat/conversations", data),

  // Get messages in a conversation
  getMessages: (
    conversationId: string,
    params: { page?: number; limit?: number } = {}
  ) =>
    axiosInstanceAuth.get(
      `/api/v1/users/chat/conversations/${conversationId}/messages`,
      { params }
    ),

  // Send a message (HTTP fallback when Socket.IO is not available)
  sendMessage: (conversationId: string, data: SendMessageData) =>
    axiosInstanceAuth.post(
      `/api/v1/users/chat/conversations/${conversationId}/messages`,
      data
    ),

  // Mark conversation as read
  markAsRead: (conversationId: string) =>
    axiosInstanceAuth.put(
      `/api/v1/users/chat/conversations/${conversationId}/read`
    ),

  // Close a conversation
  closeConversation: (conversationId: string) =>
    axiosInstanceAuth.put(
      `/api/v1/users/chat/conversations/${conversationId}/close`
    ),
};

export default chatService;
