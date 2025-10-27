"use client";

import { type JSX } from "react";
import { AgentId, AgentStatus, RetrievalStrategy } from "@/lib/enums";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AgentStatusBadge } from "./agent-status-badge";
import { AgentMetrics } from "./agent-metrics";
import {
  getAgentBorderColor,
  getAgentAccentColor,
} from "@/lib/utils/agent-colors";

interface AgentCardProps {
  agentId: AgentId;
  name: string;
  status: AgentStatus;
  model: string;
  strategy: RetrievalStrategy | null;
  metrics: {
    tokens: number;
    cost: number;
    latency: number;
  };
  cacheStatus: "hit" | "miss" | "none";
}

/**
 * AgentIcon - Circular badge with first letter of agent name
 */
function AgentIcon({
  name,
  color,
}: {
  name: string;
  color: string;
}): JSX.Element {
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
      style={{ backgroundColor: `var(${color})` }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

/**
 * AgentCard - Displays individual agent information with status and metrics
 *
 * Features:
 * - Color-coded left border based on agent type
 * - Agent icon with first letter
 * - Real-time status badge
 * - Model name display
 * - Strategy badge (RAG/CAG/Hybrid)
 * - Hover effect for interactivity
 */
export function AgentCard({
  agentId,
  name,
  status,
  model,
  strategy,
  metrics,
  cacheStatus,
}: AgentCardProps): JSX.Element {
  const borderColor = getAgentBorderColor(agentId);
  const accentColor = getAgentAccentColor(agentId);

  // Strategy badge colors using design tokens
  const strategyColorMap: Record<RetrievalStrategy, string> = {
    [RetrievalStrategy.PURE_RAG]:
      "bg-agent-card-border-purple/20 text-agent-card-text-purple",
    [RetrievalStrategy.PURE_CAG]:
      "bg-agent-card-border-cyan/20 text-agent-card-text-cyan",
    [RetrievalStrategy.HYBRID_RAG_CAG]:
      "bg-agent-card-border-blue/20 text-agent-card-text-blue",
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow duration-200"
      style={{
        borderLeftColor: `var(${borderColor})`,
        borderLeftWidth: "4px",
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <AgentIcon name={name} color={accentColor} />
          <h3 className="font-semibold">{name}</h3>
        </div>
        <AgentStatusBadge status={status} agentName={name} />
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-text-secondary">{model}</p>
        {strategy && (
          <Badge variant="outline" className={strategyColorMap[strategy]}>
            {strategy}
          </Badge>
        )}
        <Separator />
        <AgentMetrics
          tokens={metrics.tokens}
          cost={metrics.cost}
          latency={metrics.latency}
          cacheStatus={cacheStatus}
        />
      </CardContent>
    </Card>
  );
}
