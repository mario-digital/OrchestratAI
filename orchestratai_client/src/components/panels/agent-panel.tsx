"use client";

import { type JSX, useState, useEffect } from "react";
import { AgentId } from "@/lib/enums";
import { AgentCard } from "./agent-card";
import { AgentCardSkeleton } from "./agent-card-skeleton";
import { useChatAgents } from "@/hooks/use-chat-agents";
import { usePanelCollapse } from "@/components/layout/three-panel-layout";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * AgentPanel - Container for displaying all agent cards in the pipeline
 *
 * Mockup v2.0:
 * - Header with cyan icon + "AGENT PIPELINE" + collapse chevron
 * - Scrollable agent cards
 * - ExecutionGraph at bottom showing execution flow
 * - Collapse functionality integrated
 *
 * Expected agent order: Orchestrator, Billing, Technical, Policy
 */
export function AgentPanel(): JSX.Element {
  const { agents } = useChatAgents();
  const { isLeftPanelCollapsed, toggleLeftPanel } = usePanelCollapse();
  const [isLoading, setIsLoading] = useState(true);

  // Define agent order and display names
  const agentOrder = [
    { id: AgentId.ORCHESTRATOR, name: "Orchestrator" },
    { id: AgentId.BILLING, name: "Billing Agent" },
    { id: AgentId.TECHNICAL, name: "Technical Agent" },
    { id: AgentId.POLICY, name: "Policy Agent" },
  ];

  // Simulate initial loading state
  useEffect(() => {
    // Show skeleton briefly on initial mount (short delay to prevent flash)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100); // 100ms loading state - just enough to show skeleton without breaking tests

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col h-full bg-bg-secondary">
      {/* Header - Mockup v2.0: Cyan icon + title + collapse chevron */}
      <div className="p-4 border-b border-border-default flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="size-4 text-agent-card-text-cyan"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <h2 className="text-small font-semibold text-agent-card-text-cyan uppercase tracking-wide">
            Agent Pipeline
          </h2>
        </div>
        {/* Collapse chevron */}
        <button
          onClick={toggleLeftPanel}
          className="text-text-tertiary hover:text-text-primary transition-colors"
          aria-label={
            isLeftPanelCollapsed
              ? "Expand agent pipeline"
              : "Collapse agent pipeline"
          }
        >
          <svg
            className="size-4 transition-transform duration-normal"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{
              transform: isLeftPanelCollapsed
                ? "rotate(180deg)"
                : "rotate(0deg)",
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      </div>

      {/* Agent Cards */}
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-3">
          {isLoading ? (
            // Show skeleton loading state
            <>
              <AgentCardSkeleton />
              <AgentCardSkeleton />
              <AgentCardSkeleton />
              <AgentCardSkeleton />
            </>
          ) : (
            // Show actual agent cards
            agentOrder.map(({ id, name }) => {
              const agentState = agents[id];

              // Safety check: ensure agent state exists
              if (!agentState) {
                console.error(`Agent state not found for ${id}`, { agents });
                return null;
              }

              console.log(
                `AgentPanel rendering ${id} with status:`,
                agentState.status
              );

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
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
