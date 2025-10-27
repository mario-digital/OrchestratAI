/**
 * useChatAgents Hook - Access agent state from ChatProvider
 *
 * Provides convenient access to agent-specific state and operations
 * from the ChatProvider context.
 *
 * @module hooks/use-chat-agents
 */

"use client";

import { useContext } from "react";
import {
  ChatContext,
  type ChatContextValue,
} from "@/components/providers/chat-provider";

/**
 * useChatAgents - Hook for accessing agent state from ChatProvider
 *
 * Extracts agent-related state and methods from the ChatProvider context.
 * This hook should be used in components that need to display or update agent state.
 *
 * @returns Agent state and update methods
 * @throws Error if used outside ChatProvider
 *
 * @example
 * ```tsx
 * function AgentPanel() {
 *   const { agents, updateAgentStatus, incrementAgentMetrics } = useChatAgents();
 *
 *   return (
 *     <div>
 *       {Object.entries(agents).map(([id, state]) => (
 *         <AgentCard key={id} agentId={id} {...state} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useChatAgents(): {
  agents: ChatContextValue["agents"];
  updateAgentStatus: ChatContextValue["updateAgentStatus"];
  incrementAgentMetrics: ChatContextValue["incrementAgentMetrics"];
} {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChatAgents must be used within ChatProvider");
  }

  return {
    agents: context.agents,
    updateAgentStatus: context.updateAgentStatus,
    incrementAgentMetrics: context.incrementAgentMetrics,
  };
}
