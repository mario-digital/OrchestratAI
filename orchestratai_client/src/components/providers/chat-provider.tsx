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
  type ReactNode,
} from "react";
import { sendMessage as sendMessageAPI } from "@/lib/api/chat";
import { AgentId, MessageRole } from "@/lib/enums";

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
 * ChatState - Complete chat state managed by reducer
 */
export interface ChatState {
  messages: Message[];
  isProcessing: boolean;
  sessionId: string | null;
  error: Error | null;
}

/**
 * ChatAction - Discriminated union of all reducer actions
 */
export type ChatAction =
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "SET_PROCESSING"; payload: boolean }
  | { type: "SET_ERROR"; payload: Error | null }
  | { type: "SET_SESSION_ID"; payload: string }
  | { type: "CLEAR_MESSAGES" };

/**
 * ChatContextValue - Complete context value with state and methods
 */
export interface ChatContextValue extends ChatState {
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

/**
 * ChatProviderProps - Component props
 */
export interface ChatProviderProps {
  children: ReactNode;
  initialSessionId?: string;
}

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

    case "SET_PROCESSING":
      return { ...state, isProcessing: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "SET_SESSION_ID":
      return { ...state, sessionId: action.payload };

    case "CLEAR_MESSAGES":
      return { ...state, messages: [], error: null };

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
const ChatContext = createContext<ChatContextValue | null>(null);

// =============================================================================
// Provider Component
// =============================================================================

/**
 * localStorage key for session ID persistence
 */
const SESSION_ID_KEY = "orchestratai_session_id";

/**
 * ChatProvider - Provides chat state and operations to child components
 *
 * Manages:
 * - Message history (in-memory, lost on refresh)
 * - Session ID (persisted in localStorage)
 * - Processing state (loading indicators)
 * - Error state (API errors)
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
  const [state, dispatch] = useReducer(chatReducer, {
    messages: [],
    isProcessing: false,
    sessionId: initialSessionId || null,
    error: null,
  });

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

  /**
   * sendMessage - Send user message and receive AI response
   *
   * Handles complete chat flow:
   * 1. Set processing state
   * 2. Add user message to state
   * 3. Call chat API
   * 4. Add AI response to state
   * 5. Handle errors
   * 6. Clear processing state
   *
   * @param message - User message text
   */
  const sendMessage = async (message: string): Promise<void> => {
    if (!state.sessionId) {
      const error = new Error("Session ID not initialized");
      dispatch({ type: "SET_ERROR", payload: error });
      return;
    }

    dispatch({ type: "SET_PROCESSING", payload: true });

    try {
      // Add user message immediately
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: MessageRole.USER,
        content: message,
        timestamp: new Date(),
      };
      dispatch({ type: "ADD_MESSAGE", payload: userMessage });

      // Call API
      const response = await sendMessageAPI(message, state.sessionId);

      // Add AI response
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
      dispatch({ type: "SET_ERROR", payload: error as Error });
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  };

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

  const value: ChatContextValue = {
    ...state,
    sendMessage,
    clearMessages,
    clearError,
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
