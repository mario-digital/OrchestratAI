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
import { TypingIndicator } from "./typing-indicator";
import { AgentId } from "@/lib/enums";
import type { JSX } from "react";

/**
 * ChatInterface - Complete chat UI with state management
 *
 * Features:
 * - Message display with auto-scroll
 * - User input with character limit
 * - Loading state with typing indicator
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
  const { messages, isProcessing, error, sendMessage, clearError } =
    useChatContext();

  const handleSendMessage = (message: string): void => {
    void sendMessage(message);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium">
              Failed to send message
            </p>
            <p className="text-xs text-red-600 mt-1">{error.message}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-800 hover:text-red-900 text-sm font-medium ml-4"
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isProcessing={isProcessing} />
      </div>

      {/* Typing Indicator */}
      {isProcessing && (
        <div className="px-4 py-2 border-t border-input-border">
          <TypingIndicator
            agentName="AI Assistant"
            agentId={AgentId.ORCHESTRATOR}
          />
        </div>
      )}

      {/* Input Area */}
      <InputArea
        onSendMessage={handleSendMessage}
        isProcessing={isProcessing}
      />
    </div>
  );
}
