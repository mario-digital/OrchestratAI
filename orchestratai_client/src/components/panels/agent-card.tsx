"use client";

import { type JSX, memo } from "react";
import { AgentId, AgentStatus } from "@/lib/enums";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { AgentStatusBadge } from "./agent-status-badge";
import { getAgentBorderColor } from "@/lib/utils/agent-colors";

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
 * AgentIcon - Icon representing the agent type (Mockup v2.0)
 */
function AgentIcon({
  agentId,
}: {
  agentId: AgentId;
}): JSX.Element {
  const iconConfig = {
    [AgentId.ORCHESTRATOR]: {
      icon: "M8 9l3-3 3 3m-3-3v12M3 3h18M3 21h18", // Network/nodes icon
      className: "text-icon-orchestrator",
    },
    [AgentId.BILLING]: {
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", // Dollar sign
      className: "text-icon-billing",
    },
    [AgentId.TECHNICAL]: {
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z", // Settings/gear
      className: "text-icon-technical",
    },
    [AgentId.POLICY]: {
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", // Shield
      className: "text-icon-policy",
    },
  };

  const config = iconConfig[agentId];

  return (
    <svg
      className={`w-4 h-4 ${config.className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={config.icon}
      />
    </svg>
  );
}

/**
 * AgentCard - Displays individual agent information with status and metrics
 *
 * Features (Mockup v2.0):
 * - Color-coded left border based on agent type
 * - Agent icon on left side
 * - Agent name + status badge in header
 * - Model name below header
 * - ACTIVE state: Full green background with Strategy, Cache, Tokens, Cost
 * - IDLE state: Dark background with just Strategy (if available)
 * - React.memo optimization to prevent unnecessary re-renders
 */
export const AgentCard = memo(
  function AgentCard({
    agentId,
    name,
    status,
    model,
    strategy,
    metrics,
    cacheStatus: _cacheStatus,
  }: AgentCardProps): JSX.Element {
    const _borderColor = getAgentBorderColor(agentId);
    const isActive = status === AgentStatus.ACTIVE;

    // Get subtle border color for IDLE state
    const getBorderClass = (): string => {
      if (isActive) return "border-agent-active";

      // Subtle colored border for IDLE state
      switch (agentId) {
        case AgentId.ORCHESTRATOR:
          return "border-agent-card-border-cyan/30";
        case AgentId.BILLING:
          return "border-agent-card-border-green/30";
        case AgentId.TECHNICAL:
          return "border-agent-card-border-blue/30";
        case AgentId.POLICY:
          return "border-agent-card-border-purple/30";
        default:
          return "border-border-default";
      }
    };

    // Get agent name color using CSS tokens
    const getNameColorClass = (): string => {
      if (isActive) return "text-agent-active-text";

      // Use agent-specific color tokens for IDLE state
      switch (agentId) {
        case AgentId.ORCHESTRATOR:
          return "text-agent-card-text-cyan";
        case AgentId.BILLING:
          return "text-agent-card-text-green";
        case AgentId.TECHNICAL:
          return "text-agent-card-text-blue";
        case AgentId.POLICY:
          return "text-agent-card-text-purple";
        default:
          return "text-text-primary";
      }
    };

    return (
      <Card
        className={`transition-all duration-200 ${
          isActive
            ? "bg-agent-active"
            : "bg-bg-primary"
        } ${getBorderClass()}`}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <AgentIcon agentId={agentId} />
            <h3 className={`font-semibold uppercase text-xs tracking-wide ${getNameColorClass()}`}>
              {name}
            </h3>
          </div>
          <AgentStatusBadge
            status={status}
            agentName={name}
            isOnGreenBackground={isActive}
          />
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Model name */}
          <p className={`text-xs ${
            isActive ? "text-agent-active-label" : "text-text-secondary"
          }`}>
            {model}
          </p>

          {/* Show full metrics only when ACTIVE */}
          {isActive ? (
            <>
              {strategy && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-agent-active-label">Strategy:</span>
                  <span className="text-xs text-agent-active-value">{strategy}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-agent-active-label">Cache:</span>
                <span className="text-xs text-agent-active-value">Initialized</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-agent-active-label">Tokens:</span>
                <span className="text-xs text-agent-active-value">
                  {metrics.tokens.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-agent-active-label">Cost:</span>
                <span className="text-xs text-agent-active-cost">
                  ${metrics.cost.toFixed(4)}
                </span>
              </div>
            </>
          ) : (
            strategy && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-tertiary">Strategy:</span>
                <span className="text-xs text-text-secondary">
                  {strategy}
                </span>
              </div>
            )
          )}
        </CardContent>
      </Card>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if this specific agent's data changed
    return (
      prevProps.status === nextProps.status &&
      prevProps.metrics.tokens === nextProps.metrics.tokens &&
      prevProps.metrics.cost === nextProps.metrics.cost &&
      prevProps.metrics.latency === nextProps.metrics.latency &&
      prevProps.cacheStatus === nextProps.cacheStatus &&
      prevProps.strategy === nextProps.strategy &&
      prevProps.model === nextProps.model
    );
  }
);
