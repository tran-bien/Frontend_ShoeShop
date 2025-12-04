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
} from "react-icons/fi";
import {
  chatService,
  ChatConversation,
  ChatMessage,
} from "../../../services/ChatService";
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

const AdminChatPage: React.FC = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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
        (data: { message: ChatMessage; conversationId: string }) => {
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
        // Reload conversations to get new ones
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
      if (response.data.success) {
        setConversations(response.data.data || []);
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
      // Join socket room
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
      if (response.data.success) {
        setMessages(response.data.data || []);
        await chatService.markAsRead(conversationId);
        // Reset unread count
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
        socket.emit(
          "chat:sendMessage",
          {
            conversationId: activeConversation._id,
            type: "text",
            text: messageText,
          },
          (response: {
            success: boolean;
            message?: ChatMessage;
            error?: string;
          }) => {
            if (!response.success) {
              toast.error(response.error || "KhÃ´ng thá»ƒ gá»­i tin nháº¯n");
            }
            setIsSending(false);
          }
        );
      } else {
        const response = await chatService.sendMessage(activeConversation._id, {
          type: "text",
          text: messageText,
        });
        if (response.data.success) {
          setMessages((prev) => [...prev, response.data.data]);
        }
        setIsSending(false);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("KhÃ´ng thá»ƒ gá»­i tin nháº¯n");
      setIsSending(false);
    }
  };

  const handleCloseConversation = async (conversationId: string) => {
    try {
      await chatService.closeConversation(conversationId);
      toast.success("ÄÃ£ Ä‘Ã³ng cuá»™c há»™i thoáº¡i");
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId ? { ...c, status: "closed" } : c
        )
      );
      if (activeConversation?._id === conversationId) {
        setActiveConversation(null);
      }
    } catch (error) {
      console.error("Failed to close conversation:", error);
      toast.error("KhÃ´ng thá»ƒ Ä‘Ã³ng cuá»™c há»™i thoáº¡i");
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

  return (
    <div className="min-h-screen bg-mono-50">
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - Conversation List */}
        <div className="w-80 bg-white border-r border-mono-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-mono-200">
            <h2 className="text-xl font-bold text-mono-900 mb-4">
              Chat Há»— Trá»£
            </h2>

            {/* Search */}
            <div className="relative mb-3">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-400" />
              <input
                type="text"
                placeholder="TÃ¬m kiáº¿m khÃ¡ch hÃ ng..."
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
                    ? "Táº¥t cáº£"
                    : status === "active"
                    ? "Äang má»Ÿ"
                    : "ÄÃ£ Ä‘Ã³ng"}
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
                <p>KhÃ´ng cÃ³ cuá»™c há»™i thoáº¡i nÃ o</p>
              </div>
            ) : (
              <div className="divide-y divide-mono-100">
                {filteredConversations.map((conv) => {
                  const customer = getCustomerInfo(conv);
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
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-mono-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-mono-900 truncate">
                              {customer?.name || "KhÃ¡ch hÃ ng"}
                            </p>
                            {conv.unreadCount && conv.unreadCount > 0 && (
                              <span className="ml-2 px-1.5 py-0.5 text-xs bg-mono-900 text-white rounded-full">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-mono-500 truncate">
                            {conv.lastMessage?.text || "Báº¯t Ä‘áº§u cuá»™c há»™i thoáº¡i"}
                          </p>
                          <p className="text-xs text-mono-400 mt-1">
                            {conv.lastMessage?.createdAt
                              ? new Date(
                                  conv.lastMessage.createdAt
                                ).toLocaleString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  day: "2-digit",
                                  month: "2-digit",
                                })
                              : ""}
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
                  Chá»n cuá»™c há»™i thoáº¡i
                </h3>
                <p className="text-mono-500">
                  Chá»n má»™t cuá»™c há»™i thoáº¡i tá»« danh sÃ¡ch bÃªn trÃ¡i Ä‘á»ƒ báº¯t Ä‘áº§u
                </p>
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
                      <h3 className="font-semibold text-mono-900">
                        {getCustomerInfo(activeConversation)?.name ||
                          "KhÃ¡ch hÃ ng"}
                      </h3>
                      <p className="text-sm text-mono-500">
                        {getCustomerInfo(activeConversation)?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeConversation.status === "active" && (
                      <button
                        onClick={() =>
                          handleCloseConversation(activeConversation._id)
                        }
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-mono-600 hover:text-mono-900 hover:bg-mono-100 rounded-lg transition-colors"
                      >
                        <FiCheckCircle className="w-4 h-4" />
                        ÄÃ³ng há»™i thoáº¡i
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
                        {msg.type === "text" && (
                          <p className="text-sm whitespace-pre-wrap">
                            {msg.text}
                          </p>
                        )}
                        {msg.type === "image" && msg.images && (
                          <div className="flex flex-wrap gap-2">
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

              {/* Input */}
              {activeConversation.status === "active" ? (
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
                      placeholder="Nháº­p tin nháº¯n..."
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
              ) : (
                <div className="p-4 border-t border-mono-200 bg-mono-100 text-center">
                  <p className="text-mono-500">Cuá»™c há»™i thoáº¡i nÃ y Ä‘Ã£ Ä‘Ã³ng</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChatPage;


