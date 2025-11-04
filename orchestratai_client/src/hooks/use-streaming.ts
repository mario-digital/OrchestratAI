/**
 * useStreaming Hook - Two-Step Secure Streaming with Auto-Reconnection
 *
 * Custom React hook for secure Server-Sent Events (SSE) streaming.
 *
 * Security Architecture:
 * 1. POST message to /api/chat/stream/initiate (secure - body not URL)
 * 2. Receive stream_id (contains no sensitive data)
 * 3. EventSource connects to /api/chat/stream/{stream_id}
 * 4. Message retrieved server-side (never in URLs or logs)
 *
 * Features:
 * - ✅ Complete security (messages never in URLs/logs)
 * - ✅ Native EventSource reconnection (automatic, browser-handled)
 * - ✅ Real-time message chunks, agent updates, and logs
 * - ✅ Proper cleanup on unmount
 * - ✅ No URL length limitations
 *
 * @module hooks/use-streaming
 */

"use client"; // Client-only hook (uses browser EventSource API)

import { useCallback, useRef, useState, useEffect } from "react";
import { AgentId, AgentStatus } from "@/lib/enums";
import type { RetrievalLog, ChatMetrics } from "@/lib/types";
import { StreamError, StreamErrorCode } from "@/lib/errors";

/**
 * Callback type definitions for streaming events
 */
type OnChunk = (accumulatedText: string) => void;
type OnAgentUpdate = (agent: AgentId, status: AgentStatus) => void;
type OnLog = (log: RetrievalLog) => void;
type OnComplete = (
  metadata: ChatMetrics,
  agentStatus?: Record<AgentId, AgentStatus>,
  logs?: RetrievalLog[]
) => void;
type OnError = (error: StreamError) => void;

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
 * Custom hook for secure SSE streaming with automatic reconnection
 *
 * Uses two-step approach:
 * 1. POST to initiate (message in body)
 * 2. EventSource with stream_id (native reconnection)
 *
 * @returns {UseStreamingReturn} Hook with sendStreamingMessage function and isStreaming state
 *
 * @example
 * ```tsx
 * const { sendStreamingMessage, isStreaming } = useStreaming();
 *
 * const handleSend = async () => {
 *   await sendStreamingMessage('Hello', 'session-id', {
 *     onChunk: (text) => console.log('Accumulated:', text),
 *     onAgentUpdate: (agent, status) => console.log('Agent:', agent, status),
 *     onLog: (log) => console.log('Log:', log),
 *     onComplete: (metadata) => console.log('Complete:', metadata),
 *     onError: (error) => console.error('Error:', error),
 *   });
 * };
 * ```
 */
/**
 * Constants for retry logic and timeout detection
 */
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000; // 1 second
const TIMEOUT_MS = 30000; // 30 seconds
const MAX_PARSE_ERRORS = 5;

const VALID_AGENT_IDS = new Set<AgentId>(Object.values(AgentId));
const VALID_AGENT_STATUSES = new Set<AgentStatus>(Object.values(AgentStatus));

const STREAM_ERROR_CODE_MAP: Record<string, StreamErrorCode> = {
  NETWORK_ERROR: StreamErrorCode.NETWORK_ERROR,
  SERVER_ERROR: StreamErrorCode.SERVER_ERROR,
  TIMEOUT: StreamErrorCode.TIMEOUT,
  PARSE_ERROR: StreamErrorCode.PARSE_ERROR,
  CONNECTION_CLOSED: StreamErrorCode.CONNECTION_CLOSED,
};

function normalizeAgentId(agent: unknown): AgentId | null {
  if (typeof agent !== "string") {
    return null;
  }

  const normalized = agent.trim().toLowerCase() as AgentId;
  return VALID_AGENT_IDS.has(normalized) ? normalized : null;
}

function normalizeAgentStatus(status: unknown): AgentStatus | null {
  if (typeof status !== "string") {
    return null;
  }

  const normalized = status.trim().toLowerCase() as AgentStatus;
  return VALID_AGENT_STATUSES.has(normalized) ? normalized : null;
}

function mapBackendErrorCode(code: unknown): StreamErrorCode {
  if (typeof code !== "string") {
    return StreamErrorCode.SERVER_ERROR;
  }

  const normalized = code.trim().toUpperCase();
  return STREAM_ERROR_CODE_MAP[normalized] ?? StreamErrorCode.SERVER_ERROR;
}

export function useStreaming(): UseStreamingReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const consecutiveParseErrorsRef = useRef(0);

  /**
   * Clear timeout
   */
  const clearStreamTimeout = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, []);

  /**
   * Cleanup function to close EventSource connection
   */
  const cleanup = useCallback(() => {
    clearStreamTimeout();
    if (eventSourceRef.current) {
      // Remove event listeners before closing to prevent error logs
      const eventSource = eventSourceRef.current;
      eventSource.onopen = null;
      eventSource.onerror = null;
      eventSource.close();
      eventSourceRef.current = null;
      setIsStreaming(false);
    }
  }, [clearStreamTimeout]);

  /**
   * Cleanup on component unmount
   */
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  /**
   * Reset timeout on each received event
   */
  const resetTimeout = useCallback(
    (callbacks: UseStreamingCallbacks) => {
      clearStreamTimeout();
      timeoutIdRef.current = setTimeout(() => {
        console.error("SSE stream timeout");
        const error = new StreamError(
          "Stream timeout - no data received for 30 seconds",
          StreamErrorCode.TIMEOUT,
          false
        );
        callbacks.onError?.(error);
        cleanup();
      }, TIMEOUT_MS);
    },
    [clearStreamTimeout, cleanup]
  );

  /**
   * Categorize error and create appropriate StreamError
   */
  const categorizeError = useCallback(
    (eventSource: EventSource, originalError?: Error): StreamError => {
      // Network offline
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return new StreamError(
          "Network connection lost",
          StreamErrorCode.NETWORK_ERROR,
          true,
          originalError
        );
      }

      // Server closed connection
      if (eventSource.readyState === EventSource.CLOSED) {
        return new StreamError(
          "Server closed connection",
          StreamErrorCode.CONNECTION_CLOSED,
          true,
          originalError
        );
      }

      // Unknown error
      return new StreamError(
        "Streaming connection failed",
        StreamErrorCode.SERVER_ERROR,
        false,
        originalError
      );
    },
    []
  );

  /**
   * Retry connection with exponential backoff
   * Note: This is defined as a ref callback to avoid circular dependencies
   */
  const retryConnectionRef = useRef<
    | ((
        message: string,
        sessionId: string,
        callbacks: UseStreamingCallbacks,
        attemptNumber: number
      ) => Promise<void>)
    | null
  >(null);

  /**
   * Send streaming message using two-step secure approach with retry logic
   *
   * Step 1: POST message to initiate endpoint (secure!)
   * Step 2: EventSource connects with stream_id (with retry and timeout!)
   */
  const sendStreamingMessage = useCallback(
    async (
      message: string,
      sessionId: string,
      callbacks: UseStreamingCallbacks
    ): Promise<void> => {
      // Close any existing connection
      cleanup();

      // Reset retry count at start of new message
      if (retryCountRef.current === 0) {
        consecutiveParseErrorsRef.current = 0;
      }

      try {
        // Step 1: POST to initiate stream (message in body - secure!)
        const initiateResponse = await fetch("/api/chat/stream/initiate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            session_id: sessionId,
          }),
        });

        if (!initiateResponse.ok) {
          const errorData = (await initiateResponse
            .json()
            .catch(() => ({}))) as { error?: string };
          throw new StreamError(
            errorData.error || `HTTP error! status: ${initiateResponse.status}`,
            StreamErrorCode.SERVER_ERROR,
            false
          );
        }

        const data = (await initiateResponse.json()) as { stream_id?: string };
        const { stream_id } = data;

        if (!stream_id) {
          throw new StreamError(
            "No stream_id received from server",
            StreamErrorCode.SERVER_ERROR,
            false
          );
        }

        // Step 2: EventSource with stream_id (with enhanced error handling!)
        const eventSource = new EventSource(`/api/chat/stream/${stream_id}`);
        eventSourceRef.current = eventSource;
        setIsStreaming(true);

        // Track accumulated message for chunk accumulation
        let accumulatedMessage = "";

        // Start timeout detection
        resetTimeout(callbacks);

        /**
         * Handle message_chunk events with malformed event protection
         * Accumulates chunks and calls onChunk with total accumulated text
         */
        eventSource.addEventListener("message_chunk", (e: MessageEvent) => {
          resetTimeout(callbacks); // Reset timeout on each event

          try {
            const data = JSON.parse(e.data as string) as { content: string };
            consecutiveParseErrorsRef.current = 0; // Reset on success
            accumulatedMessage += data.content;
            callbacks.onChunk(accumulatedMessage);
          } catch (error) {
            console.error(
              "Failed to parse message_chunk:",
              error,
              "Raw data:",
              e.data
            );

            consecutiveParseErrorsRef.current++;

            if (consecutiveParseErrorsRef.current >= MAX_PARSE_ERRORS) {
              console.error("Too many parse errors, closing stream");
              const streamError = new StreamError(
                "Too many malformed events received",
                StreamErrorCode.PARSE_ERROR,
                false,
                error instanceof Error ? error : undefined
              );
              callbacks.onError?.(streamError);
              cleanup();
            }

            // Continue stream (skip this event)
          }
        });

        /**
         * Handle agent_status events with error protection
         * Updates agent status in real-time
         */
        eventSource.addEventListener("agent_status", (e: MessageEvent) => {
          resetTimeout(callbacks); // Reset timeout on each event

          try {
            const rawData = JSON.parse(e.data as string) as {
              agent?: unknown;
              status?: unknown;
            };

            const agent = normalizeAgentId(rawData.agent);
            const status = normalizeAgentStatus(rawData.status);

            if (!agent || !status) {
              console.error("Invalid agent_status payload:", rawData);
              consecutiveParseErrorsRef.current++;

              if (consecutiveParseErrorsRef.current >= MAX_PARSE_ERRORS) {
                console.error(
                  "Too many invalid agent_status events, closing stream"
                );
                cleanup();
              }
              return;
            }

            consecutiveParseErrorsRef.current = 0; // Reset on success
            callbacks.onAgentUpdate(agent, status);
          } catch (error) {
            console.error(
              "Failed to parse agent_status:",
              error,
              "Raw data:",
              e.data
            );
            // Continue stream despite parsing error
          }
        });

        /**
         * Handle retrieval_log events with error protection
         * Processes log entries as they arrive
         */
        eventSource.addEventListener("retrieval_log", (e: MessageEvent) => {
          resetTimeout(callbacks); // Reset timeout on each event

          try {
            const data = JSON.parse(e.data as string) as RetrievalLog;
            consecutiveParseErrorsRef.current = 0; // Reset on success
            callbacks.onLog(data);
          } catch (error) {
            console.error(
              "Failed to parse retrieval_log:",
              error,
              "Raw data:",
              e.data
            );
            // Continue stream despite parsing error
          }
        });

        eventSource.addEventListener("stream_error", (e: MessageEvent) => {
          clearStreamTimeout();

          try {
            const data = JSON.parse(e.data as string) as {
              message?: string;
              code?: string;
              retryable?: boolean;
            };

            consecutiveParseErrorsRef.current = 0;

            const streamError = new StreamError(
              data.message ?? "Streaming failed",
              mapBackendErrorCode(data.code),
              data.retryable ?? false
            );

            callbacks.onError?.(streamError);
          } catch (error) {
            console.error(
              "Failed to parse stream_error event:",
              error,
              "Raw data:",
              e.data
            );

            const streamError = new StreamError(
              "Streaming failed",
              StreamErrorCode.SERVER_ERROR,
              false,
              error instanceof Error ? error : undefined
            );

            callbacks.onError?.(streamError);
          } finally {
            retryCountRef.current = 0;
            cleanup();
          }
        });

        /**
         * Handle done event
         * Finalizes stream with metadata and closes connection
         */
        eventSource.addEventListener("done", (e: MessageEvent) => {
          clearStreamTimeout(); // Clear timeout on completion

          try {
            const data = JSON.parse(e.data as string) as {
              metadata: ChatMetrics;
              agent_status?: Record<AgentId, AgentStatus>;
              logs?: RetrievalLog[];
            };
            console.log("[use-streaming] Done event received:", {
              hasLogs: !!data.logs,
              logsCount: data.logs?.length || 0,
              logs: data.logs,
            });
            callbacks.onComplete(data.metadata, data.agent_status, data.logs);
            retryCountRef.current = 0; // Reset retry count on success
          } catch (error) {
            console.error("Failed to parse done event:", error);
          } finally {
            // Always close connection on done event
            cleanup();
          }
        });

        /**
         * Handle connection errors with retry logic
         * Categorizes errors and retries if appropriate
         */
        eventSource.onerror = () => {
          // Clear timeout to prevent duplicate error handling
          clearStreamTimeout();

          // Check connection state to distinguish error types
          if (eventSource.readyState === EventSource.CONNECTING) {
            // Connection is reconnecting (browser auto-retry)
            console.log("SSE reconnecting... (browser automatic retry)");
            return; // Let browser handle reconnection
          }

          // Categorize the error
          const streamError = categorizeError(eventSource);

          // Check if retryable and under max retries
          if (streamError.retryable && retryCountRef.current < MAX_RETRIES) {
            console.warn(
              `SSE connection failed, retrying (${retryCountRef.current + 1}/${MAX_RETRIES})...`
            );
            retryCountRef.current++;
            cleanup();

            // Use retry function via ref
            if (retryConnectionRef.current) {
              void retryConnectionRef.current(
                message,
                sessionId,
                callbacks,
                retryCountRef.current - 1
              );
            }
          } else {
            // Not retryable or max retries exceeded
            console.error("SSE connection failed permanently");
            retryCountRef.current = 0; // Reset for next attempt
            callbacks.onError?.(streamError);
            cleanup();
          }
        };

        // Reset retry count on successful connection
        eventSource.onopen = () => {
          console.log("SSE connection established");
          retryCountRef.current = 0;
        };
      } catch (error) {
        // Handle initiation errors
        if (error instanceof StreamError) {
          callbacks.onError?.(error);
          setIsStreaming(false);
          throw error;
        }

        const streamError = new StreamError(
          error instanceof Error
            ? `Failed to initiate stream: ${error.message}`
            : "Failed to initiate stream: Unknown error",
          StreamErrorCode.SERVER_ERROR,
          false,
          error instanceof Error ? error : undefined
        );
        callbacks.onError?.(streamError);
        setIsStreaming(false);
        throw streamError;
      }
    },
    [cleanup, clearStreamTimeout, resetTimeout, categorizeError]
  );

  // Set up retry connection function ref to avoid circular dependency
  retryConnectionRef.current = async (
    message: string,
    sessionId: string,
    callbacks: UseStreamingCallbacks,
    attemptNumber: number
  ): Promise<void> => {
    if (attemptNumber >= MAX_RETRIES) {
      const error = new StreamError(
        "Max retry attempts exceeded",
        StreamErrorCode.NETWORK_ERROR,
        false
      );
      callbacks.onError?.(error);
      return;
    }

    const delay = Math.min(BASE_DELAY_MS * 2 ** attemptNumber, 4000);
    console.log(
      `Retry attempt ${attemptNumber + 1} of ${MAX_RETRIES} after ${delay}ms`
    );

    await new Promise((resolve) => setTimeout(resolve, delay));

    // Call sendStreamingMessage with incremented retry count
    return sendStreamingMessage(message, sessionId, callbacks);
  };

  return { sendStreamingMessage, isStreaming };
}
