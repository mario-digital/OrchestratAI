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
}

/**
 * CacheStatusIcon - Displays cache status with appropriate icon and color
 */
function CacheStatusIcon({
  status,
}: {
  status: "hit" | "miss" | "none";
}): JSX.Element {
  const iconMap = {
    hit: <CheckCircle className="h-4 w-4 text-green-600" />,
    miss: <MinusCircle className="h-4 w-4 text-yellow-600" />,
    none: <Circle className="h-4 w-4 text-gray-400" />,
  };

  return iconMap[status];
}

/**
 * AgentMetrics - Displays real-time metrics for agent performance
 *
 * Features:
 * - Token usage with comma separators
 * - Cost in USD format (4 decimal places)
 * - Latency in milliseconds with comma separators
 * - Cache status indicator (hit/miss/none)
 * - Responsive grid layout
 */
export function AgentMetrics({
  tokens,
  cost,
  latency,
  cacheStatus,
}: AgentMetricsProps): JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-2 py-2">
      <div className="flex flex-col">
        <span className="text-xs text-text-tertiary">Tokens</span>
        <span className="text-sm font-medium text-text-primary">
          {formatTokens(tokens)}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-text-tertiary">Cost</span>
        <span className="text-sm font-medium text-text-primary">
          {formatCost(cost)}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-text-tertiary">Latency</span>
        <span className="text-sm font-medium text-text-primary">
          {formatLatency(latency)}
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs text-text-tertiary">Cache</span>
        <CacheStatusIcon status={cacheStatus} />
      </div>
    </div>
  );
}
