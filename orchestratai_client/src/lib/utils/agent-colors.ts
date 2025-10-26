/**
 * Agent Color Mapping Utility
 *
 * Maps AgentId enum values to CSS custom property names for consistent
 * agent color theming throughout the application.
 *
 * @module agent-colors
 */

import { AgentId } from "@/lib/enums";

/**
 * Maps an AgentId to its corresponding CSS custom property for border colors
 *
 * @param agentId - The agent identifier
 * @returns CSS custom property name (e.g., "--color-agent-card-border-cyan")
 *
 * @example
 * ```tsx
 * const borderColor = getAgentBorderColor(AgentId.ORCHESTRATOR);
 * // Returns: "--color-agent-card-border-cyan"
 * ```
 */
export function getAgentBorderColor(agentId: AgentId): string {
  const colorMap: Record<AgentId, string> = {
    [AgentId.ORCHESTRATOR]: "--color-agent-card-border-cyan",
    [AgentId.BILLING]: "--color-agent-card-border-green",
    [AgentId.TECHNICAL]: "--color-agent-card-border-blue",
    [AgentId.POLICY]: "--color-agent-card-border-purple",
  };

  return colorMap[agentId];
}

/**
 * Maps an AgentId to its corresponding CSS custom property for text colors
 *
 * @param agentId - The agent identifier
 * @returns CSS custom property name (e.g., "--color-agent-card-text-cyan")
 *
 * @example
 * ```tsx
 * const textColor = getAgentTextColor(AgentId.BILLING);
 * // Returns: "--color-agent-card-text-green"
 * ```
 */
export function getAgentTextColor(agentId: AgentId): string {
  const colorMap: Record<AgentId, string> = {
    [AgentId.ORCHESTRATOR]: "--color-agent-card-text-cyan",
    [AgentId.BILLING]: "--color-agent-card-text-green",
    [AgentId.TECHNICAL]: "--color-agent-card-text-blue",
    [AgentId.POLICY]: "--color-agent-card-text-purple",
  };

  return colorMap[agentId];
}

/**
 * Maps an AgentId to its corresponding CSS custom property for accent colors
 *
 * @param agentId - The agent identifier
 * @returns CSS custom property name (e.g., "--color-agent-card-accent-cyan")
 *
 * @example
 * ```tsx
 * const accentColor = getAgentAccentColor(AgentId.TECHNICAL);
 * // Returns: "--color-agent-card-accent-blue"
 * ```
 */
export function getAgentAccentColor(agentId: AgentId): string {
  const colorMap: Record<AgentId, string> = {
    [AgentId.ORCHESTRATOR]: "--color-agent-card-accent-cyan",
    [AgentId.BILLING]: "--color-agent-card-accent-green",
    [AgentId.TECHNICAL]: "--color-agent-card-accent-blue",
    [AgentId.POLICY]: "--color-agent-card-accent-purple",
  };

  return colorMap[agentId];
}
