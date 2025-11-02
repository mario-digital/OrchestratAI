/**
 * MessageBubble Component
 *
 * Displays individual chat messages with role-based styling and agent attribution.
 * User messages appear right-aligned in blue, assistant messages left-aligned
 * with agent badges and optional confidence scores.
 *
 * Features fade-slide animation on message appearance for polished UX.
 *
 * @module components/chat/message-bubble
 */

"use client";

import { type JSX } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { MessageRole, AgentId } from "@/lib/enums";
import { getAgentTextColor } from "@/lib/utils/agent-colors";
import { fadeSlideUp, bounceAnimation } from "@/lib/animations";

export interface MessageBubbleProps {
  /** Message sender role (user or assistant) */
  role: MessageRole;
  /** Message text content */
  content: string;
  /** Agent that generated the message (assistant messages only) */
  agent?: AgentId;
  /** Optional confidence score (0.0 to 1.0) */
  confidence?: number;
  /** Optional timestamp for message */
  timestamp?: Date;
  /** Unique message ID for AnimatePresence key */
  id?: string;
  /** Whether this is a typing indicator message */
  isTyping?: boolean;
}

/**
 * MessageBubble - Individual message display component
 *
 * Renders chat messages with role-appropriate styling:
 * - User messages: right-aligned, blue background
 * - Assistant messages: left-aligned, dark background with agent badge
 *
 * Animates with fade-slide-up motion (300ms) for smooth appearance.
 * Uses Layer 3 component tokens for all styling.
 */
export function MessageBubble({
  role,
  content,
  agent,
  confidence,
  timestamp,
  id,
  isTyping = false,
}: MessageBubbleProps): JSX.Element {
  const isUser = role === MessageRole.USER;
  const isAssistant = role === MessageRole.ASSISTANT;

  const bubbleStyle = isUser
    ? { borderColor: "var(--color-message-user-border)" }
    : undefined;

  return (
    <motion.div
      key={id}
      variants={fadeSlideUp}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
      aria-label={`Message from ${isUser ? "user" : agent || "assistant"}`}
    >
      <div
        className={`
          max-w-[70%] rounded-lg p-4
          ${
            isUser
              ? "border bg-message-user-bg text-message-user-text"
              : "bg-message-assistant-bg text-message-assistant-text border border-message-assistant-border"
          }
        `}
        style={bubbleStyle}
      >
        {/* Agent Badge for Assistant Messages */}
        {isAssistant && agent && (
          <div className="mb-2">
            <Badge
              style={{
                backgroundColor: "transparent",
                borderColor: `var(${getAgentTextColor(agent)})`,
                color: `var(${getAgentTextColor(agent)})`,
              }}
              className="text-xs px-2 py-0.5 font-semibold uppercase rounded-full"
            >
              {agent}
            </Badge>
          </div>
        )}

        {/* Message Content or Typing Indicator */}
        {isTyping ? (
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-70">{agent} is typing</span>
            <div className="flex gap-1" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="inline-block h-2 w-2 rounded-full bg-current opacity-70"
                  variants={bounceAnimation}
                  initial="initial"
                  animate="animate"
                  transition={{
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words">{content}</p>
        )}

        {/* Confidence Score (Assistant Messages Only) */}
        {isAssistant && confidence !== undefined && (
          <div className="mt-2 text-sm opacity-70">
            {Math.round(confidence * 100)}% confident
          </div>
        )}

        {/* Optional Timestamp */}
        {timestamp && (
          <div className="mt-1 text-xs opacity-60">
            {timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
