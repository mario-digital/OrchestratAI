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
import type { AgentId, AgentStatus } from "@/lib/enums";
import type { RetrievalLog, ChatMetrics } from "@/lib/types";

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
   * Send streaming message using two-step secure approach
   *
   * Step 1: POST message to initiate endpoint (secure!)
   * Step 2: EventSource connects with stream_id (auto-reconnect!)
   */
  const sendStreamingMessage = useCallback(
    async (
      message: string,
      sessionId: string,
      callbacks: UseStreamingCallbacks
    ): Promise<void> => {
      // Close any existing connection
      cleanup();

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
          throw new Error(
            errorData.error || `HTTP error! status: ${initiateResponse.status}`
          );
        }

        const data = (await initiateResponse.json()) as { stream_id?: string };
        const { stream_id } = data;

        if (!stream_id) {
          throw new Error("No stream_id received from server");
        }

        // Step 2: EventSource with stream_id (native reconnection!)
        const eventSource = new EventSource(`/api/chat/stream/${stream_id}`);
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
         * EventSource automatically reconnects, we just log the state
         */
        eventSource.onerror = (error) => {
          // Check connection state to distinguish error types
          if (eventSource.readyState === EventSource.CONNECTING) {
            // Connection is reconnecting (normal behavior - automatic!)
            console.log("SSE reconnecting... (automatic)");
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
        // Handle initiation errors
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        const err = new Error(`Failed to initiate stream: ${errorMessage}`);
        callbacks.onError?.(err);
        setIsStreaming(false);
        throw err;
      }
    },
    [cleanup]
  );

  return { sendStreamingMessage, isStreaming };
}
