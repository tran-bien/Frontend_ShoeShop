import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FiMessageCircle,
  FiSend,
  FiLoader,
  FiUser,
  FiSearch,
  FiX,
  FiCheck,
  FiCheckCircle,
  FiPlus,
  FiRefreshCw,
  FiImage,
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

interface ImageItem {
  url: string;
  public_id?: string;
}

interface ChatUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: { url: string };
  phone?: string;
}

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
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "closed">(
    "active"
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New conversation modal states
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<ChatUser[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<
    "all" | "user" | "shipper"
  >("all");
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Image states
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // Auto scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initialize Socket.IO
  useEffect(() => {
    if (token) {
      const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5005";
      const newSocket = io(socketUrl, {
        auth: { token },
        transports: ["websocket", "polling"],
      });

      newSocket.on("connect", () => {
        console.log("[AdminChat] Socket connected");
      });

      newSocket.on(
        "chat:newMessage",
        (data: { message: ConversationMessage; conversationId: string }) => {
          if (
            activeConversation &&
            data.conversationId === activeConversation._id
          ) {
            setMessages((prev) => [...prev, data.message]);
          }
          // Update conversation list
          setConversations((prev) =>
            prev.map((c) =>
              c._id === data.conversationId
                ? {
                    ...c,
                    lastMessage: {
                      text: data.message.text,
                      type: data.message.type,
                      createdAt: data.message.createdAt,
                      senderId: data.message.senderId._id,
                    },
                    unreadCount:
                      activeConversation?._id === data.conversationId
                        ? 0
                        : (c.unreadCount || 0) + 1,
                  }
                : c
            )
          );
        }
      );

      newSocket.on("chat:notification", () => {
        loadConversations();
      });

      newSocket.on("chat:userTyping", (data: { userId: string }) => {
        if (data.userId !== user?._id) {
          setIsTyping(true);
        }
      });

      newSocket.on("chat:userStopTyping", () => {
        setIsTyping(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeConversation, user?._id]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: { status?: string } = {};
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      const response = await chatService.getConversations(params);
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation._id);
      if (socket) {
        socket.emit(
          "chat:join",
          activeConversation._id,
          (response: { success: boolean; error?: string }) => {
            if (!response.success) {
              console.error("[AdminChat] Join error:", response.error);
            }
          }
        );
      }
    }
  }, [activeConversation, socket]);

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await chatService.getMessages(conversationId, {
        limit: 100,
      });
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setMessages(data.messages || []);
        await chatService.markAsRead(conversationId);
        setConversations((prev) =>
          prev.map((c) =>
            c._id === conversationId ? { ...c, unreadCount: 0 } : c
          )
        );
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  // Load available users for new chat
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
      console.error("Failed to load users:", error);
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

  // Create new conversation with selected user
  const handleStartChat = async (targetUser: ChatUser) => {
    try {
      setLoadingUsers(true);
      const response = await chatService.createConversation({
        targetUserId: targetUser._id,
      });
      if (response.data.success && response.data.data) {
        const newConversation = response.data.data;
        // Kiểm tra conversation đã tồn tại trong list chưa
        const exists = conversations.find((c) => c._id === newConversation._id);
        if (!exists) {
          setConversations((prev) => [newConversation, ...prev]);
        } else {
          // Update conversation trong list (có thể đã được reopen)
          setConversations((prev) =>
            prev.map((c) =>
              c._id === newConversation._id ? newConversation : c
            )
          );
        }
        setActiveConversation(newConversation);
        setShowNewChatModal(false);
        // Reload conversations để có danh sách mới nhất
        loadConversations();
        toast.success(`Bắt đầu chat với ${targetUser.name}`);
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
      toast.error("Không thể tạo cuộc hội thoại");
    } finally {
      setLoadingUsers(false);
    }
  };

  const sendMessage = async () => {
    const hasText = inputMessage.trim();
    const hasImages = selectedImages.length > 0;

    if ((!hasText && !hasImages) || !activeConversation || isSending) return;

    const messageText = inputMessage.trim();
    const imagesToSend = [...selectedImages];

    setInputMessage("");
    setSelectedImages([]);
    setPreviewImages([]);
    setIsSending(true);

    if (socket) {
      socket.emit("chat:stopTyping", activeConversation._id);
    }

    try {
      // Xác định loại tin nhắn: mixed nếu có cả text và images
      let messageType: "text" | "image" | "mixed" = "text";
      if (hasImages && hasText) {
        messageType = "mixed";
      } else if (hasImages) {
        messageType = "image";
      }

      if (socket?.connected) {
        socket.emit(
          "chat:sendMessage",
          {
            conversationId: activeConversation._id,
            type: messageType,
            text: messageText || "",
            images: imagesToSend,
          },
          (response: {
            success: boolean;
            message?: ConversationMessage;
            error?: string;
          }) => {
            if (!response.success) {
              toast.error(response.error || "Không thể gửi tin nhắn");
            }
            setIsSending(false);
          }
        );
      } else {
        const response = await chatService.sendMessage(activeConversation._id, {
          type: messageType,
          text: messageText || "",
          images: hasImages
            ? imagesToSend.map((img) => ({ url: img, public_id: "" }))
            : undefined,
        });
        if (response.data.success && response.data.data) {
          const newMessage = response.data.data;
          setMessages((prev) => [...prev, newMessage]);
        }
        setIsSending(false);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Không thể gửi tin nhắn");
      setIsSending(false);
    }
  };

  const handleCloseConversation = async (conversationId: string) => {
    try {
      await chatService.closeConversation(conversationId);
      toast.success("Đã đóng cuộc hội thoại");
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId ? { ...c, status: "closed" } : c
        )
      );
      if (activeConversation?._id === conversationId) {
        setActiveConversation((prev) =>
          prev ? { ...prev, status: "closed" } : null
        );
      }
    } catch (error) {
      console.error("Failed to close conversation:", error);
      toast.error("Không thể đóng cuộc hội thoại");
    }
  };

  const handleReopenConversation = async (conversationId: string) => {
    try {
      const response = await chatService.reopenConversation(conversationId);
      if (response.data.success) {
        toast.success("Đã mở lại cuộc hội thoại");
        setConversations((prev) =>
          prev.map((c) =>
            c._id === conversationId ? { ...c, status: "active" } : c
          )
        );
        if (activeConversation?._id === conversationId) {
          setActiveConversation((prev) =>
            prev ? { ...prev, status: "active" } : null
          );
        }
      }
    } catch (error) {
      console.error("Failed to reopen conversation:", error);
      toast.error("Không thể mở lại cuộc hội thoại");
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

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    if (!searchTerm) return true;
    const customerName = conv.participants.find(
      (p: Participant) => p.role === "user" || p.role === "shipper"
    )?.userId.name;
    return customerName?.toLowerCase().includes(searchTerm.toLowerCase());
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
    <div className="min-h-screen bg-mono-50">
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - Conversation List */}
        <div className="w-80 bg-white border-r border-mono-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-mono-200">
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
            <div className="relative mb-3">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-400" />
              <input
                type="text"
                placeholder="Tìm kiếm khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-mono-50 border border-mono-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mono-900"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {(["all", "active", "closed"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    statusFilter === status
                      ? "bg-mono-900 text-white"
                      : "bg-mono-100 text-mono-600 hover:bg-mono-200"
                  }`}
                >
                  {status === "all"
                    ? "Tất cả"
                    : status === "active"
                    ? "Đang mở"
                    : "Đã đóng"}
                </button>
              ))}
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
                <p>Không có cuộc hội thoại nào</p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="mt-4 px-4 py-2 text-sm bg-mono-900 text-white rounded-lg hover:bg-mono-800"
                >
                  Bắt đầu chat mới
                </button>
              </div>
            ) : (
              <div className="divide-y divide-mono-100">
                {filteredConversations.map((conv) => {
                  const customer = getCustomerInfo(conv);
                  const customerRole = conv.participants.find(
                    (p: Participant) =>
                      p.role === "user" || p.role === "shipper"
                  )?.role;
                  return (
                    <button
                      key={conv._id}
                      onClick={() => setActiveConversation(conv)}
                      className={`w-full p-4 text-left hover:bg-mono-50 transition-colors ${
                        activeConversation?._id === conv._id
                          ? "bg-mono-100"
                          : ""
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
                          {conv.status === "active" && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                          )}
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
                            {conv.status === "closed" && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-red-100 text-red-700 rounded">
                                Đã đóng
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-mono-500 truncate mt-1">
                            {conv.lastMessage?.text || "Bắt đầu cuộc hội thoại"}
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
                  Chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu
                </p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="px-4 py-2 bg-mono-900 text-white rounded-lg hover:bg-mono-800 inline-flex items-center gap-2"
                >
                  <FiPlus className="w-4 h-4" />
                  Tạo cuộc hội thoại mới
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
                  <div className="flex items-center gap-2">
                    {activeConversation.status === "active" ? (
                      <button
                        onClick={() =>
                          handleCloseConversation(activeConversation._id)
                        }
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-mono-600 hover:text-mono-900 hover:bg-mono-100 rounded-lg transition-colors"
                      >
                        <FiCheckCircle className="w-4 h-4" />
                        Đóng hội thoại
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleReopenConversation(activeConversation._id)
                        }
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <FiRefreshCw className="w-4 h-4" />
                        Mở lại
                      </button>
                    )}
                    <button
                      onClick={() => setActiveConversation(null)}
                      className="p-2 text-mono-500 hover:text-mono-900 hover:bg-mono-100 rounded-lg transition-colors md:hidden"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-mono-50">
                {messages.map((msg) => {
                  const isOwn = msg.senderId._id === user?._id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${
                        isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-2xl ${
                          isOwn
                            ? "bg-mono-900 text-white rounded-br-sm"
                            : "bg-white text-mono-800 border border-mono-200 rounded-bl-sm"
                        }`}
                      >
                        {!isOwn && (
                          <p className="text-xs text-mono-500 mb-1">
                            {msg.senderId.name}
                          </p>
                        )}
                        {msg.images && msg.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {msg.images.map((img: ImageItem, idx: number) => (
                              <img
                                key={idx}
                                src={img.url}
                                alt="Chat image"
                                className="max-w-[200px] rounded-lg"
                              />
                            ))}
                          </div>
                        )}
                        {msg.text && (
                          <p className="text-sm whitespace-pre-wrap">
                            {msg.text}
                          </p>
                        )}
                        <div
                          className={`flex items-center gap-1 mt-1 ${
                            isOwn ? "justify-end" : ""
                          }`}
                        >
                          <span
                            className={`text-[10px] ${
                              isOwn ? "text-mono-300" : "text-mono-400"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                          {isOwn && msg.isRead && (
                            <FiCheck className="w-3 h-3 text-mono-300" />
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

              {/* Image Preview */}
              {previewImages.length > 0 && (
                <div className="px-4 py-2 border-t border-mono-200 bg-mono-50">
                  <div className="flex flex-wrap gap-2">
                    {previewImages.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={img}
                          alt={`Preview ${idx + 1}`}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setPreviewImages((prev) =>
                              prev.filter((_, i) => i !== idx)
                            );
                            setSelectedImages((prev) =>
                              prev.filter((_, i) => i !== idx)
                            );
                          }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-mono-900 text-white rounded-full text-xs flex items-center justify-center hover:bg-mono-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              {activeConversation.status === "active" ? (
                <div className="p-4 border-t border-mono-200 bg-white">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files) {
                          const remainingSlots = 10 - selectedImages.length;
                          const filesToProcess = Math.min(
                            files.length,
                            remainingSlots
                          );

                          if (files.length > remainingSlots) {
                            toast.error("Chỉ được gửi tối đa 10 ảnh");
                          }

                          const newImages: string[] = [];
                          const newPreviews: string[] = [];

                          for (let i = 0; i < filesToProcess; i++) {
                            const file = files[i];
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const base64 = event.target?.result as string;
                              newImages.push(base64);
                              newPreviews.push(base64);

                              if (newImages.length === filesToProcess) {
                                setSelectedImages((prev) => [
                                  ...prev,
                                  ...newImages,
                                ]);
                                setPreviewImages((prev) => [
                                  ...prev,
                                  ...newPreviews,
                                ]);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }
                        e.target.value = "";
                      }}
                    />

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSending || selectedImages.length >= 10}
                      className="p-2.5 text-mono-600 hover:text-mono-900 hover:bg-mono-100 rounded-full disabled:text-mono-300 disabled:cursor-not-allowed transition-colors"
                      title="Đính kèm ảnh"
                    >
                      <FiImage className="w-5 h-5" />
                    </button>

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
                      disabled={
                        (!inputMessage.trim() && selectedImages.length === 0) ||
                        isSending
                      }
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
              ) : (
                <div className="p-4 border-t border-mono-200 bg-mono-100 text-center">
                  <p className="text-mono-500 mb-2">
                    Cuộc hội thoại này đã đóng
                  </p>
                  <button
                    onClick={() =>
                      handleReopenConversation(activeConversation._id)
                    }
                    className="px-4 py-2 text-sm bg-mono-900 text-white rounded-lg hover:bg-mono-800 inline-flex items-center gap-2"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    Mở lại hội thoại
                  </button>
                </div>
              )}
            </>
          )}
        </div>
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
                  <p>Không tìm thấy người dùng nào</p>
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
                          {chatUser.phone && (
                            <p className="text-xs text-mono-400">
                              {chatUser.phone}
                            </p>
                          )}
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
