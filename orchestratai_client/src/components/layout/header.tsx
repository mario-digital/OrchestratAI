"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ExecutionGraph,
  ExecutionStep,
} from "@/components/panels/execution-graph";
import { useChatAgents } from "@/hooks/use-chat-agents";
import { useChatContext } from "@/components/providers/chat-provider";
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
  const { isStreaming, messages } = useChatContext();

  // Check if we're at the beginning of processing (orchestrator not started yet)
  const isJustStarted =
    isStreaming && agents[AgentId.ORCHESTRATOR].status === AgentStatus.IDLE;

  // Determine which agent is actively responding (BILLING, TECHNICAL, or POLICY)
  const activeAgent =
    agents[AgentId.BILLING].status === AgentStatus.ACTIVE ||
    agents[AgentId.BILLING].status === AgentStatus.COMPLETE
      ? AgentId.BILLING
      : agents[AgentId.TECHNICAL].status === AgentStatus.ACTIVE ||
          agents[AgentId.TECHNICAL].status === AgentStatus.COMPLETE
        ? AgentId.TECHNICAL
        : agents[AgentId.POLICY].status === AgentStatus.ACTIVE ||
            agents[AgentId.POLICY].status === AgentStatus.COMPLETE
          ? AgentId.POLICY
          : AgentId.BILLING; // Default to billing for display

  // Response is complete when:
  // 1. Not currently streaming AND
  // 2. We have messages AND
  // 3. The last message is from the assistant
  const lastMessage = messages[messages.length - 1];
  const isResponseComplete = !isStreaming && lastMessage?.role === "assistant";

  // Build execution steps from agent states
  const executionSteps: ExecutionStep[] = [
    {
      id: "input",
      label: "Input",
      // Input is complete once streaming starts, pending if not streaming or just started
      status:
        isStreaming && !isJustStarted
          ? "complete"
          : isJustStarted
            ? "active"
            : "pending",
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
      id: "worker-agent",
      label: agents[activeAgent].model,
      status:
        agents[activeAgent].status === AgentStatus.ACTIVE
          ? "active"
          : agents[activeAgent].status === AgentStatus.COMPLETE
            ? "complete"
            : "pending",
    },
    {
      id: "response",
      label: "Response",
      status: isResponseComplete ? "complete" : "pending",
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
          <div className="w-10 h-10 rounded-md overflow-hidden bg-agent-card-border-cyan/20 flex items-center justify-center">
            <Image
              src="/OrchestratAI.png"
              alt="OrchestratAI logo"
              width={40}
              height={40}
              className="h-full w-full object-contain"
              priority
            />
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
