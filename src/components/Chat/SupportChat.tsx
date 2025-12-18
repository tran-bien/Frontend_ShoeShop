import React, { useState, useRef, useEffect, useCallback } from "react";
import { FiX, FiSend, FiLoader, FiHeadphones, FiTruck } from "react-icons/fi";
import { chatService } from "../../services/ChatService";
import type { ConversationMessage } from "../../types/chat";
import { useAuth } from "../../hooks/useAuth";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";

interface ChatConversation {
  _id: string;
  participants: Array<{
    userId: {
      _id: string;
      name: string;
      avatar?: { url: string };
      role: string;
    };
    role: string;
  }>;
  lastMessage?: {
    text: string;
    type: string;
    createdAt: string;
    senderId: string;
  };
}

/**
 * SupportChat - SIMPLIFIED
 * Mỗi user/shipper chỉ có 1 conversation duy nhất với staff/admin
 */
const SupportChat: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const token = localStorage.getItem("token");

  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<ChatConversation | null>(
    null
  );
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const conversationRef = useRef<ChatConversation | null>(null);

  // Keep conversationRef in sync
  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  // Check if user is shipper
  const isShipper = user?.role === "shipper";

  // Auto scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initialize Socket.IO when chat opens
  useEffect(() => {
    if (!isAuthenticated || !token || !isOpen) return;

    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5005";
    console.log("[SupportChat] Connecting to socket:", socketUrl);

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("[SupportChat] Socket connected:", newSocket.id);
      // Re-join room if conversation exists
      if (conversationRef.current) {
        newSocket.emit(
          "chat:join",
          conversationRef.current._id,
          (res: { success: boolean }) => {
            console.log(
              "[SupportChat] Re-joined room after reconnect:",
              res.success
            );
          }
        );
      }
    });

    newSocket.on("disconnect", () => {
      console.log("[SupportChat] Socket disconnected");
    });

    newSocket.on("connect_error", (error: Error) => {
      console.error("[SupportChat] Socket error:", error);
    });

    // Listen for new messages - USE REF to get latest conversation
    newSocket.on(
      "chat:newMessage",
      (data: { message: ConversationMessage; conversationId: string }) => {
        console.log("[SupportChat] Received chat:newMessage:", data);
        const currentConv = conversationRef.current;

        if (currentConv && data.conversationId === currentConv._id) {
          setMessages((prev) => {
            // Prevent duplicates
            const exists = prev.some((m) => m._id === data.message._id);
            if (exists) {
              console.log("[SupportChat] Message already exists, skipping");
              return prev;
            }
            console.log("[SupportChat] Adding new message to state");
            return [...prev, data.message];
          });
        }
      }
    );

    // Listen for notifications (backup channel)
    newSocket.on(
      "chat:notification",
      (data: { conversationId: string; fullMessage?: ConversationMessage }) => {
        console.log("[SupportChat] Received chat:notification:", data);
        const currentConv = conversationRef.current;

        if (
          currentConv &&
          data.conversationId === currentConv._id &&
          data.fullMessage
        ) {
          setMessages((prev) => {
            const exists = prev.some((m) => m._id === data.fullMessage!._id);
            if (exists) return prev;
            return [...prev, data.fullMessage!];
          });
        }
      }
    );

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
      console.log("[SupportChat] Disconnecting socket");
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token, isOpen]);

  // Load/Create conversation when chat opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      initializeConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isAuthenticated]);

  // Join socket room when conversation is ready
  useEffect(() => {
    if (!conversation || !socket?.connected) return;

    console.log("[SupportChat] Joining conversation room:", conversation._id);

    socket.emit(
      "chat:join",
      conversation._id,
      (response: { success: boolean; error?: string }) => {
        if (response.success) {
          console.log("[SupportChat] Joined room successfully");
        } else {
          console.error("[SupportChat] Failed to join room:", response.error);
        }
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?._id, socket?.connected]);

  /**
   * Initialize conversation - get existing or create new
   */
  const initializeConversation = async () => {
    try {
      setIsLoading(true);
      console.log("[SupportChat] Initializing conversation...");

      // Try to get existing conversations first
      const response = await chatService.getConversations({});

      if (
        response.data.success &&
        response.data.data?.conversations &&
        response.data.data.conversations.length > 0
      ) {
        // Use the first conversation (most recent)
        const existingConv = response.data.data.conversations[0];
        console.log(
          "[SupportChat] Found existing conversation:",
          existingConv._id
        );
        setConversation(existingConv as unknown as ChatConversation);
        await loadMessages(existingConv._id);
      } else {
        // Create new conversation with initial message
        console.log("[SupportChat] No existing conversation, creating new...");
        const createResponse = await chatService.createConversation({
          initialMessage: "Xin chào, tôi cần hỗ trợ.",
        });

        if (createResponse.data.success && createResponse.data.data) {
          const newConv = createResponse.data.data;
          console.log("[SupportChat] Created new conversation:", newConv._id);
          setConversation(newConv as unknown as ChatConversation);
          await loadMessages(newConv._id);
          toast.success("Đã kết nối với bộ phận hỗ trợ");
        }
      }
    } catch (error) {
      console.error("[SupportChat] Failed to initialize conversation:", error);
      toast.error("Không thể kết nối với bộ phận hỗ trợ");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      console.log("[SupportChat] Loading messages for:", conversationId);
      const response = await chatService.getMessages(conversationId, {
        limit: 50,
      });

      if (response.data.success && response.data.data) {
        setMessages(response.data.data.messages || []);
        console.log(
          "[SupportChat] Loaded",
          response.data.data.messages?.length,
          "messages"
        );
        // Mark as read
        await chatService.markAsRead(conversationId);
      }
    } catch (error) {
      console.error("[SupportChat] Failed to load messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !conversation || isSending) return;

    const messageText = inputMessage.trim();
    setInputMessage("");
    setIsSending(true);

    // Stop typing indicator
    if (socket) {
      socket.emit("chat:stopTyping", conversation._id);
    }

    try {
      if (socket?.connected) {
        console.log("[SupportChat] Sending message via socket...");

        socket.emit(
          "chat:sendMessage",
          {
            conversationId: conversation._id,
            type: "text",
            text: messageText,
          },
          (response: {
            success: boolean;
            message?: ConversationMessage;
            error?: string;
          }) => {
            console.log("[SupportChat] Send message response:", response);
            if (!response.success) {
              toast.error(response.error || "Không thể gửi tin nhắn");
            }
            setIsSending(false);
          }
        );
      } else {
        // HTTP fallback
        console.log(
          "[SupportChat] Socket not connected, using HTTP fallback..."
        );
        const response = await chatService.sendMessage(conversation._id, {
          type: "text",
          text: messageText,
        });

        if (response.data.success && response.data.data) {
          setMessages((prev) => [...prev, response.data.data!]);
        }
        setIsSending(false);
      }
    } catch (error) {
      console.error("[SupportChat] Failed to send message:", error);
      toast.error("Không thể gửi tin nhắn");
      setIsSending(false);
    }
  };

  const handleTyping = () => {
    if (socket && conversation) {
      socket.emit("chat:typing", conversation._id);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("chat:stopTyping", conversation._id);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-[420px] z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-xl border border-mono-200 overflow-hidden">
          {/* Header - Hiển thị khác nhau cho user và shipper */}
          <div className="bg-white border-b border-mono-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-mono-100 flex items-center justify-center">
                {isShipper ? (
                  <FiTruck className="w-5 h-5 text-blue-600" />
                ) : (
                  <FiHeadphones className="w-5 h-5 text-mono-700" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-mono-900">
                  {isShipper ? "Hỗ trợ Shipper" : "Hỗ trợ khách hàng"}
                </h3>
                <p className="text-xs text-mono-500">
                  {isShipper
                    ? "Liên hệ quản lý đơn hàng"
                    : "Chat trực tiếp với nhân viên"}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-mono-100 rounded-full transition-colors"
                aria-label="Đóng chat"
              >
                <FiX className="w-5 h-5 text-mono-600" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-mono-50">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <FiLoader className="w-6 h-6 animate-spin text-mono-400" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-mono-500 py-8">
                Bắt đầu cuộc trò chuyện
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.senderId._id === user?._id;
                return (
                  <div
                    key={msg._id}
                    className={`flex ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
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
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <span
                        className={`text-[10px] mt-1 block ${
                          isOwn ? "text-mono-300" : "text-mono-400"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
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
                disabled={isSending || isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isSending || isLoading}
                className="p-2.5 bg-mono-900 text-white rounded-full hover:bg-mono-800 disabled:bg-mono-300 disabled:cursor-not-allowed transition-colors"
                aria-label="Gửi tin nhắn"
              >
                {isSending ? (
                  <FiLoader className="w-4 h-4 animate-spin" />
                ) : (
                  <FiSend className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Button - Hiển thị khác nhau cho user và shipper */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-24 z-50 p-4 rounded-full shadow-lg transition-all duration-300 border hover:bg-mono-50 ${
            isShipper
              ? "bg-blue-50 text-blue-600 border-blue-200"
              : "bg-white text-mono-black border-mono-200"
          }`}
          aria-label={
            isShipper ? "Chat hỗ trợ shipper" : "Chat hỗ trợ khách hàng"
          }
        >
          {isShipper ? (
            <FiTruck className="w-6 h-6" />
          ) : (
            <FiHeadphones className="w-6 h-6" />
          )}
        </button>
      )}
    </>
  );
};

export default SupportChat;
