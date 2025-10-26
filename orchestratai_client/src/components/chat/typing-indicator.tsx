/**
 * TypingIndicator Component
 *
 * Animated loading indicator showing which agent is currently composing a response.
 * Displays agent name with bouncing dots animation.
 *
 * @module components/chat/typing-indicator
 */

"use client";

import { type JSX } from "react";
import { AgentId } from "@/lib/enums";
import { getAgentTextColor } from "@/lib/utils/agent-colors";

export interface TypingIndicatorProps {
  /** Human-readable agent name (e.g., "Billing Agent") */
  agentName: string;
  /** Agent identifier for color theming */
  agentId: AgentId;
}

/**
 * TypingIndicator - Shows animated typing state
 *
 * Features:
 * - Three bouncing dots with staggered animation
 * - Agent-specific color theming
 * - Accessible with ARIA live region (assertive)
 * - Uses design tokens for timing and colors
 */
export function TypingIndicator({
  agentName,
  agentId,
}: TypingIndicatorProps): JSX.Element {
  return (
    <div
      className="flex items-center gap-2 px-4 py-3"
      style={{ color: `var(${getAgentTextColor(agentId)})` }}
      aria-live="assertive"
      aria-label={`${agentName} is composing a response`}
    >
      {/* Agent Name */}
      <span className="text-sm font-medium">{agentName} is typing</span>

      {/* Animated Dots */}
      <div className="flex gap-1" aria-hidden="true">
        <div
          className="h-2 w-2 rounded-full bg-current animate-bounce"
          style={{
            animationDuration: "var(--duration-slow, 1s)",
            animationDelay: "0ms",
          }}
        />
        <div
          className="h-2 w-2 rounded-full bg-current animate-bounce"
          style={{
            animationDuration: "var(--duration-slow, 1s)",
            animationDelay: "160ms",
          }}
        />
        <div
          className="h-2 w-2 rounded-full bg-current animate-bounce"
          style={{
            animationDuration: "var(--duration-slow, 1s)",
            animationDelay: "320ms",
          }}
        />
      </div>
    </div>
  );
}
