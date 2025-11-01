"use client";

import { Badge } from "@/components/ui/badge";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExecutionGraph, ExecutionStep } from "@/components/panels/execution-graph";
import { useChatAgents } from "@/hooks/use-chat-agents";
import { AgentId, AgentStatus } from "@/lib/enums";

export interface HeaderProps {
  className?: string;
}

/**
 * Header Component - Mockup v2.0
 *
 * Features:
 * - Logo icon (bot) in cyan
 * - Title: "Multi-Agent Customer Service System"
 * - Subtitle: "LangGraph Orchestrator + RAG/CAG Hybrid"
 * - ExecutionGraph in center (compact mode)
 * - ACTIVE status badge (green, top right)
 */
export function Header({ className }: HeaderProps = {}): React.JSX.Element {
  const { agents } = useChatAgents();

  // Build execution steps from agent states
  const executionSteps: ExecutionStep[] = [
    {
      id: "input",
      label: "Input",
      status: "complete",
    },
    {
      id: "orchestrator",
      label: agents[AgentId.ORCHESTRATOR].model,
      status:
        agents[AgentId.ORCHESTRATOR].status === AgentStatus.ACTIVE
          ? "active"
          : agents[AgentId.ORCHESTRATOR].status === AgentStatus.COMPLETE
          ? "complete"
          : "pending",
    },
    {
      id: "billing",
      label: agents[AgentId.BILLING].model,
      status:
        agents[AgentId.BILLING].status === AgentStatus.ACTIVE
          ? "active"
          : agents[AgentId.BILLING].status === AgentStatus.COMPLETE
          ? "complete"
          : "pending",
    },
    {
      id: "response",
      label: "Response",
      status: "pending",
    },
  ];

  return (
    <header
      className={cn(
        "bg-bg-secondary border-b border-border-default px-6 py-4",
        className
      )}
    >
      <div className="relative flex items-center justify-between gap-6">
        {/* Logo & Branding */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Logo Icon */}
          <div className="w-10 h-10 rounded-md bg-agent-card-border-cyan/20 flex items-center justify-center">
            <Bot className="w-6 h-6 text-agent-card-text-cyan" />
          </div>

          {/* Title & Subtitle */}
          <div>
            <h1 className="text-base font-semibold text-text-primary">
              Multi-Agent Customer Service System
            </h1>
            <p className="text-xs text-text-secondary">
              LangGraph Orchestrator + RAG/CAG Hybrid
            </p>
          </div>
        </div>

        {/* Execution Graph - Absolutely centered */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <ExecutionGraph steps={executionSteps} compact={true} />
        </div>

        {/* Status Badge */}
        <Badge className="bg-badge-active-bg text-badge-active-text border-0 text-xs px-3 py-1 font-medium flex-shrink-0">
          ACTIVE
        </Badge>
      </div>
    </header>
  );
}
