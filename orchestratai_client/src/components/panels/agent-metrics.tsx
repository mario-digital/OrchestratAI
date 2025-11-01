"use client";

import { type JSX } from "react";
import { CheckCircle, MinusCircle, Circle } from "lucide-react";
import {
  formatTokens,
  formatCost,
  formatLatency,
} from "@/lib/utils/format-metrics";

export interface AgentMetricsProps {
  tokens: number;
  cost: number;
  latency: number;
  cacheStatus: "hit" | "miss" | "none";
  isActive?: boolean;
}

/**
 * CacheStatusIcon - Displays cache status with appropriate icon and color
 *
 * Uses semantic design tokens for consistent styling:
 * - hit: --color-cache-hit (green)
 * - miss: --color-cache-miss (yellow)
 * - none: --color-cache-none (gray)
 */
function CacheStatusIcon({
  status,
  isActive,
}: {
  status: "hit" | "miss" | "none";
  isActive?: boolean;
}): JSX.Element {
  const iconMap = {
    hit: (
      <CheckCircle
        className={`h-4 w-4 ${isActive ? "text-agent-active" : "text-cache-hit"}`}
      />
    ),
    miss: (
      <MinusCircle
        className={`h-4 w-4 ${isActive ? "text-agent-active-label" : "text-cache-miss"}`}
      />
    ),
    none: (
      <Circle
        className={`h-4 w-4 ${isActive ? "text-agent-active-label opacity-50" : "text-cache-none"}`}
      />
    ),
  };

  return iconMap[status];
}

/**
 * AgentMetrics - Displays real-time metrics for agent performance
 *
 * Features:
 * - Token usage with comma separators
 * - Cost in USD format (4 decimal places) - Gold color on active
 * - Latency in milliseconds with comma separators
 * - Cache status indicator (hit/miss/none)
 * - Responsive grid layout
 * - Mockup v2.0: Active state styling with white text on green background
 */
export function AgentMetrics({
  tokens,
  cost,
  latency,
  cacheStatus,
  isActive = false,
}: AgentMetricsProps): JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-2 py-2">
      <div className="flex flex-col">
        <span
          className={`text-xs ${isActive ? "text-agent-active-label" : "text-text-tertiary"}`}
        >
          Tokens
        </span>
        <span
          className={`text-sm font-medium ${isActive ? "text-agent-active-value" : "text-text-primary"}`}
        >
          {formatTokens(tokens)}
        </span>
      </div>
      <div className="flex flex-col">
        <span
          className={`text-xs ${isActive ? "text-agent-active-label" : "text-text-tertiary"}`}
        >
          Cost
        </span>
        <span
          className={`text-sm font-medium font-mono ${isActive ? "text-agent-active-cost" : "text-cost-text"}`}
        >
          {formatCost(cost)}
        </span>
      </div>
      <div className="flex flex-col">
        <span
          className={`text-xs ${isActive ? "text-agent-active-label" : "text-text-tertiary"}`}
        >
          Latency
        </span>
        <span
          className={`text-sm font-medium ${isActive ? "text-agent-active-value" : "text-text-primary"}`}
        >
          {formatLatency(latency)}
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span
          className={`text-xs ${isActive ? "text-agent-active-label" : "text-text-tertiary"}`}
        >
          Cache
        </span>
        <CacheStatusIcon status={cacheStatus} isActive={isActive} />
      </div>
    </div>
  );
}
