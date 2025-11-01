"use client";

import type { JSX } from "react";
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

export function QueryAnalysisCard({
  intent,
  confidence,
  targetAgent,
  reasoning,
}: QueryAnalysisCardProps): JSX.Element {
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
