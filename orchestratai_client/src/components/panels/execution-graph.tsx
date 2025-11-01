"use client";

import { type JSX } from "react";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ExecutionStep - Represents a single step in the execution flow
 */
export interface ExecutionStep {
  /** Step identifier */
  id: string;
  /** Display label (e.g., "AWS Bedrock Nova Lite") */
  label: string;
  /** Current status of the step */
  status: "complete" | "active" | "pending";
}

interface ExecutionGraphProps {
  /** Array of execution steps in order */
  steps: ExecutionStep[];
  /** Compact mode for header placement (hides title, reduces padding) */
  compact?: boolean;
}

/**
 * StepIndicator - Visual indicator for execution step status
 *
 * Mockup v2.0:
 * - Complete: Green circle with white checkmark
 * - Active: Cyan circle (pulsing)
 * - Pending: Gray circle
 */
function StepIndicator({
  status,
}: {
  status: "complete" | "active" | "pending";
}): JSX.Element {
  const statusConfig = {
    complete: {
      bg: "bg-execution-step-complete",
      icon: "text-execution-step-complete",
      showCheck: true,
      animate: false,
    },
    active: {
      bg: "bg-execution-step-active",
      icon: "text-white",
      showCheck: false,
      animate: true,
    },
    pending: {
      bg: "bg-execution-step-pending",
      icon: "text-gray-400",
      showCheck: false,
      animate: false,
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center",
        config.bg,
        config.animate && "animate-pulse"
      )}
    >
      {config.showCheck ? (
        <Check className={cn("w-3.5 h-3.5", config.icon)} strokeWidth={3} />
      ) : (
        <Circle className={cn("w-2 h-2", config.icon)} fill="currentColor" />
      )}
    </div>
  );
}

/**
 * Connector - Line connecting execution steps
 */
function Connector(): JSX.Element {
  return <div className="h-px w-8 bg-execution-connector" />;
}

/**
 * ExecutionGraph Component - Mockup v2.0
 *
 * Displays the execution flow as a vertical list (Agent Panel mode)
 * or horizontal flow (Header compact mode).
 *
 * Features:
 * - Green checkmarks for completed steps
 * - Green dots for active steps
 * - Gray circles for pending steps
 * - Model names in cyan
 * - List format for panel, horizontal for header
 *
 * Usage:
 * ```tsx
 * <ExecutionGraph
 *   steps={[
 *     { id: "input", label: "Input", status: "complete" },
 *     { id: "orchestrator", label: "AWS Bedrock Nova Lite", status: "complete" },
 *     { id: "billing", label: "OpenAI GPT-4o", status: "active" },
 *     { id: "response", label: "Response", status: "pending" },
 *   ]}
 *   compact={true}
 * />
 * ```
 */
export function ExecutionGraph({ steps, compact = false }: ExecutionGraphProps): JSX.Element {
  if (compact) {
    // Compact mode for header - horizontal layout
    return (
      <div className="flex items-start gap-2">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-start">
            {/* Step Column */}
            <div className="flex flex-col items-center gap-1">
              {/* Step Indicator */}
              <StepIndicator status={step.status} />

              {/* Step Label - Smaller in compact mode */}
              <span
                className={cn(
                  "text-xs text-center leading-tight",
                  step.status === "complete" && "text-text-primary",
                  step.status === "active" && "text-agent-card-text-cyan",
                  step.status === "pending" && "text-text-tertiary"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector (not after last step) */}
            {idx < steps.length - 1 && (
              <div className="flex items-center pt-3">
                <Connector />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Full mode for Agent Panel - vertical list
  return (
    <div className="bg-bg-primary border-t border-border-default p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <svg
          className="w-4 h-4 text-text-tertiary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l3-3 3 3m-3-3v12M3 3h18M3 21h18"
          />
        </svg>
        <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
          EXECUTION GRAPH
        </h3>
      </div>

      {/* Steps - List format */}
      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.id} className="flex items-start gap-2">
            {/* Step Indicator */}
            <div className="flex-shrink-0 mt-0.5">
              <StepIndicator status={step.status} />
            </div>

            {/* Step Info */}
            <div className="flex-1 min-w-0">
              {/* Step Label */}
              <div
                className={cn(
                  "text-xs font-medium",
                  step.status === "complete" && "text-text-primary",
                  step.status === "active" && "text-agent-card-text-cyan",
                  step.status === "pending" && "text-text-tertiary"
                )}
              >
                {step.id === "input" || step.id === "response" ? step.label : step.id.charAt(0).toUpperCase() + step.id.slice(1)}
              </div>
              {/* Model name in cyan */}
              {step.id !== "input" && step.id !== "response" && (
                <div className="text-xs text-agent-card-text-cyan">
                  {step.label}
                </div>
              )}
            </div>

            {/* Checkmark on the right for completed/active */}
            {(step.status === "complete" || step.status === "active") && (
              <Check className="w-4 h-4 text-execution-step-complete flex-shrink-0" strokeWidth={2.5} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
