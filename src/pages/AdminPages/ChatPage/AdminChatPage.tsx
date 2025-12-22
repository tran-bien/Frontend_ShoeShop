import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FiMessageCircle,
  FiSend,
  FiLoader,
  FiUser,
  FiSearch,
  FiX,
  FiCheck,
  FiPlus,
  FiTruck,
} from "react-icons/fi";
import { chatService, ChatConversation } from "../../../services/ChatService";
import type { ConversationMessage } from "../../../types/chat";
import { useAuth } from "../../../hooks/useAuth";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";

interface Participant {
  role: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: { url: string };
  };
}

interface ChatUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: { url: string };
  phone?: string;
}

/**
 * AdminChatPage - SIMPLIFIED
 * Không có status open/close, mỗi cặp user chỉ có 1 conversation
 */
const AdminChatPage: React.FC = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs to access latest state in socket handlers
  const activeConversationRef = useRef<ChatConversation | null>(null);
  const conversationsRef = useRef<ChatConversation[]>([]);
  const userIdRef = useRef<string | undefined>(user?._id);

  // Keep refs in sync
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    userIdRef.current = user?._id;
  }, [user?._id]);

  // Modal states
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<ChatUser[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<
    "all" | "user" | "shipper"
  >("all");
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Auto scroll
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Helper function to update conversation with new message - inline version for socket handlers
  const updateConversationInline = useCallback(
    (conversationId: string, message: ConversationMessage) => {
      setConversations((prev) => {
        const currentActive = activeConversationRef.current;
        const currentUserId = userIdRef.current;
        // Check if sender is the current user (admin/staff)
        const senderId =
          typeof message.senderId === "object"
            ? message.senderId._id
            : message.senderId;
        const isOwnMessage = senderId === currentUserId;

        // Check if sender is admin or staff (ANY admin/staff, not just current user)
        const senderRole =
          typeof message.senderId === "object"
            ? message.senderId.role
            : undefined;
        const isAdminOrStaffMessage =
          senderRole === "admin" || senderRole === "staff";

        const updated = prev.map((c) =>
          c._id === conversationId
            ? {
                ...c,
                lastMessage: {
                  text: message.text,
                  type: message.type || "text",
                  createdAt: message.createdAt,
                  senderId: senderId,
                },
                // Don't increase unread if:
                // - We're viewing this conversation, OR
                // - It's our own message, OR
                // - Sender is ANY admin/staff (they share unread state)
                unreadCount:
                  currentActive?._id === conversationId ||
                  isOwnMessage ||
                  isAdminOrStaffMessage
                    ? 0
                    : (c.unreadCount || 0) + 1,
              }
            : c
        );
        // Sort by last message time
        return updated.sort((a, b) => {
          const aTime = a.lastMessage?.createdAt
            ? new Date(a.lastMessage.createdAt).getTime()
            : 0;
          const bTime = b.lastMessage?.createdAt
            ? new Date(b.lastMessage.createdAt).getTime()
            : 0;
          return bTime - aTime;
        });
      });
    },
    []
  );

  // Reload conversations function
  const reloadConversations = useCallback(async () => {
    try {
      console.log("[AdminChat] Reloading conversations...");
      const response = await chatService.getConversations({});

      if (response.data.success && response.data.data) {
        const convs = response.data.data.conversations || [];
        const sorted = convs.sort(
          (a: ChatConversation, b: ChatConversation) => {
            const aTime = a.lastMessage?.createdAt
              ? new Date(a.lastMessage.createdAt).getTime()
              : 0;
            const bTime = b.lastMessage?.createdAt
              ? new Date(b.lastMessage.createdAt).getTime()
              : 0;
            return bTime - aTime;
          }
        );
        setConversations(sorted);
        console.log("[AdminChat] Reloaded", sorted.length, "conversations");
      }
    } catch (error) {
      console.error("[AdminChat] Failed to reload conversations:", error);
    }
  }, []);

  // Initialize Socket.IO
  useEffect(() => {
    if (!token) return;

    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5005";
    console.log("[AdminChat] Connecting to socket:", socketUrl);

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("[AdminChat] Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.log("[AdminChat] Socket disconnected");
    });

    newSocket.on("connect_error", (error: Error) => {
      console.error("[AdminChat] Socket error:", error);
    });

    // Listen for new messages in joined conversation rooms
    newSocket.on(
      "chat:newMessage",
      (data: { message: ConversationMessage; conversationId: string }) => {
        console.log("[AdminChat] Received chat:newMessage:", data);
        const currentActive = activeConversationRef.current;

        // Update messages if in active conversation
        if (currentActive && data.conversationId === currentActive._id) {
          setMessages((prev) => {
            const exists = prev.some((m) => m._id === data.message._id);
            if (exists) {
              console.log("[AdminChat] Message already exists");
              return prev;
            }
            console.log("[AdminChat] Adding message to state");
            return [...prev, data.message];
          });
        }

        // Update conversation list
        updateConversationInline(data.conversationId, data.message);
      }
    );

    // Listen for notifications (messages from conversations not yet joined)
    newSocket.on(
      "chat:notification",
      (data: {
        conversationId: string;
        message: string;
        fullMessage?: ConversationMessage;
      }) => {
        console.log("[AdminChat] Received chat:notification:", data);

        // Check if this is a NEW conversation not in our list
        const existingConv = conversationsRef.current.find(
          (c) => c._id === data.conversationId
        );

        if (!existingConv) {
          // New conversation - reload list
          console.log("[AdminChat] New conversation detected, reloading...");
          reloadConversations();
        } else if (data.fullMessage) {
          // Existing conversation - update it
          updateConversationInline(data.conversationId, data.fullMessage);
        }
      }
    );

    // Listen for admin-specific notifications (all new messages across all conversations)
    newSocket.on(
      "chat:adminNotification",
      (data: {
        conversationId: string;
        message: string;
        fullMessage?: ConversationMessage;
        conversation?: ChatConversation;
      }) => {
        console.log("[AdminChat] Received chat:adminNotification:", data);
        const currentActive = activeConversationRef.current;

        // Check if this is a NEW conversation not in our list
        const existingConv = conversationsRef.current.find(
          (c) => c._id === data.conversationId
        );

        if (!existingConv && data.conversation) {
          // New conversation - add to list immediately
          console.log("[AdminChat] New conversation, adding to list...");
          setConversations((prev) => {
            // Check again to prevent duplicates
            if (prev.some((c) => c._id === data.conversationId)) {
              return prev;
            }
            // Check if message sender is admin/staff
            const senderRole = data.fullMessage?.senderId?.role;
            const isAdminOrStaffMessage =
              senderRole === "admin" || senderRole === "staff";

            const newConv = {
              ...data.conversation!,
              // Don't show unread if admin/staff sent the message
              unreadCount: isAdminOrStaffMessage ? 0 : 1,
            };
            // Sort with newest first
            return [newConv, ...prev].sort((a, b) => {
              const aTime = a.lastMessage?.createdAt
                ? new Date(a.lastMessage.createdAt).getTime()
                : 0;
              const bTime = b.lastMessage?.createdAt
                ? new Date(b.lastMessage.createdAt).getTime()
                : 0;
              return bTime - aTime;
            });
          });
        } else if (data.fullMessage) {
          // Existing conversation - update message and unread count
          // Only add to messages if this is the active conversation
          if (currentActive && data.conversationId === currentActive._id) {
            setMessages((prev) => {
              const exists = prev.some((m) => m._id === data.fullMessage!._id);
              if (exists) return prev;
              return [...prev, data.fullMessage!];
            });
          }
          // Update conversation list
          updateConversationInline(data.conversationId, data.fullMessage);
        }
      }
    );

    newSocket.on("chat:userTyping", (data: { userId: string }) => {
      const currentUserId = userIdRef.current;
      if (data.userId !== currentUserId) {
        setIsTyping(true);
      }
    });

    newSocket.on("chat:userStopTyping", () => {
      setIsTyping(false);
    });

    setSocket(newSocket);

    return () => {
      console.log("[AdminChat] Disconnecting socket");
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, updateConversationInline, reloadConversations]);

  // Load all conversations (NO status filter)
  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("[AdminChat] Loading conversations...");

      const response = await chatService.getConversations({});

      if (response.data.success && response.data.data) {
        const convs = response.data.data.conversations || [];
        // Sort by last message time
        const sorted = convs.sort(
          (a: ChatConversation, b: ChatConversation) => {
            const aTime = a.lastMessage?.createdAt
              ? new Date(a.lastMessage.createdAt).getTime()
              : 0;
            const bTime = b.lastMessage?.createdAt
              ? new Date(b.lastMessage.createdAt).getTime()
              : 0;
            return bTime - aTime;
          }
        );
        setConversations(sorted);
        console.log("[AdminChat] Loaded", sorted.length, "conversations");
      }
    } catch (error) {
      console.error("[AdminChat] Failed to load conversations:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Join socket room when conversation is selected
  useEffect(() => {
    if (!activeConversation || !socket?.connected) return;

    console.log("[AdminChat] Joining conversation:", activeConversation._id);

    socket.emit(
      "chat:join",
      activeConversation._id,
      (response: { success: boolean; error?: string }) => {
        if (response.success) {
          console.log("[AdminChat] Joined room successfully");
        } else {
          console.error("[AdminChat] Failed to join room:", response.error);
        }
      }
    );

    // Load messages
    loadMessages(activeConversation._id);

    // Focus input when conversation is selected
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?._id, socket?.connected]);

  // Scroll to bottom when messages change or active conversation changes
  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 50);
    return () => clearTimeout(timer);
  }, [activeConversation?._id, scrollToBottom]);

  const loadMessages = async (conversationId: string) => {
    try {
      console.log("[AdminChat] Loading messages for:", conversationId);
      const response = await chatService.getMessages(conversationId, {
        limit: 100,
      });

      if (response.data.success && response.data.data) {
        setMessages(response.data.data.messages || []);
        console.log(
          "[AdminChat] Loaded",
          response.data.data.messages?.length,
          "messages"
        );

        // Mark as read
        await chatService.markAsRead(conversationId);
        setConversations((prev) =>
          prev.map((c) =>
            c._id === conversationId ? { ...c, unreadCount: 0 } : c
          )
        );
      }
    } catch (error) {
      console.error("[AdminChat] Failed to load messages:", error);
    }
  };

  // Load users for new chat modal
  const loadAvailableUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const params: { role?: string; search?: string } = {};
      if (userRoleFilter !== "all") {
        params.role = userRoleFilter;
      }
      if (userSearchTerm.trim()) {
        params.search = userSearchTerm.trim();
      }
      const response = await chatService.getAvailableUsers(params);
      if (response.data.success && response.data.data) {
        setAvailableUsers(response.data.data.users || []);
      }
    } catch (error) {
      console.error("[AdminChat] Failed to load users:", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoadingUsers(false);
    }
  }, [userRoleFilter, userSearchTerm]);

  useEffect(() => {
    if (showNewChatModal) {
      loadAvailableUsers();
    }
  }, [showNewChatModal, loadAvailableUsers]);

  // Start chat with user
  const handleStartChat = async (targetUser: ChatUser) => {
    try {
      setLoadingUsers(true);
      const response = await chatService.createConversation({
        targetUserId: targetUser._id,
      });

      if (response.data.success && response.data.data) {
        const newConv = response.data.data;
        console.log("[AdminChat] Created/got conversation:", newConv._id);

        // Check if conversation already exists in list
        const exists = conversations.find((c) => c._id === newConv._id);
        if (!exists) {
          setConversations((prev) => [newConv, ...prev]);
        }

        setActiveConversation(newConv);
        setShowNewChatModal(false);
        toast.success(`Đã mở chat với ${targetUser.name}`);
      }
    } catch (error) {
      console.error("[AdminChat] Failed to create conversation:", error);
      toast.error("Không thể tạo cuộc hội thoại");
    } finally {
      setLoadingUsers(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !activeConversation || isSending) return;

    const messageText = inputMessage.trim();
    setInputMessage("");
    setIsSending(true);

    if (socket) {
      socket.emit("chat:stopTyping", activeConversation._id);
    }

    try {
      if (socket?.connected) {
        console.log("[AdminChat] Sending message via socket...");

        socket.emit(
          "chat:sendMessage",
          {
            conversationId: activeConversation._id,
            type: "text",
            text: messageText,
          },
          (response: {
            success: boolean;
            message?: ConversationMessage;
            error?: string;
          }) => {
            console.log("[AdminChat] Send response:", response);
            if (!response.success) {
              toast.error(response.error || "Không thể gửi tin nhắn");
            }
            setIsSending(false);
          }
        );
      } else {
        // HTTP fallback
        console.log("[AdminChat] Using HTTP fallback...");
        const response = await chatService.sendMessage(activeConversation._id, {
          type: "text",
          text: messageText,
        });

        if (response.data.success && response.data.data) {
          const newMsg = response.data.data;
          setMessages((prev) => [...prev, newMsg]);
        }
        setIsSending(false);
      }
    } catch (error) {
      console.error("[AdminChat] Failed to send:", error);
      toast.error("Không thể gửi tin nhắn");
      setIsSending(false);
    }
  };

  const handleTyping = () => {
    if (socket && activeConversation) {
      socket.emit("chat:typing", activeConversation._id);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("chat:stopTyping", activeConversation._id);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter((conv) => {
    if (!searchTerm) return true;
    const customer = conv.participants.find(
      (p: Participant) => p.role === "user" || p.role === "shipper"
    )?.userId;
    return customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getCustomerInfo = (conv: ChatConversation) => {
    return conv.participants.find(
      (p: Participant) => p.role === "user" || p.role === "shipper"
    )?.userId;
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "shipper":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded">
            <FiTruck className="w-3 h-3" /> Shipper
          </span>
        );
      case "user":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-700 rounded">
            <FiUser className="w-3 h-3" /> Khách
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full flex bg-white">
      {/* Left Panel - Conversations List */}
      <div className="w-80 border-r border-mono-200 flex flex-col">
        {/* Header - Fixed at top */}
        <div className="p-4 border-b border-mono-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-mono-900">Chat Hỗ Trợ</h2>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 bg-mono-900 text-white rounded-lg hover:bg-mono-800 transition-colors"
              title="Tạo cuộc hội thoại mới"
            >
              <FiPlus className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-mono-50 border border-mono-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mono-900"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <FiLoader className="w-6 h-6 animate-spin text-mono-400" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center text-mono-500 py-10">
              <FiMessageCircle className="w-10 h-10 mx-auto mb-3 text-mono-300" />
              <p>Không có cuộc hội thoại</p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="mt-4 px-4 py-2 text-sm bg-mono-900 text-white rounded-lg hover:bg-mono-800"
              >
                Bắt đầu chat
              </button>
            </div>
          ) : (
            <div className="divide-y divide-mono-100">
              {filteredConversations.map((conv) => {
                const customer = getCustomerInfo(conv);
                const customerRole = conv.participants.find(
                  (p: Participant) => p.role === "user" || p.role === "shipper"
                )?.role;

                return (
                  <button
                    key={conv._id}
                    onClick={() => setActiveConversation(conv)}
                    className={`w-full p-4 text-left hover:bg-mono-50 transition-colors ${
                      activeConversation?._id === conv._id ? "bg-mono-100" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-mono-200 flex items-center justify-center overflow-hidden">
                          {customer?.avatar?.url ? (
                            <img
                              src={customer.avatar.url}
                              alt={customer.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FiUser className="w-5 h-5 text-mono-500" />
                          )}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-mono-900 truncate">
                            {customer?.name || "Khách hàng"}
                          </p>
                          {conv.unreadCount && conv.unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 text-xs bg-mono-900 text-white rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {customerRole && getRoleBadge(customerRole)}
                        </div>
                        <p className="text-sm text-mono-500 truncate mt-1">
                          {conv.lastMessage?.text || "Bắt đầu trò chuyện"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {!activeConversation ? (
          <div className="flex-1 flex items-center justify-center bg-mono-50">
            <div className="text-center">
              <FiMessageCircle className="w-16 h-16 mx-auto mb-4 text-mono-300" />
              <h3 className="text-xl font-semibold text-mono-700 mb-2">
                Chọn cuộc hội thoại
              </h3>
              <p className="text-mono-500 mb-4">
                Chọn từ danh sách bên trái để bắt đầu
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-4 py-2 bg-mono-900 text-white rounded-lg hover:bg-mono-800 inline-flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Tạo cuộc hội thoại
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-mono-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-mono-200 flex items-center justify-center overflow-hidden">
                    {getCustomerInfo(activeConversation)?.avatar?.url ? (
                      <img
                        src={getCustomerInfo(activeConversation)?.avatar?.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiUser className="w-5 h-5 text-mono-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-mono-900">
                        {getCustomerInfo(activeConversation)?.name ||
                          "Khách hàng"}
                      </h3>
                      {getRoleBadge(
                        activeConversation.participants.find(
                          (p: Participant) =>
                            p.role === "user" || p.role === "shipper"
                        )?.role || ""
                      )}
                    </div>
                    <p className="text-sm text-mono-500">
                      {getCustomerInfo(activeConversation)?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveConversation(null)}
                  className="p-2 text-mono-500 hover:text-mono-900 hover:bg-mono-100 rounded-lg transition-colors md:hidden"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-mono-50">
              {messages.map((msg) => {
                const isOwn = msg.senderId._id === user?._id;
                // Kiểm tra xem sender có phải admin/staff không
                const isStaffOrAdmin = ["admin", "staff"].includes(
                  msg.senderId.role || ""
                );

                return (
                  <div
                    key={msg._id}
                    className={`flex ${
                      isStaffOrAdmin ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl ${
                        isStaffOrAdmin
                          ? "bg-mono-900 text-white rounded-br-sm"
                          : "bg-white text-mono-800 border border-mono-200 rounded-bl-sm"
                      }`}
                    >
                      {!isOwn && (
                        <p
                          className={`text-xs mb-1 ${
                            isStaffOrAdmin ? "text-mono-300" : "text-mono-500"
                          }`}
                        >
                          {msg.senderId.name}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <div
                        className={`flex items-center gap-1 mt-1 ${
                          isStaffOrAdmin ? "justify-end" : ""
                        }`}
                      >
                        <span
                          className={`text-[10px] ${
                            isStaffOrAdmin ? "text-mono-300" : "text-mono-400"
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isOwn && msg.isRead && (
                          <FiCheck
                            className={`w-3 h-3 ${
                              isStaffOrAdmin ? "text-mono-300" : "text-mono-400"
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-bl-sm border border-mono-200">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-mono-400 rounded-full animate-bounce" />
                      <span
                        className="w-2 h-2 bg-mono-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <span
                        className="w-2 h-2 bg-mono-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-mono-200 bg-white">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-2.5 bg-mono-50 border border-mono-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-mono-900 focus:border-transparent"
                  disabled={isSending}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isSending}
                  className="p-2.5 bg-mono-900 text-white rounded-full hover:bg-mono-800 disabled:bg-mono-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSending ? (
                    <FiLoader className="w-5 h-5 animate-spin" />
                  ) : (
                    <FiSend className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-mono-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Tạo cuộc hội thoại mới</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-2 hover:bg-mono-100 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-mono-100">
              <div className="relative mb-3">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc email..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-mono-50 border border-mono-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mono-900"
                />
              </div>
              <div className="flex gap-2">
                {(["all", "user", "shipper"] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setUserRoleFilter(role)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                      userRoleFilter === role
                        ? "bg-mono-900 text-white"
                        : "bg-mono-100 text-mono-600 hover:bg-mono-200"
                    }`}
                  >
                    {role === "all"
                      ? "Tất cả"
                      : role === "user"
                      ? "Khách hàng"
                      : "Shipper"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingUsers ? (
                <div className="flex items-center justify-center h-40">
                  <FiLoader className="w-6 h-6 animate-spin text-mono-400" />
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="text-center text-mono-500 py-10">
                  <FiUser className="w-10 h-10 mx-auto mb-3 text-mono-300" />
                  <p>Không tìm thấy người dùng</p>
                </div>
              ) : (
                <div className="divide-y divide-mono-100">
                  {availableUsers.map((chatUser) => (
                    <button
                      key={chatUser._id}
                      onClick={() => handleStartChat(chatUser)}
                      className="w-full p-4 text-left hover:bg-mono-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-mono-200 flex items-center justify-center overflow-hidden">
                          {chatUser.avatar?.url ? (
                            <img
                              src={chatUser.avatar.url}
                              alt={chatUser.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FiUser className="w-5 h-5 text-mono-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-mono-900 truncate">
                              {chatUser.name}
                            </p>
                            {getRoleBadge(chatUser.role)}
                          </div>
                          <p className="text-sm text-mono-500 truncate">
                            {chatUser.email}
                          </p>
                        </div>
                        <FiMessageCircle className="w-5 h-5 text-mono-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChatPage;
