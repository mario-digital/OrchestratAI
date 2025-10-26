/**
 * MessageList Component
 *
 * Scrollable container for chat messages with auto-scroll functionality.
 * Automatically scrolls to bottom when new messages are added.
 *
 * @module components/chat/message-list
 */

"use client";

import { useEffect, useRef, type JSX } from "react";
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
}

/**
 * MessageList - Scrollable message container with auto-scroll
 *
 * Features:
 * - Auto-scrolls to bottom when new messages arrive
 * - Only auto-scrolls if user is near bottom (prevents scroll hijacking)
 * - Smooth scroll behavior
 * - Accessible with ARIA labels and live regions
 */
export function MessageList({
  messages,
  isProcessing: _isProcessing = false,
}: MessageListProps): JSX.Element {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  /**
   * Checks if user is scrolled near the bottom of the container
   * Threshold: within 100px of bottom
   */
  const checkIfNearBottom = (): boolean => {
    if (!scrollAreaRef.current) return true;

    const container = scrollAreaRef.current.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement;

    if (!container) return true;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Consider "near bottom" if within 100px
    return distanceFromBottom < 100;
  };

  /**
   * Auto-scroll to bottom when messages change
   * Only scrolls if user is already near bottom
   */
  useEffect(() => {
    // Check position before scrolling
    const shouldScroll = checkIfNearBottom();
    if (shouldScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  return (
    <ScrollArea
      ref={scrollAreaRef}
      className="h-full w-full px-4"
      aria-label="Chat message history"
      aria-live="polite"
    >
      <div className="py-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-tertiary">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              role={message.role}
              content={message.content}
              agent={message.agent}
              confidence={message.confidence}
              timestamp={message.timestamp}
            />
          ))
        )}

        {/* Invisible anchor for auto-scroll */}
        <div ref={bottomRef} aria-hidden="true" />
      </div>
    </ScrollArea>
  );
}
