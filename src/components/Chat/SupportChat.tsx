import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FiMessageCircle,
  FiX,
  FiSend,
  FiLoader,
  FiUser,
  FiHeadphones,
  FiImage,
} from "react-icons/fi";
import {
  chatService,
  ChatConversation,
  ChatMessage,
} from "../../services/ChatService";
import { useAuth } from "../../hooks/useAuth";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";

const SupportChat: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const token = localStorage.getItem("token");
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    if (isAuthenticated && token && isOpen) {
      const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5005";
      const newSocket = io(socketUrl, {
        auth: { token },
        transports: ["websocket", "polling"],
      });

      newSocket.on("connect", () => {
        console.log("[SupportChat] Socket connected");
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
          // Update conversation list with new last message
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
                  }
                : c
            )
          );
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

      newSocket.on("connect_error", (error: Error) => {
        console.error("[SupportChat] Socket error:", error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, token, isOpen, activeConversation, user?._id]);

  // Load conversations when chat opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadConversations();
    }
  }, [isOpen, isAuthenticated]);

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
              console.error("[SupportChat] Join error:", response.error);
            }
          }
        );
      }
    }
  }, [activeConversation, socket]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await chatService.getConversations({ status: "active" });
      if (response.data.success) {
        setConversations(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setIsLoading(true);
      const response = await chatService.getMessages(conversationId, {
        limit: 50,
      });
      if (response.data.success) {
        setMessages(response.data.data || []);
        // Mark as read
        await chatService.markAsRead(conversationId);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      setIsLoading(true);
      const response = await chatService.createConversation({
        initialMessage: "Xin chào, tôi cần hỗ trợ.",
      });
      if (response.data.success) {
        const newConversation = response.data.data;
        setConversations((prev) => [newConversation, ...prev]);
        setActiveConversation(newConversation);
        toast.success("Đã tạo cuộc hội thoại mới với bộ phận hỗ trợ");
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
      toast.error("Không thể tạo cuộc hội thoại");
    } finally {
      setIsLoading(false);
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

    // Stop typing indicator
    if (socket) {
      socket.emit("chat:stopTyping", activeConversation._id);
    }

    try {
      // Determine message type
      const messageType = hasImages ? "image" : "text";

      // Prefer Socket.IO for real-time
      if (socket?.connected) {
        socket.emit(
          "chat:sendMessage",
          {
            conversationId: activeConversation._id,
            type: messageType,
            text: messageText,
            images: imagesToSend,
          },
          (response: {
            success: boolean;
            message?: ChatMessage;
            error?: string;
          }) => {
            if (!response.success) {
              toast.error(response.error || "Không thể gửi tin nhắn");
            }
            setIsSending(false);
          }
        );
      } else {
        // HTTP fallback
        const response = await chatService.sendMessage(activeConversation._id, {
          type: messageType,
          text: messageText,
          images: hasImages
            ? imagesToSend.map((img) => ({ url: img, public_id: "" }))
            : undefined,
        });
        if (response.data.success) {
          setMessages((prev) => [...prev, response.data.data]);
        }
        setIsSending(false);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Không thể gửi tin nhắn");
      setIsSending(false);
    }
  };

  const handleTyping = () => {
    if (socket && activeConversation) {
      socket.emit("chat:typing", activeConversation._id);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-24 right-6 z-40 p-4 rounded-full shadow-lg transition-all duration-300 ${
          isOpen
            ? "bg-mono-600 text-white"
            : "bg-white text-mono-black border border-mono-200 hover:bg-mono-50"
        }`}
        aria-label="Chat hỗ trợ"
      >
        {isOpen ? (
          <FiX className="w-6 h-6" />
        ) : (
          <FiHeadphones className="w-6 h-6" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-44 right-6 z-40 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-xl border border-mono-200 overflow-hidden">
          {/* Header */}
          <div className="bg-mono-900 text-white p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <FiHeadphones className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Hỗ trợ khách hàng</h3>
                <p className="text-xs text-mono-300">
                  {activeConversation
                    ? "Đang trò chuyện"
                    : "Chat trực tiếp với nhân viên"}
                </p>
              </div>
              {activeConversation && (
                <button
                  onClick={() => setActiveConversation(null)}
                  className="text-mono-300 hover:text-white"
                >
                  ←
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          {!activeConversation ? (
            // Conversation List
            <div className="h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <FiLoader className="w-6 h-6 animate-spin text-mono-400" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <FiMessageCircle className="w-12 h-12 text-mono-300 mb-4" />
                  <p className="text-mono-600 mb-4">
                    Chưa có cuộc hội thoại nào
                  </p>
                  <button
                    onClick={createNewConversation}
                    className="px-4 py-2 bg-mono-black text-white rounded-lg hover:bg-mono-800 transition-colors"
                  >
                    Bắt đầu trò chuyện
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-mono-100">
                  {conversations.map((conv) => (
                    <button
                      key={conv._id}
                      onClick={() => setActiveConversation(conv)}
                      className="w-full p-4 text-left hover:bg-mono-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-mono-100 flex items-center justify-center">
                          <FiUser className="w-5 h-5 text-mono-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-mono-900 truncate">
                            Hỗ trợ #{conv._id.slice(-6)}
                          </p>
                          <p className="text-sm text-mono-500 truncate">
                            {conv.lastMessage?.text || "Bắt đầu cuộc hội thoại"}
                          </p>
                        </div>
                        {conv.unreadCount && conv.unreadCount > 0 && (
                          <span className="px-2 py-1 text-xs bg-mono-900 text-white rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={createNewConversation}
                    className="w-full p-4 text-center text-mono-600 hover:bg-mono-50 transition-colors"
                  >
                    + Tạo cuộc hội thoại mới
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Messages View
            <>
              <div className="h-64 overflow-y-auto p-4 space-y-3 bg-mono-50">
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
                          {msg.type === "text" && (
                            <p className="text-sm whitespace-pre-wrap">
                              {msg.text}
                            </p>
                          )}
                          {msg.type === "image" && msg.images && (
                            <div className="flex flex-wrap gap-2">
                              {msg.images.map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img.url}
                                  alt="Chat image"
                                  className="max-w-[150px] rounded-lg"
                                />
                              ))}
                            </div>
                          )}
                          <span
                            className={`text-[10px] mt-1 block ${
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
                          className="absolute -top-1 -right-1 w-5 h-5 bg-mono-1000 text-white rounded-full text-xs flex items-center justify-center hover:bg-mono-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-mono-200 bg-white">
                <div className="flex items-center gap-2">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files) {
                        const newImages: string[] = [];
                        const newPreviews: string[] = [];

                        const remainingSlots = 10 - selectedImages.length;
                        const filesToProcess = Math.min(
                          files.length,
                          remainingSlots
                        );

                        if (files.length > remainingSlots) {
                          toast.error(`Chỉ được gửi tối đa 10 ảnh`);
                        }

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
                      // Reset input
                      e.target.value = "";
                    }}
                  />

                  {/* Image upload button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSending || selectedImages.length >= 10}
                    className="p-2.5 text-mono-600 hover:text-mono-900 hover:bg-mono-100 rounded-full disabled:text-mono-300 disabled:cursor-not-allowed transition-colors"
                    aria-label="Đính kèm ảnh"
                    title="Đính kèm ảnh (tối đa 10 ảnh)"
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
            </>
          )}
        </div>
      )}
    </>
  );
};

export default SupportChat;



