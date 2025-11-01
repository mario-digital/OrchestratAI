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
  const confidencePercent = (confidence * 100).toFixed(0);

  // Parse reasoning to extract keywords
  // Format: "Keywords: word1, word2, word3" or just regular text
  const renderReasoning = (): JSX.Element | null => {
    if (!reasoning) return null;

    // Check if reasoning starts with "Keywords:"
    if (reasoning.toLowerCase().startsWith("keywords:")) {
      const keywordText = reasoning.substring("keywords:".length).trim();
      const keywords = keywordText.split(",").map((k) => k.trim());

      return (
        <div>
          <span className="text-xs text-text-tertiary">Reasoning:</span>
          <p className="text-text-secondary">
            <span className="text-text-tertiary">Keywords: </span>
            {keywords.map((keyword, idx) => (
              <span key={idx}>
                <span className="text-agent-card-text-cyan">{keyword}</span>
                {idx < keywords.length - 1 && ", "}
              </span>
            ))}
          </p>
        </div>
      );
    }

    // Regular reasoning text
    return (
      <div>
        <span className="text-xs text-text-tertiary">Reasoning:</span>
        <p className="text-text-secondary">{reasoning}</p>
      </div>
    );
  };

  return (
    <div className="space-y-2 text-sm">
      {/* Intent */}
      <div>
        <span className="text-xs text-text-tertiary">Intent:</span>
        <p className="text-text-primary">{intent}</p>
      </div>

      {/* Confidence */}
      <div>
        <span className="text-xs text-text-tertiary">Confidence:</span>
        <p className="text-text-primary">{confidence.toFixed(2)}</p>
      </div>

      {/* Target Agent */}
      <div>
        <span className="text-xs text-text-tertiary">Target:</span>
        <p className="text-agent-card-text-green">{targetAgent}</p>
      </div>

      {/* Reasoning (optional) - with keyword highlighting */}
      {renderReasoning()}
    </div>
  );
}
