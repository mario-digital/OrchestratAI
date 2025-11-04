/**
 * ChatProvider - React Context provider for chat state management
 *
 * This component manages global chat state using React Context and useReducer.
 * It provides centralized state management for messages, processing status,
 * session management, and error handling.
 *
 * @module components/providers/chat-provider
 */

"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { sendMessage as sendMessageAPI } from "@/lib/api/chat";
import {
  AgentId,
  AgentStatus,
  MessageRole,
  RetrievalStrategy,
} from "@/lib/enums";
import {
  getUserFriendlyMessage,
  getStreamErrorMessage,
} from "@/lib/utils/error-messages";
import type { RetrievalLog } from "@/lib/types";
import { useStreaming } from "@/hooks/use-streaming";
import { StreamError } from "@/lib/errors";

// =============================================================================
// Types
// =============================================================================

/**
 * Message - Chat message data model for provider state
 *
 * Simplified version without sessionId (managed separately in state)
 */
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  agent?: AgentId;
  confidence?: number;
  timestamp: Date;
}

/**
 * AgentState - Individual agent state tracking
 *
 * Tracks status, metrics, and configuration for each agent
 */
export interface AgentState {
  status: AgentStatus;
  model: string;
  strategy: RetrievalStrategy | null;
  metrics: {
    tokens: number;
    cost: number;
    latency: number;
  };
  cacheStatus: "hit" | "miss" | "none";
}

/**
 * ChatState - Complete chat state managed by reducer
 */
export interface ChatState {
  messages: Message[];
  isProcessing: boolean;
  sessionId: string | null;
  error: Error | null;
  typingAgent: AgentId | null;
  failedMessage: string | null;
  agents: Record<AgentId, AgentState>;
  retrievalLogs: RetrievalLog[];
  isStreaming: boolean;
  streamingMessageId: string | null;
  useFallbackMode: boolean;
}

/**
 * ChatAction - Discriminated union of all reducer actions
 */
export type ChatAction =
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "REMOVE_MESSAGE"; payload: string }
  | { type: "SET_PROCESSING"; payload: boolean }
  | { type: "SET_ERROR"; payload: Error | null }
  | { type: "SET_SESSION_ID"; payload: string }
  | { type: "SET_TYPING_AGENT"; payload: AgentId | null }
  | { type: "SET_FAILED_MESSAGE"; payload: string | null }
  | { type: "CLEAR_MESSAGES" }
  | {
      type: "UPDATE_AGENT_STATUS";
      payload: { agent: AgentId; status: AgentStatus };
    }
  | {
      type: "INCREMENT_AGENT_METRICS";
      payload: {
        agent: AgentId;
        metrics: Partial<AgentState["metrics"]>;
        cacheStatus?: string;
      };
    }
  | { type: "SET_ALL_AGENT_STATUS"; payload: Record<AgentId, AgentStatus> }
  | { type: "ADD_LOG_ENTRIES"; payload: RetrievalLog[] }
  | { type: "CLEAR_LOGS" }
  | {
      type: "START_STREAMING";
      payload: { messageId: string; placeholderMessage: Message };
    }
  | {
      type: "UPDATE_STREAMING_MESSAGE";
      payload: { messageId: string; content: string };
    }
  | {
      type: "END_STREAMING";
      payload: {
        messageId: string;
        finalMessage: Message;
      };
    }
  | { type: "STREAMING_ERROR"; payload: { messageId: string; error: string } }
  | { type: "SET_FALLBACK_MODE"; payload: boolean };

/**
 * ChatContextValue - Complete context value with state and methods
 */
export interface ChatContextValue extends ChatState {
  sendMessage: (message: string) => Promise<void>;
  sendStreamingMessage: (message: string) => Promise<void>;
  retryMessage: () => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
  updateAgentStatus: (agent: AgentId, status: AgentStatus) => void;
  incrementAgentMetrics: (
    agent: AgentId,
    metrics: Partial<AgentState["metrics"]>,
    cacheStatus?: string
  ) => void;
  addLogEntries: (logs: RetrievalLog[]) => void;
  clearLogs: () => void;
}

/**
 * ChatProviderProps - Component props
 */
export interface ChatProviderProps {
  children: ReactNode;
  initialSessionId?: string;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * localStorage key for session ID persistence
 */
const SESSION_ID_KEY = "orchestratai_session_id";

/**
 * sessionStorage key for fallback mode persistence
 */
const FALLBACK_MODE_KEY = "orch_use_fallback";

/**
 * Duration in milliseconds for orchestrator routing animation
 *
 * This delay provides visual feedback to users that the orchestrator
 * is processing their message before routing to a specialist agent.
 */
const ORCHESTRATOR_ROUTING_ANIMATION_MS = 500;

/**
 * INITIAL_AGENTS - Default agent state initialization
 *
 * All agents start in IDLE status with zero metrics
 */
const INITIAL_AGENTS: Record<AgentId, AgentState> = {
  [AgentId.ORCHESTRATOR]: {
    status: AgentStatus.IDLE,
    model: "OpenAI GPT-4o",
    strategy: null,
    metrics: { tokens: 0, cost: 0, latency: 0 },
    cacheStatus: "none",
  },
  [AgentId.BILLING]: {
    status: AgentStatus.IDLE,
    model: "OpenAI GPT-4o",
    strategy: null,
    metrics: { tokens: 0, cost: 0, latency: 0 },
    cacheStatus: "none",
  },
  [AgentId.TECHNICAL]: {
    status: AgentStatus.IDLE,
    model: "OpenAI GPT-4o",
    strategy: null,
    metrics: { tokens: 0, cost: 0, latency: 0 },
    cacheStatus: "none",
  },
  [AgentId.POLICY]: {
    status: AgentStatus.IDLE,
    model: "OpenAI GPT-4o",
    strategy: null,
    metrics: { tokens: 0, cost: 0, latency: 0 },
    cacheStatus: "none",
  },
};

// =============================================================================
// Reducer
// =============================================================================

/**
 * chatReducer - Type-safe state reducer for chat operations
 *
 * Handles all state transitions including message updates, processing status,
 * errors, and session management.
 *
 * @param state - Current chat state
 * @param action - Action to process
 * @returns Updated chat state
 */
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null, // Auto-clear errors on successful message
      };

    case "REMOVE_MESSAGE":
      return {
        ...state,
        messages: state.messages.filter((msg) => msg.id !== action.payload),
      };

    case "SET_PROCESSING":
      return { ...state, isProcessing: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "SET_SESSION_ID":
      return { ...state, sessionId: action.payload };

    case "SET_TYPING_AGENT":
      return { ...state, typingAgent: action.payload };

    case "SET_FAILED_MESSAGE":
      return { ...state, failedMessage: action.payload };

    case "CLEAR_MESSAGES":
      return { ...state, messages: [], error: null };

    case "UPDATE_AGENT_STATUS": {
      const agent = action.payload.agent;
      if (!state.agents[agent]) {
        console.warn(`UPDATE_AGENT_STATUS: Unknown agent ID "${agent}"`);
        return state;
      }
      return {
        ...state,
        agents: {
          ...state.agents,
          [agent]: {
            ...state.agents[agent],
            status: action.payload.status,
          },
        },
      };
    }

    case "INCREMENT_AGENT_METRICS": {
      const agent = action.payload.agent;
      if (!state.agents[agent]) {
        console.warn(`INCREMENT_AGENT_METRICS: Unknown agent ID "${agent}"`);
        return state;
      }
      return {
        ...state,
        agents: {
          ...state.agents,
          [agent]: {
            ...state.agents[agent],
            metrics: {
              tokens:
                state.agents[agent].metrics.tokens +
                (action.payload.metrics.tokens || 0),
              cost:
                state.agents[agent].metrics.cost +
                (action.payload.metrics.cost || 0),
              latency:
                state.agents[agent].metrics.latency +
                (action.payload.metrics.latency || 0),
            },
            cacheStatus:
              (action.payload.cacheStatus as "hit" | "miss" | "none") ||
              state.agents[agent].cacheStatus,
          },
        },
      };
    }

    case "SET_ALL_AGENT_STATUS": {
      // Filter out unknown agent IDs and warn
      const validUpdates = Object.entries(action.payload).filter(
        ([agentId]) => {
          if (!state.agents[agentId as AgentId]) {
            console.warn(`SET_ALL_AGENT_STATUS: Unknown agent ID "${agentId}"`);
            return false;
          }
          return true;
        }
      );

      return {
        ...state,
        agents: {
          ...state.agents,
          ...Object.fromEntries(
            validUpdates.map(([agentId, status]) => [
              agentId,
              {
                ...state.agents[agentId as AgentId],
                status,
              },
            ])
          ),
        },
      };
    }

    case "ADD_LOG_ENTRIES":
      return {
        ...state,
        retrievalLogs: [...state.retrievalLogs, ...action.payload],
      };

    case "CLEAR_LOGS":
      return {
        ...state,
        retrievalLogs: [],
      };

    case "START_STREAMING":
      return {
        ...state,
        isStreaming: true,
        streamingMessageId: action.payload.messageId,
        messages: [...state.messages, action.payload.placeholderMessage],
      };

    case "UPDATE_STREAMING_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.messageId
            ? { ...msg, content: action.payload.content }
            : msg
        ),
      };

    case "END_STREAMING":
      return {
        ...state,
        isStreaming: false,
        streamingMessageId: null,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.messageId
            ? action.payload.finalMessage
            : msg
        ),
      };

    case "STREAMING_ERROR":
      return {
        ...state,
        isStreaming: false,
        streamingMessageId: null,
        error: new Error(action.payload.error),
        // Remove the placeholder message on error
        messages: state.messages.filter(
          (msg) => msg.id !== action.payload.messageId
        ),
      };

    case "SET_FALLBACK_MODE":
      // Persist to sessionStorage
      if (typeof window !== "undefined") {
        if (action.payload) {
          sessionStorage.setItem(FALLBACK_MODE_KEY, "true");
        } else {
          sessionStorage.removeItem(FALLBACK_MODE_KEY);
        }
      }
      return {
        ...state,
        useFallbackMode: action.payload,
      };

    default:
      return state;
  }
}

// =============================================================================
// Context
// =============================================================================

/**
 * ChatContext - React Context for chat state
 *
 * Initialized as null to enforce usage within provider
 */
export const ChatContext = createContext<ChatContextValue | null>(null);

// =============================================================================
// Provider Component
// =============================================================================

/**
 * ChatProvider - Provides chat state and operations to child components
 *
 * Manages:
 * - Message history (in-memory, lost on refresh)
 * - Session ID (persisted in localStorage)
 * - Processing state (loading indicators)
 * - Error state (API errors)
 * - Agent state and metrics
 *
 * @param props - Component props
 * @returns Provider component wrapping children
 *
 * @example
 * ```tsx
 * // Wrap app with provider
 * <ChatProvider>
 *   <ChatInterface />
 * </ChatProvider>
 *
 * // Access in child components
 * function ChatInterface() {
 *   const { messages, sendMessage, isProcessing } = useChatContext();
 *   // ...
 * }
 * ```
 */
export function ChatProvider({
  children,
  initialSessionId,
}: ChatProviderProps): React.JSX.Element {
  // Check sessionStorage for fallback mode preference
  const [state, dispatch] = useReducer(chatReducer, {
    messages: [],
    isProcessing: false,
    sessionId: initialSessionId || null,
    error: null,
    typingAgent: null,
    failedMessage: null,
    agents: INITIAL_AGENTS,
    retrievalLogs: [],
    isStreaming: false,
    streamingMessageId: null,
    useFallbackMode: false,
  });

  // Ref to track orchestrator animation timeout for cleanup
  const orchestratorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ref to store the latest sendMessage function
  const sendMessageRef = useRef<((message: string) => Promise<void>) | null>(
    null
  );

  // Hook for streaming functionality
  const { sendStreamingMessage: sendStream } = useStreaming();

  // Initialize sessionId from localStorage or generate new
  useEffect(() => {
    // Skip if initialSessionId was provided
    if (initialSessionId) {
      dispatch({ type: "SET_SESSION_ID", payload: initialSessionId });
      try {
        localStorage.setItem(SESSION_ID_KEY, initialSessionId);
      } catch {
        // Ignore localStorage errors (private browsing mode)
      }
      return;
    }

    // Load from localStorage or generate new
    try {
      const stored = localStorage.getItem(SESSION_ID_KEY);
      const sessionId = stored || crypto.randomUUID();

      dispatch({ type: "SET_SESSION_ID", payload: sessionId });

      // Save to localStorage if newly generated
      if (!stored) {
        localStorage.setItem(SESSION_ID_KEY, sessionId);
      }
    } catch {
      // Fallback if localStorage unavailable (Safari private mode)
      dispatch({ type: "SET_SESSION_ID", payload: crypto.randomUUID() });
    }
  }, [initialSessionId]);

  // Persist sessionId to localStorage when it changes
  useEffect(() => {
    if (state.sessionId) {
      try {
        localStorage.setItem(SESSION_ID_KEY, state.sessionId);
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [state.sessionId]);

  // Cleanup orchestrator timeout on unmount
  useEffect(() => {
    return () => {
      if (orchestratorTimeoutRef.current) {
        clearTimeout(orchestratorTimeoutRef.current);
      }
    };
  }, []);

  // Hydrate fallback mode preference after mount to avoid SSR mismatch
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedPreference = sessionStorage.getItem(FALLBACK_MODE_KEY);
    if (storedPreference === "true") {
      dispatch({ type: "SET_FALLBACK_MODE", payload: true });
    }
  }, []);

  // Persist fallback mode choice for subsequent navigations
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    sessionStorage.setItem(
      FALLBACK_MODE_KEY,
      state.useFallbackMode ? "true" : "false"
    );
  }, [state.useFallbackMode]);

  /**
   * sendMessage - Send user message and receive AI response
   *
   * Handles complete chat flow with optimistic updates:
   * 1. Add user message to state immediately (optimistic update)
   * 2. Set processing state
   * 3. Call chat API
   * 4. Add AI response to state
   * 5. Handle errors (remove optimistic message on failure)
   * 6. Clear processing state
   *
   * @param message - User message text
   */
  const sendMessage = useCallback(
    async (message: string): Promise<void> => {
      if (!state.sessionId) {
        const error = new Error("Session ID not initialized");
        dispatch({ type: "SET_ERROR", payload: error });
        return;
      }

      // Step 1: Optimistic update - add user message BEFORE API call
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: MessageRole.USER,
        content: message,
        timestamp: new Date(),
      };
      dispatch({ type: "ADD_MESSAGE", payload: userMessage });

      // Step 2: Set processing state and typing indicator
      dispatch({ type: "SET_PROCESSING", payload: true });
      dispatch({ type: "SET_TYPING_AGENT", payload: AgentId.ORCHESTRATOR });

      // Step 3: Orchestrator routing animation
      // Clear any existing timeout to prevent race conditions
      if (orchestratorTimeoutRef.current) {
        clearTimeout(orchestratorTimeoutRef.current);
      }

      dispatch({
        type: "UPDATE_AGENT_STATUS",
        payload: { agent: AgentId.ORCHESTRATOR, status: AgentStatus.ROUTING },
      });

      orchestratorTimeoutRef.current = setTimeout(() => {
        dispatch({
          type: "UPDATE_AGENT_STATUS",
          payload: { agent: AgentId.ORCHESTRATOR, status: AgentStatus.IDLE },
        });
        orchestratorTimeoutRef.current = null;
      }, ORCHESTRATOR_ROUTING_ANIMATION_MS);

      try {
        // Step 4: Call API
        const response = await sendMessageAPI(message, state.sessionId);

        // Step 5: Update agent statuses from API response
        if (response.agent_status) {
          dispatch({
            type: "SET_ALL_AGENT_STATUS",
            payload: response.agent_status,
          });
        }

        // Step 5.5: Add retrieval logs from API response
        if (response.logs && response.logs.length > 0) {
          dispatch({
            type: "ADD_LOG_ENTRIES",
            payload: response.logs,
          });
        }

        // Step 6: Increment metrics for the selected agent
        if (response.metrics) {
          dispatch({
            type: "INCREMENT_AGENT_METRICS",
            payload: {
              agent: response.agent,
              metrics: {
                tokens: response.metrics.tokensUsed,
                cost: response.metrics.cost,
                latency: response.metrics.latency,
              },
              cacheStatus: response.metrics.cache_status,
            },
          });
        }

        // Step 7: Add AI response
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: MessageRole.ASSISTANT,
          content: response.message,
          agent: response.agent,
          confidence: response.confidence,
          timestamp: new Date(),
        };
        dispatch({ type: "ADD_MESSAGE", payload: assistantMessage });
      } catch (error) {
        // Step 5: Remove optimistic user message on error
        dispatch({ type: "REMOVE_MESSAGE", payload: userMessage.id });
        dispatch({ type: "SET_ERROR", payload: error as Error });
        dispatch({ type: "SET_FAILED_MESSAGE", payload: message });

        // Show user-friendly error toast with retry button
        const errorMessage = getUserFriendlyMessage(error as Error);
        toast.error(errorMessage, {
          action: {
            label: "Retry",
            onClick: () => {
              // Use ref to avoid circular dependency
              void sendMessageRef.current?.(message);
            },
          },
        });
      } finally {
        // Step 6: Clear processing state and typing indicator
        dispatch({ type: "SET_PROCESSING", payload: false });
        dispatch({ type: "SET_TYPING_AGENT", payload: null });
      }
    },
    [state.sessionId]
  );

  // Update ref to latest sendMessage
  sendMessageRef.current = sendMessage;

  /**
   * retryMessage - Retry sending the last failed message
   *
   * Retrieves the failed message from state and resends it.
   * Clears error and failed message state on successful send.
   */
  const retryMessage = useCallback(async (): Promise<void> => {
    if (!state.failedMessage) {
      return;
    }

    const messageToRetry = state.failedMessage;

    // Clear error and failed message state
    dispatch({ type: "SET_ERROR", payload: null });
    dispatch({ type: "SET_FAILED_MESSAGE", payload: null });

    // Resend the message using ref to avoid circular dependency
    await sendMessageRef.current?.(messageToRetry);
  }, [state.failedMessage]);

  /**
   * clearMessages - Reset conversation state
   *
   * Clears all messages and errors, keeping the same session ID
   */
  const clearMessages = (): void => {
    dispatch({ type: "CLEAR_MESSAGES" });
  };

  /**
   * clearError - Reset error state
   *
   * Allows user to dismiss errors and retry
   */
  const clearError = (): void => {
    dispatch({ type: "SET_ERROR", payload: null });
  };

  /**
   * updateAgentStatus - Update the status of a specific agent
   *
   * @param agent - Agent ID to update
   * @param status - New status value
   */
  const updateAgentStatus = (agent: AgentId, status: AgentStatus): void => {
    dispatch({ type: "UPDATE_AGENT_STATUS", payload: { agent, status } });
  };

  /**
   * incrementAgentMetrics - Add to existing agent metrics (accumulation)
   *
   * @param agent - Agent ID to update
   * @param metrics - Metrics to add (partial update)
   * @param cacheStatus - Optional cache status update
   */
  const incrementAgentMetrics = (
    agent: AgentId,
    metrics: Partial<AgentState["metrics"]>,
    cacheStatus?: string
  ): void => {
    dispatch({
      type: "INCREMENT_AGENT_METRICS",
      payload: { agent, metrics, cacheStatus },
    });
  };

  /**
   * Add retrieval log entries to the state
   */
  const addLogEntries = (logs: RetrievalLog[]): void => {
    dispatch({ type: "ADD_LOG_ENTRIES", payload: logs });
  };

  /**
   * Clear all retrieval logs
   */
  const clearLogs = (): void => {
    dispatch({ type: "CLEAR_LOGS" });
  };

  /**
   * sendStreamingMessage - Send message with streaming response or fallback
   *
   * Uses Server-Sent Events (SSE) to stream response in real-time.
   * Falls back to non-streaming POST if SSE fails after retries.
   * Provides typewriter effect with progressive message updates.
   *
   * @param message - User message text
   */
  const sendStreamingMessage = useCallback(
    async (message: string): Promise<void> => {
      // Prevent concurrent streams
      if (state.isStreaming) {
        toast.error("Please wait for current response to complete");
        return;
      }

      if (!state.sessionId) {
        const error = new Error("Session ID not initialized");
        dispatch({ type: "SET_ERROR", payload: error });
        return;
      }

      // Check if fallback mode is active (SSE previously failed)
      if (state.useFallbackMode) {
        console.log("Using fallback mode (non-streaming)");
        return sendMessage(message);
      }

      // Generate unique IDs for messages
      const userMessageId = crypto.randomUUID();
      const assistantMessageId = crypto.randomUUID();

      // Create user message (optimistic update)
      const userMessage: Message = {
        id: userMessageId,
        role: MessageRole.USER,
        content: message,
        timestamp: new Date(),
      };

      // Create placeholder assistant message
      const placeholderMessage: Message = {
        id: assistantMessageId,
        role: MessageRole.ASSISTANT,
        content: "",
        timestamp: new Date(),
      };

      // Add user message to state
      dispatch({ type: "ADD_MESSAGE", payload: userMessage });

      // Set typing indicator (orchestrator starts routing)
      dispatch({ type: "SET_TYPING_AGENT", payload: AgentId.ORCHESTRATOR });

      // Orchestrator routing animation
      if (orchestratorTimeoutRef.current) {
        clearTimeout(orchestratorTimeoutRef.current);
      }

      dispatch({
        type: "UPDATE_AGENT_STATUS",
        payload: { agent: AgentId.ORCHESTRATOR, status: AgentStatus.ROUTING },
      });

      orchestratorTimeoutRef.current = setTimeout(() => {
        dispatch({
          type: "UPDATE_AGENT_STATUS",
          payload: { agent: AgentId.ORCHESTRATOR, status: AgentStatus.IDLE },
        });
        orchestratorTimeoutRef.current = null;
      }, ORCHESTRATOR_ROUTING_ANIMATION_MS);

      // Ensure we are in streaming mode (disable fallback indicator)
      dispatch({ type: "SET_FALLBACK_MODE", payload: false });

      // Start streaming
      dispatch({
        type: "START_STREAMING",
        payload: {
          messageId: assistantMessageId,
          placeholderMessage,
        },
      });

      try {
        // Track latest accumulated content so we can finalize without stale state reads
        let latestContent = "";

        await sendStream(message, state.sessionId, {
          // Update message content progressively
          onChunk: (accumulatedText) => {
            console.log("chunk", assistantMessageId, accumulatedText);
            latestContent = accumulatedText;
            dispatch({
              type: "UPDATE_STREAMING_MESSAGE",
              payload: {
                messageId: assistantMessageId,
                content: accumulatedText,
              },
            });
          },

          // Update agent status in real-time
          onAgentUpdate: (agent, status) => {
            dispatch({
              type: "UPDATE_AGENT_STATUS",
              payload: { agent, status },
            });
          },

          // Add log entries in real-time
          onLog: (log) => {
            dispatch({ type: "ADD_LOG_ENTRIES", payload: [log] });
          },

          // Finalize message on completion
          onComplete: (metadata, agentStatus) => {
            console.log("complete", assistantMessageId, metadata, agentStatus);
            // Extract agent and confidence from metadata (extended type in backend)
            const metadataAny = metadata as typeof metadata & {
              agent?: AgentId;
              confidence?: number;
            };

            const finalMessage: Message = {
              id: assistantMessageId,
              role: MessageRole.ASSISTANT,
              content: latestContent,
              agent: metadataAny.agent,
              confidence: metadataAny.confidence,
              timestamp: new Date(),
            };

            dispatch({
              type: "END_STREAMING",
              payload: {
                messageId: assistantMessageId,
                finalMessage,
              },
            });

            if (agentStatus) {
              dispatch({ type: "SET_ALL_AGENT_STATUS", payload: agentStatus });
            }

            // Streaming succeeded; ensure fallback mode stays disabled
            dispatch({ type: "SET_FALLBACK_MODE", payload: false });

            // Update agent metrics
            if (metadataAny.agent) {
              dispatch({
                type: "INCREMENT_AGENT_METRICS",
                payload: {
                  agent: metadataAny.agent,
                  metrics: {
                    tokens: metadata.tokensUsed,
                    cost: metadata.cost,
                    latency: metadata.latency,
                  },
                  cacheStatus: metadata.cache_status,
                },
              });
            }
          },

          // Handle errors with fallback logic
          onError: (error: StreamError) => {
            console.error("stream error", assistantMessageId, error);
            dispatch({
              type: "STREAMING_ERROR",
              payload: {
                messageId: assistantMessageId,
                error: error.message,
              },
            });

            // Remove optimistic user message and placeholder assistant message
            dispatch({ type: "REMOVE_MESSAGE", payload: userMessageId });
            dispatch({ type: "SET_FAILED_MESSAGE", payload: message });

            // Check if error is retryable
            if (!error.retryable) {
              // Enable fallback mode for this session
              console.warn(
                "Streaming failed permanently, enabling fallback mode"
              );
              dispatch({ type: "SET_FALLBACK_MODE", payload: true });

              // Show toast notification
              const errorMessage = getStreamErrorMessage(error.code);
              toast.error(errorMessage);

              // Retry with non-streaming (fallback)
              void sendMessage(message);
            } else {
              // Show retryable error with retry button
              const errorMessage = getUserFriendlyMessage(error);
              toast.error(errorMessage, {
                action: {
                  label: "Retry",
                  onClick: () => {
                    // Retry by calling sendStreamingMessage again
                    void sendStreamingMessage(message);
                  },
                },
              });
            }
          },
        });
      } catch (error) {
        // Handle any unexpected errors
        dispatch({
          type: "STREAMING_ERROR",
          payload: {
            messageId: assistantMessageId,
            error:
              error instanceof Error
                ? error.message
                : "Unknown streaming error",
          },
        });

        // If it's a StreamError, handle fallback
        if (error instanceof StreamError && !error.retryable) {
          console.warn("Streaming initiation failed, enabling fallback mode");
          dispatch({ type: "SET_FALLBACK_MODE", payload: true });

          // Show toast and retry with fallback
          const errorMessage = getStreamErrorMessage(error.code);
          toast.error(errorMessage);
          void sendMessage(message);
        }
      } finally {
        // Clear typing indicator
        dispatch({ type: "SET_TYPING_AGENT", payload: null });
      }
    },
    [
      state.isStreaming,
      state.sessionId,
      state.useFallbackMode,
      sendStream,
      sendMessage,
    ]
  );

  const value: ChatContextValue = {
    ...state,
    sendMessage,
    sendStreamingMessage,
    retryMessage,
    clearMessages,
    clearError,
    updateAgentStatus,
    incrementAgentMetrics,
    addLogEntries,
    clearLogs,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

// =============================================================================
// Custom Hook
// =============================================================================

/**
 * useChatContext - Type-safe hook for accessing chat context
 *
 * Provides type-safe access to chat state and operations.
 * Throws error if used outside ChatProvider.
 *
 * @returns Chat context value with state and methods
 * @throws Error if used outside ChatProvider
 *
 * @example
 * ```tsx
 * function ChatInterface() {
 *   const { messages, sendMessage, isProcessing } = useChatContext();
 *
 *   return (
 *     <div>
 *       {isProcessing && <Spinner />}
 *       {messages.map(msg => <MessageBubble key={msg.id} {...msg} />)}
 *       <InputArea onSend={sendMessage} disabled={isProcessing} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChatContext must be used within ChatProvider");
  }

  return context;
}
