import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FiMessageSquare,
  FiX,
  FiSend,
  FiLoader,
  FiAlertCircle,
  FiInfo,
} from "react-icons/fi";
import { axiosInstance } from "../../utils/axiosIntance";
import type {
  ChatMessage,
  ChatApiResponse,
  ChatRequestBody,
} from "../../types/chat";

// Helper function để clean markdown từ response
const cleanMarkdown = (text: string): string => {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, "$1") // Remove ***bold italic***
    .replace(/\*\*(.+?)\*\*/g, "$1") // Remove **bold**
    .replace(/\*(.+?)\*/g, "$1") // Remove *italic*
    .replace(/^\s*[*-]\s+/gm, "• ") // Replace * - bullets with •
    .replace(/^\s*#{1,6}\s*/gm, "") // Remove # headers
    .replace(/`([^`]+)`/g, "$1") // Remove inline code
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .trim();
};

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTrained, setIsTrained] = useState<boolean | null>(null); // Track training status
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Initial greeting - Dynamic based on training status
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting =
        isTrained === false
          ? "⚠️ Xin chào! Tôi là AI assistant. Hiện tại tôi chưa được train nên có thể trả lời không chính xác. Bạn cần hỗ trợ gì?"
          : "Xin chào! Tôi là trợ lý AI của ShoeStore. Tôi có thể giúp bạn tìm kiếm sản phẩm, giải đáp thắc mắc về đơn hàng, hoặc tư vấn chọn size giày phù hợp. Bạn cần hỗ trợ gì?";

      setMessages([
        {
          id: "initial",
          role: "assistant",
          content: greeting,
          timestamp: new Date(),
          isWarning: isTrained === false,
        },
      ]);
    }
  }, [isOpen, messages.length, isTrained]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Chuẩn bị history cho BE (chỉ lấy 10 tin nhắn gần nhất, không tính initial)
      const historyForBE = messages
        .filter((m) => m.id !== "initial")
        .slice(-10)
        .map((m) => ({
          role: m.role,
          text: m.content,
        }));

      // Chỉ gửi sessionId nếu có giá trị (không gửi null)
      const requestBody: ChatRequestBody = {
        message: userMessage.content,
        history: historyForBE,
      };

      if (sessionId) {
        requestBody.sessionId = sessionId;
      }

      const response = await axiosInstance.post<ChatApiResponse>(
        "/api/v1/public/ai-chat",
        requestBody
      );

      // Lưu sessionId từ response
      if (response.data.data?.sessionId) {
        setSessionId(response.data.data.sessionId);
      }

      // Cập nhật training status
      if (response.data.data?.trained !== undefined) {
        setIsTrained(response.data.data.trained);
      }

      if (response.data.success && response.data.data) {
        const { data } = response.data;

        // Xác định loại message dựa trên response
        const isWarning =
          data.rateLimited ||
          data.quotaExhausted ||
          data.outOfScope ||
          data.noContext ||
          !data.trained; // Chưa train cũng là warning

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: cleanMarkdown(
            data.response || "Xin lỗi, tôi không thể xử lý yêu cầu này."
          ),
          timestamp: new Date(),
          isWarning,
          isError: false,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Handle unsuccessful response (success: false từ BE)
        const errorContent =
          response.data.data?.response ||
          response.data.message ||
          "Xin lỗi, tôi không thể xử lý yêu cầu này.";

        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: cleanMarkdown(errorContent),
          timestamp: new Date(),
          isWarning: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau hoặc liên hệ hotline 1900 1234 để được hỗ trợ.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${
          isOpen
            ? "bg-mono-700 text-white rotate-0"
            : "bg-mono-black text-white hover:bg-mono-800"
        }`}
        aria-label="Mở chat hỗ trợ"
      >
        {isOpen ? (
          <FiX className="w-6 h-6" />
        ) : (
          <FiMessageSquare className="w-6 h-6" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-xl border border-mono-200 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-mono-black text-white p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <FiMessageSquare className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Trợ lý AI</h3>
                <p className="text-xs text-mono-300">
                  {isTrained === false ? (
                    <span className="flex items-center gap-1 text-amber-300">
                      <FiInfo className="w-3 h-3" />
                      Chưa train kiến thức về ShoeShop
                    </span>
                  ) : isTrained === true ? (
                    "Đã sẵn sàng hỗ trợ bạn"
                  ) : (
                    "Luôn sẵn sàng hỗ trợ bạn"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-mono-50 scroll-smooth">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[90%] p-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-mono-black text-white rounded-br-sm"
                      : message.isError
                      ? "bg-red-50 text-red-800 border border-red-200 rounded-bl-sm"
                      : message.isWarning
                      ? "bg-amber-50 text-amber-800 border border-amber-200 rounded-bl-sm"
                      : "bg-white text-mono-800 border border-mono-200 rounded-bl-sm"
                  }`}
                >
                  {(message.isError || message.isWarning) &&
                    message.role === "assistant" && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <FiAlertCircle
                          className={`w-3.5 h-3.5 ${
                            message.isError ? "text-red-500" : "text-amber-500"
                          }`}
                        />
                        <span
                          className={`text-xs font-medium ${
                            message.isError ? "text-red-600" : "text-amber-600"
                          }`}
                        >
                          {message.isError ? "Lỗi hệ thống" : "Lưu ý"}
                        </span>
                      </div>
                    )}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">
                    {message.content}
                  </p>
                  <span
                    className={`text-[10px] mt-1.5 block ${
                      message.role === "user"
                        ? "text-mono-300"
                        : message.isError
                        ? "text-red-400"
                        : message.isWarning
                        ? "text-amber-400"
                        : "text-mono-400"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-bl-sm border border-mono-200">
                  <div className="flex items-center gap-2">
                    <FiLoader className="w-4 h-4 animate-spin text-mono-500" />
                    <span className="text-sm text-mono-500">
                      Đang trả lời...
                    </span>
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
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-4 py-2.5 bg-mono-50 border border-mono-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-mono-black focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="p-2.5 bg-mono-black text-white rounded-full hover:bg-mono-800 disabled:bg-mono-300 disabled:cursor-not-allowed transition-colors"
                aria-label="Gửi tin nhắn"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
