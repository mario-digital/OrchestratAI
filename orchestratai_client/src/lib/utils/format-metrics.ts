/**
 * Utility functions for formatting agent metrics display values
 */

/**
 * Formats token count with comma separators and unit label
 * @param tokens - Number of tokens used
 * @returns Formatted string (e.g., "1,234 tokens")
 * @example
 * formatTokens(1234) // "1,234 tokens"
 * formatTokens(0)    // "0 tokens"
 */
export function formatTokens(tokens: number): string {
  return `${tokens.toLocaleString()} tokens`;
}

/**
 * Formats cost in USD with 4 decimal places
 * @param cost - Cost in dollars
 * @returns Formatted string (e.g., "$0.0023")
 * @example
 * formatCost(0.00234) // "$0.0023"
 * formatCost(0)       // "$0.0000"
 */
export function formatCost(cost: number): string {
  return `$${cost.toFixed(4)}`;
}

/**
 * Formats latency in milliseconds with comma separators
 * @param latency - Latency in milliseconds
 * @returns Formatted string (e.g., "1,234ms")
 * @example
 * formatLatency(1234) // "1,234ms"
 * formatLatency(50)   // "50ms"
 */
export function formatLatency(latency: number): string {
  return `${latency.toLocaleString()}ms`;
}
