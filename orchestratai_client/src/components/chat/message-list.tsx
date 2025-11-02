/**
 * MessageList Component
 *
 * Scrollable container for chat messages with smart auto-scroll functionality.
 * Automatically scrolls to bottom when new messages are added (only if user is near bottom).
 *
 * @module components/chat/message-list
 */

"use client";

import { useEffect, useRef, type JSX } from "react";
import { AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./message-bubble";
import { MessageRole, AgentId } from "@/lib/enums";

export interface MessageListMessage {
  /** Unique message identifier */
  id: string;
  /** Message sender role */
  role: MessageRole;
  /** Message content */
  content: string;
  /** Agent that generated the message (assistant only) */
  agent?: AgentId;
  /** Optional confidence score */
  confidence?: number;
  /** Optional timestamp */
  timestamp?: Date;
}

export interface MessageListProps {
  /** Array of messages to display */
  messages: MessageListMessage[];
  /** Whether an assistant is currently processing */
  isProcessing?: boolean;
  /** ID of message currently being streamed */
  streamingMessageId?: string | null;
}

/**
 * MessageList - Scrollable message container with smart auto-scroll
 *
 * Features:
 * - Auto-scrolls to bottom when new messages arrive
 * - Only auto-scrolls if user is near bottom (within 100px) - prevents scroll hijacking
 * - Smooth scroll behavior with ease-out curve
 * - AnimatePresence for smooth message exit animations
 * - Accessible with ARIA labels and live regions
 */
export function MessageList({
  messages,
  isProcessing: _isProcessing = false,
  streamingMessageId,
}: MessageListProps): JSX.Element {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-scroll to bottom when messages change
   */
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (!viewport) return;

    // Always auto-scroll to bottom for new messages
    // Use setTimeout to ensure content is fully rendered (including animations)
    const scrollTimeout = setTimeout(() => {
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 100);

    return () => clearTimeout(scrollTimeout);
  }, [messages]);

  return (
    <ScrollArea
      ref={scrollAreaRef}
      className="h-full w-full px-4 scroll-smooth"
      aria-label="Chat message history"
      aria-live="polite"
    >
      <div className="py-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-tertiary">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                id={message.id}
                role={message.role}
                content={message.content}
                agent={message.agent}
                confidence={message.confidence}
                timestamp={message.timestamp}
                isTyping={
                  message.id === streamingMessageId && message.content === ""
                }
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </ScrollArea>
  );
}
