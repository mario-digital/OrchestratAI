/**
 * ChatInterface Component
 *
 * Main chat interface that combines MessageList and InputArea with ChatProvider state.
 * Displays messages, handles user input, shows errors, and manages loading states.
 *
 * @module components/chat/chat-interface
 */

"use client";

import { useChatContext } from "@/components/providers/chat-provider";
import { MessageList } from "./message-list";
import { InputArea } from "./input-area";
import { Badge } from "@/components/ui/badge";
import type { JSX } from "react";

/**
 * ChatInterface - Complete chat UI with state management
 *
 * Features:
 * - Message display with auto-scroll
 * - User input with character limit
 * - Loading state with typing indicator inside message bubble
 * - Error display with retry option
 * - Real-time API integration
 *
 * @example
 * ```tsx
 * // Must be used within ChatProvider
 * <ChatProvider>
 *   <ChatInterface />
 * </ChatProvider>
 * ```
 */
export function ChatInterface(): JSX.Element {
  const {
    messages,
    isProcessing,
    isStreaming,
    streamingMessageId,
    useFallbackMode,
    sendStreamingMessage,
  } = useChatContext();

  const handleSendMessage = (message: string): void => {
    void sendStreamingMessage(message);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Message List with integrated typing indicator */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <MessageList
          messages={messages}
          isProcessing={isProcessing}
          streamingMessageId={streamingMessageId}
        />
      </div>

      {/* Fallback Mode Indicator */}
      {useFallbackMode && (
        <div className="flex gap-2 p-4 border-t border-input-border bg-surface-secondary/50 items-center">
          <Badge variant="outline" className="text-xs uppercase">
            Standard Mode
          </Badge>
          <span className="text-xs text-text-tertiary">
            Streaming unavailable
          </span>
        </div>
      )}

      {/* Input Area */}
      <InputArea
        onSendMessage={handleSendMessage}
        isProcessing={isProcessing || isStreaming}
      />
    </div>
  );
}
