"use client";

import type { JSX } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AgentId } from "@/lib/enums";

/**
 * QueryAnalysisCard Props
 * Displays query intent detection and routing decision
 */
interface QueryAnalysisCardProps {
  /** Detected user intent (e.g., "technical_question", "greeting") */
  intent: string;
  /** Confidence score for the intent detection (0.0 to 1.0) */
  confidence: number;
  /** Agent selected to handle the query */
  targetAgent: AgentId;
  /** Optional reasoning for the routing decision */
  reasoning?: string;
}

/**
 * QueryAnalysisCard Component
 *
 * Displays the results of query analysis including:
 * - Detected intent classification
 * - Confidence score with visual progress bar
 * - Target agent with color-coded badge
 * - Optional reasoning explanation
 *
 * Usage:
 * ```tsx
 * <QueryAnalysisCard
 *   intent="technical_question"
 *   confidence={0.92}
 *   targetAgent={AgentId.CODING}
 *   reasoning="User is asking about implementation details"
 * />
 * ```
 */
/**
 * Get simple badge color for agent
 */
function getAgentBadgeClass(agent: AgentId): string {
  switch (agent) {
    case AgentId.ORCHESTRATOR:
      return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
    case AgentId.BILLING:
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case AgentId.TECHNICAL:
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case AgentId.POLICY:
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
}

export function QueryAnalysisCard({
  intent,
  confidence,
  targetAgent,
  reasoning,
}: QueryAnalysisCardProps): JSX.Element {
  const confidencePercent = Math.round(confidence * 100);
  const agentBadgeClass = getAgentBadgeClass(targetAgent);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text-primary">
          Query Analysis
        </h4>
      </div>

      <div className="space-y-2">
        {/* Intent */}
        <div>
          <span className="text-xs font-medium text-text-secondary">
            Detected Intent:
          </span>
          <p className="text-sm text-text-primary mt-1">{intent}</p>
        </div>

        {/* Confidence */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-text-secondary">
              Confidence:
            </span>
            <span className="text-xs text-text-secondary">
              {confidencePercent}%
            </span>
          </div>
          <Progress value={confidencePercent} className="h-2" />
        </div>

        {/* Target Agent */}
        <div>
          <span className="text-xs font-medium text-text-secondary">
            Target Agent:
          </span>
          <div className="mt-1">
            <Badge className={agentBadgeClass}>{targetAgent}</Badge>
          </div>
        </div>

        {/* Reasoning (optional) */}
        {reasoning && (
          <div>
            <span className="text-xs font-medium text-text-secondary">
              Reasoning:
            </span>
            <p className="text-xs text-text-tertiary mt-1 leading-relaxed">
              {reasoning}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
