"use client";

import { type JSX } from "react";
import { AgentId } from "@/lib/enums";
import { AgentCard } from "./agent-card";
import { useChatAgents } from "@/hooks/use-chat-agents";

/**
 * AgentPanel - Container for displaying all agent cards in the pipeline
 *
 * Displays agents in a vertical stack with:
 * - "Agent Pipeline" header
 * - Scrollable container for all agent cards
 * - Consistent spacing and layout
 *
 * Expected agent order: Orchestrator, Billing, Technical, Policy
 *
 * Now reads agent state directly from ChatProvider context.
 */
export function AgentPanel(): JSX.Element {
  const { agents } = useChatAgents();

  // Define agent order and display names
  const agentOrder = [
    { id: AgentId.ORCHESTRATOR, name: "Orchestrator" },
    { id: AgentId.BILLING, name: "Billing Agent" },
    { id: AgentId.TECHNICAL, name: "Technical Agent" },
    { id: AgentId.POLICY, name: "Policy Agent" },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold">Agent Pipeline</h2>
      <div className="flex flex-col gap-4">
        {agentOrder.map(({ id, name }) => {
          const agentState = agents[id];
          return (
            <AgentCard
              key={id}
              agentId={id}
              name={name}
              status={agentState.status}
              model={agentState.model}
              strategy={agentState.strategy}
              metrics={agentState.metrics}
              cacheStatus={agentState.cacheStatus}
            />
          );
        })}
      </div>
    </div>
  );
}
