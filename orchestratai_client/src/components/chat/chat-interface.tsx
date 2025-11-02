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
/**
 * Get human-readable agent name from AgentId
 */
function getAgentName(agentId: AgentId): string {
  switch (agentId) {
    case AgentId.ORCHESTRATOR:
      return "Orchestrator";
    case AgentId.BILLING:
      return "Billing Agent";
    case AgentId.TECHNICAL:
      return "Technical Agent";
    case AgentId.POLICY:
      return "Policy Agent";
    default:
      return "AI Assistant";
  }
}

export function ChatInterface(): JSX.Element {
  const {
    messages,
    isProcessing,
    isStreaming,
    typingAgent,
    sendStreamingMessage,
  } = useChatContext();

  const handleSendMessage = (message: string): void => {
    void sendStreamingMessage(message);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Message List */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isProcessing={isProcessing} />
      </div>

      {/* Typing Indicator */}
      {typingAgent && (
        <div className="px-4 py-2 border-t border-input-border">
          <TypingIndicator
            agentName={getAgentName(typingAgent)}
            agentId={typingAgent}
          />
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
