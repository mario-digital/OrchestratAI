/**
 * useChatLogs - Hook for accessing retrieval logs from ChatProvider
 *
 * Provides convenient access to retrieval logs stored in the ChatProvider state.
 * Must be used within a ChatProvider context.
 *
 * @module hooks/use-chat-logs
 */

"use client";

import { useChatContext } from "@/components/providers/chat-provider";
import type { RetrievalLog } from "@/lib/types";

/**
 * Hook return type
 */
export interface UseChatLogsResult {
  /** Array of retrieval logs from the current session */
  logs: RetrievalLog[];
  /** Add new log entries */
  addLogs: (logs: RetrievalLog[]) => void;
  /** Clear all logs */
  clearLogs: () => void;
}

/**
 * useChatLogs Hook
 *
 * Provides access to retrieval logs from the ChatProvider context.
 * Logs are automatically populated when messages are sent and responses
 * are received from the chat API.
 *
 * @returns Object containing logs array and management functions
 * @throws Error if used outside ChatProvider
 *
 * @example
 * ```tsx
 * function RetrievalPanel() {
 *   const { logs } = useChatLogs();
 *
 *   return (
 *     <div>
 *       {logs.map(log => (
 *         <LogEntry key={log.id} {...log} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useChatLogs(): UseChatLogsResult {
  const context = useChatContext();

  return {
    logs: context.retrievalLogs,
    addLogs: context.addLogEntries,
    clearLogs: context.clearLogs,
  };
}
