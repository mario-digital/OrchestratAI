/**
 * TypingIndicator Component
 *
 * Animated loading indicator showing which agent is currently composing a response.
 * Displays agent name with smooth bouncing dots animation using Framer Motion.
 *
 * @module components/chat/typing-indicator
 */

"use client";

import { type JSX } from "react";
import { motion } from "framer-motion";
import { AgentId } from "@/lib/enums";
import { getAgentTextColor } from "@/lib/utils/agent-colors";
import { bounceAnimation } from "@/lib/animations";

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
 * - Three bouncing dots with staggered animation (150ms delay between each)
 * - Smooth spring-based bounce using Framer Motion
 * - Agent-specific color theming
 * - Accessible with ARIA live region (assertive)
 * - GPU-accelerated animation (transform only)
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

      {/* Animated Dots with Framer Motion */}
      <div className="flex gap-1" aria-hidden="true">
        {["dot-1", "dot-2", "dot-3"].map((dotId, i) => {
          const delayMs = Math.round(i * 150);

          return (
            <motion.span
              key={dotId}
              data-testid="typing-dot"
              data-delay={`${delayMs}ms`}
              className="inline-block h-2 w-2 rounded-full bg-current"
              style={{
                animationDelay: `${delayMs}ms`,
                animationDuration: "var(--duration-slow)",
              }}
              variants={bounceAnimation}
              initial="initial"
              animate="animate"
              transition={{
                delay: i * 0.15, // Stagger each dot by 150ms
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
