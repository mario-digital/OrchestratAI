import { type JSX } from "react";
import type { Agent } from "@/lib/types";
import { AgentCard } from "./agent-card";

interface AgentPanelProps {
  agents: Agent[];
}

/**
 * AgentPanel - Container for displaying all agent cards in the pipeline
 *
 * Displays agents in a vertical stack with:
 * - "Agent Pipeline" header
 * - Scrollable container for all agent cards
 * - Consistent spacing and layout
 *
 * Expected agent order: Orchestrator, Billing, Technical, Policy
 */
export function AgentPanel({ agents }: AgentPanelProps): JSX.Element {
  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold">Agent Pipeline</h2>
      <div className="flex flex-col gap-4">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agentId={agent.id}
            name={agent.name}
            status={agent.status}
            model={agent.model}
            strategy={agent.strategy || null}
          />
        ))}
      </div>
    </div>
  );
}
