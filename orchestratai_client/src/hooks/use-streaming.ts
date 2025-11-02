/**
 * useStreaming Hook
 *
 * Custom React hook for connecting to Server-Sent Events (SSE) endpoint
 * and receiving real-time message chunks, agent updates, and logs progressively.
 *
 * Features:
 * - Establishes EventSource connection to /api/chat/stream endpoint
 * - Accumulates message chunks for progressive text display
 * - Handles agent status updates in real-time
 * - Processes retrieval logs as they arrive
 * - Manages connection lifecycle and cleanup
 * - Includes EventSource polyfill for older browsers
 *
 * @module hooks/use-streaming
 */

"use client"; // Client-only hook (uses browser EventSource API)

import { useCallback, useRef, useState, useEffect } from "react";
import type { AgentId, AgentStatus } from "@/lib/enums";
import type { RetrievalLog, ChatMetrics } from "@/lib/types";

// Import polyfill for older browsers (Safari < 12)
if (typeof window !== "undefined" && !window.EventSource) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("eventsource-polyfill");
}

/**
 * Callback type definitions for streaming events
 */
type OnChunk = (accumulatedText: string) => void;
type OnAgentUpdate = (agent: AgentId, status: AgentStatus) => void;
type OnLog = (log: RetrievalLog) => void;
type OnComplete = (metadata: ChatMetrics) => void;
type OnError = (error: Error) => void;

/**
 * Callbacks interface for streaming events
 */
interface UseStreamingCallbacks {
  /** Called with accumulated message text (not individual chunks) */
  onChunk: OnChunk;
  /** Called when agent status changes */
  onAgentUpdate: OnAgentUpdate;
  /** Called when a new log entry is received */
  onLog: OnLog;
  /** Called with final metadata when stream completes */
  onComplete: OnComplete;
  /** Optional error handler */
  onError?: OnError;
}

/**
 * Return type for useStreaming hook
 */
interface UseStreamingReturn {
  /** Function to initiate streaming message */
  sendStreamingMessage: (
    message: string,
    sessionId: string,
    callbacks: UseStreamingCallbacks
  ) => Promise<void>;
  /** Boolean indicating if currently streaming */
  isStreaming: boolean;
}

/**
 * Custom hook for managing SSE streaming connections
 *
 * @returns {UseStreamingReturn} Hook return value with sendStreamingMessage function and isStreaming state
 *
 * @example
 * ```tsx
 * const { sendStreamingMessage, isStreaming } = useStreaming();
 *
 * const handleSend = async () => {
 *   await sendStreamingMessage('Hello', 'session-id', {
 *     onChunk: (text) => console.log('Accumulated:', text),
 *     onAgentUpdate: (agent, status) => console.log('Agent update:', agent, status),
 *     onLog: (log) => console.log('Log:', log),
 *     onComplete: (metadata) => console.log('Complete:', metadata),
 *     onError: (error) => console.error('Error:', error),
 *   });
 * };
 * ```
 */
export function useStreaming(): UseStreamingReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  /**
   * Cleanup function to close EventSource connection
   */
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  /**
   * Cleanup on component unmount
   */
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  /**
   * Send streaming message and establish SSE connection
   */
  const sendStreamingMessage = useCallback(
    async (
      message: string,
      sessionId: string,
      callbacks: UseStreamingCallbacks
    ): Promise<void> => {
      // Close any existing connection
      cleanup();

      // Get API URL from environment
      const apiUrl = process.env["NEXT_PUBLIC_API_URL"];
      if (!apiUrl) {
        const error = new Error(
          "NEXT_PUBLIC_API_URL environment variable not set"
        );
        callbacks.onError?.(error);
        throw error;
      }

      // Construct SSE endpoint URL with query parameters
      // Using GET with query params for MVP simplicity (EventSource only supports GET)
      const encodedMessage = encodeURIComponent(message);
      const url = `${apiUrl}/api/chat/stream?message=${encodedMessage}&session_id=${sessionId}`;

      try {
        // Create EventSource instance
        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;
        setIsStreaming(true);

        // Track accumulated message for chunk accumulation
        let accumulatedMessage = "";

        /**
         * Handle message_chunk events
         * Accumulates chunks and calls onChunk with total accumulated text
         */
        eventSource.addEventListener("message_chunk", (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data as string) as { content: string };
            accumulatedMessage += data.content;
            callbacks.onChunk(accumulatedMessage);
          } catch (error) {
            console.error("Failed to parse message_chunk:", error);
            // Continue stream despite parsing error
          }
        });

        /**
         * Handle agent_status events
         * Updates agent status in real-time
         */
        eventSource.addEventListener("agent_status", (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data as string) as {
              agent: AgentId;
              status: AgentStatus;
            };
            callbacks.onAgentUpdate(data.agent, data.status);
          } catch (error) {
            console.error("Failed to parse agent_status:", error);
            // Continue stream despite parsing error
          }
        });

        /**
         * Handle retrieval_log events
         * Processes log entries as they arrive
         */
        eventSource.addEventListener("retrieval_log", (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data as string) as RetrievalLog;
            callbacks.onLog(data);
          } catch (error) {
            console.error("Failed to parse retrieval_log:", error);
            // Continue stream despite parsing error
          }
        });

        /**
         * Handle done event
         * Finalizes stream with metadata and closes connection
         */
        eventSource.addEventListener("done", (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data as string) as {
              metadata: ChatMetrics;
            };
            callbacks.onComplete(data.metadata);
          } catch (error) {
            console.error("Failed to parse done event:", error);
          } finally {
            // Always close connection on done event
            eventSource.close();
            setIsStreaming(false);
            eventSourceRef.current = null;
          }
        });

        /**
         * Handle connection errors
         * Distinguishes between reconnection attempts and permanent failures
         */
        eventSource.onerror = (error) => {
          // Check connection state to distinguish error types
          if (eventSource.readyState === EventSource.CONNECTING) {
            // Connection is reconnecting (normal behavior)
            console.log("SSE reconnecting...");
          } else if (eventSource.readyState === EventSource.CLOSED) {
            // Connection failed permanently
            console.error("SSE connection closed");
            callbacks.onError?.(new Error("SSE connection failed"));
            eventSource.close();
            setIsStreaming(false);
            eventSourceRef.current = null;
          } else {
            // Other error state
            console.error("SSE connection error:", error);
            callbacks.onError?.(new Error("SSE connection error"));
            eventSource.close();
            setIsStreaming(false);
            eventSourceRef.current = null;
          }
        };
      } catch (error) {
        // Handle EventSource creation errors
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        const err = new Error(`Failed to create EventSource: ${errorMessage}`);
        callbacks.onError?.(err);
        setIsStreaming(false);
        throw err;
      }
    },
    [cleanup]
  );

  return { sendStreamingMessage, isStreaming };
}
