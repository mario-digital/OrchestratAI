/**
 * MessageBubble Component
 *
 * Displays individual chat messages with role-based styling and agent attribution.
 * User messages appear right-aligned in blue, assistant messages left-aligned
 * with agent badges and optional confidence scores.
 *
 * @module components/chat/message-bubble
 */

"use client";

import { type JSX } from "react";
import { Badge } from "@/components/ui/badge";
import { MessageRole, AgentId } from "@/lib/enums";
import { getAgentTextColor } from "@/lib/utils/agent-colors";

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
}

/**
 * MessageBubble - Individual message display component
 *
 * Renders chat messages with role-appropriate styling:
 * - User messages: right-aligned, blue background
 * - Assistant messages: left-aligned, dark background with agent badge
 *
 * Uses Layer 3 component tokens for all styling.
 */
export function MessageBubble({
  role,
  content,
  agent,
  confidence,
  timestamp,
}: MessageBubbleProps): JSX.Element {
  const isUser = role === MessageRole.USER;
  const isAssistant = role === MessageRole.ASSISTANT;

  const bubbleStyle = isUser
    ? { borderColor: "var(--color-message-user-border)" }
    : undefined;

  return (
    <div
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

        {/* Message Content */}
        <p className="whitespace-pre-wrap break-words">{content}</p>

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
    </div>
  );
}
