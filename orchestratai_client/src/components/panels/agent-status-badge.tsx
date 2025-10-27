"use client";

import { type JSX } from "react";
import { AgentStatus } from "@/lib/enums";
import { Badge } from "@/components/ui/badge";

interface AgentStatusBadgeProps {
  status: AgentStatus;
  agentName: string;
}

/**
 * AgentStatusBadge - Displays the current status of an agent with color coding
 *
 * Status color mapping:
 * - IDLE: Gray (secondary background)
 * - ROUTING: Yellow/amber (warning state)
 * - ACTIVE: Cyan (with pulse animation)
 * - COMPLETE: Green (success state)
 */
export function AgentStatusBadge({
  status,
  agentName,
}: AgentStatusBadgeProps): JSX.Element {
  const statusConfig = {
    [AgentStatus.IDLE]: {
      text: "Idle",
      className: "bg-status-badge-idle-bg text-status-badge-idle-text",
    },
    [AgentStatus.ROUTING]: {
      text: "Routing",
      className: "bg-status-badge-routing-bg text-status-badge-routing-text",
    },
    [AgentStatus.ACTIVE]: {
      text: "Active",
      className:
        "bg-status-badge-active-bg text-status-badge-active-text animate-pulse",
    },
    [AgentStatus.COMPLETE]: {
      text: "Complete",
      className: "bg-status-badge-complete-bg text-status-badge-complete-text",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge
      className={`text-xs px-2 py-1 ${config.className}`}
      aria-label={`${agentName} status: ${config.text}`}
    >
      {config.text}
    </Badge>
  );
}
