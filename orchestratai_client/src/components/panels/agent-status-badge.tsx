"use client";

import { type JSX } from "react";
import { AgentStatus } from "@/lib/enums";
import { Badge } from "@/components/ui/badge";

interface AgentStatusBadgeProps {
  status: AgentStatus;
  agentName: string;
  isOnGreenBackground?: boolean;
}

/**
 * AgentStatusBadge - Displays the current status of an agent with color coding
 *
 * Status color mapping:
 * - IDLE: Gray (secondary background) - Mockup v2.0: Darker slate
 * - ROUTING: Yellow/amber (warning state)
 * - ACTIVE: Cyan (with pulse animation) or dark green on green background
 * - COMPLETE: Green (success state)
 *
 * Mockup v2.0 Updates:
 * - IDLE badges now use darker slate-800 background
 * - ACTIVE badges on green agent cards use darker green variant
 */
export function AgentStatusBadge({
  status,
  agentName,
  isOnGreenBackground = false,
}: AgentStatusBadgeProps): JSX.Element {
  const statusConfig: Record<AgentStatus, { text: string; className: string }> =
    {
      [AgentStatus.IDLE]: {
        text: "IDLE",
        className:
          "bg-badge-idle-bg border-badge-idle-text text-badge-idle-text",
      },
      [AgentStatus.ROUTING]: {
        text: "ROUTING",
        className:
          "bg-status-badge-routing-bg border-status-badge-routing-text text-status-badge-routing-text",
      },
      [AgentStatus.ACTIVE]: {
        text: "ACTIVE",
        className: isOnGreenBackground
          ? "bg-badge-active-on-green-bg border-badge-active-on-green-text text-badge-active-on-green-text"
          : "bg-badge-active-bg border-badge-active-text text-badge-active-text",
      },
      [AgentStatus.COMPLETE]: {
        text: "COMPLETE",
        className:
          "bg-status-badge-complete-bg border-status-badge-complete-text text-status-badge-complete-text",
      },
    };

  const config = statusConfig[status];

  // Handle invalid status gracefully
  if (!config) {
    console.error("Invalid agent status:", {
      receivedStatus: status,
      receivedType: typeof status,
      receivedValue: JSON.stringify(status),
      availableKeys: Object.keys(statusConfig),
      agentName,
    });
    return (
      <Badge
        className="text-micro px-2 py-0.5 font-semibold uppercase rounded-full bg-bg-secondary text-text-secondary"
        aria-label={`${agentName} status: unknown`}
      >
        UNKNOWN
      </Badge>
    );
  }

  return (
    <Badge
      className={`text-micro px-2 py-0.5 font-semibold uppercase rounded-full ${config.className}`}
      aria-label={`${agentName} status: ${config.text}`}
    >
      {config.text}
    </Badge>
  );
}
