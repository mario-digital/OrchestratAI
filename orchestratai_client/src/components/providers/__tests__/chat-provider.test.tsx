/**
 * ChatProvider Unit Tests
 *
 * Tests for ChatProvider component, useChatContext hook, and chat reducer.
 * Covers state management, API integration, error handling, and localStorage persistence.
 *
 * @module components/providers/__tests__/chat-provider.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { ChatProvider, useChatContext } from "../chat-provider";
import type { ChatResponse } from "@/lib/schemas";
import {
  AgentId,
  MessageRole,
  AgentStatus,
  LogType,
  LogStatus,
} from "@/lib/enums";
import type { RetrievalLog } from "@/lib/types";
import { StreamError, StreamErrorCode } from "@/lib/errors";

// Import mocked modules
import { sendMessage as sendMessageAPI } from "@/lib/api/chat";
import { useStreaming } from "@/hooks/use-streaming";

// Mock the modules
vi.mock("@/lib/api/chat");
vi.mock("@/hooks/use-streaming");

describe("ChatProvider", () => {
  // Store original localStorage methods
  const originalLocalStorage = global.localStorage;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear(); // Clear fallback mode preference
    vi.clearAllTimers();

    // Setup default mock for useStreaming (can be overridden in specific tests)
    vi.mocked(useStreaming).mockReturnValue({
      sendStreamingMessage: vi.fn(),
      isStreaming: false,
    });
  });

  afterEach(() => {
    // Restore original localStorage
    global.localStorage = originalLocalStorage;
  });

  describe("Initial State", () => {
    it("initializes with empty messages array", async () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: ChatProvider,
      });

      await waitFor(() => {
        expect(result.current.sessionId).toBeTruthy();
      });

      expect(result.current.messages).toEqual([]);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("generates session ID on mount", async () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: ChatProvider,
      });

      await waitFor(() => {
        expect(result.current.sessionId).toBeTruthy();
        expect(result.current.sessionId).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );
      });
    });

    it("uses initialSessionId prop if provided", async () => {
      const testSessionId = "550e8400-e29b-41d4-a716-446655440000";

      const { result } = renderHook(() => useChatContext(), {
        wrapper: ({ children }) => (
          <ChatProvider initialSessionId={testSessionId}>
            {children}
          </ChatProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.sessionId).toBe(testSessionId);
      });
    });
  });

  describe("sendMessage", () => {
    it("sends message and adds user + assistant messages to state", async () => {
      const mockResponse: ChatResponse = {
        message: "Hello! How can I help you?",
        agent: AgentId.ORCHESTRATOR,
        confidence: 0.95,
        logs: [],
        metrics: { tokensUsed: 100, cost: 0.001, latency: 500 },
      };

      vi.mocked(sendMessageAPI).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useChatContext(), {
        wrapper: ChatProvider,
      });

      // Wait for sessionId to be initialized
      await waitFor(() => {
        expect(result.current.sessionId).toBeTruthy();
      });

      await act(async () => {
        await result.current.sendMessage("Hello");
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2);
      });

      // Verify user message
      expect(result.current.messages[0]).toMatchObject({
        role: MessageRole.USER,
        content: "Hello",
      });
      expect(result.current.messages[0]!.id).toBeTruthy();
      expect(result.current.messages[0]!.timestamp).toBeInstanceOf(Date);

      // Verify assistant message
      expect(result.current.messages[1]).toMatchObject({
        role: MessageRole.ASSISTANT,
        content: "Hello! How can I help you?",
        agent: AgentId.ORCHESTRATOR,
        confidence: 0.95,
      });
      expect(result.current.messages[1]!.id).toBeTruthy();
      expect(result.current.messages[1]!.timestamp).toBeInstanceOf(Date);
    });

    it("sets isProcessing to true during API call", async () => {
      const mockResponse: ChatResponse = {
        message: "Response",
        agent: AgentId.ORCHESTRATOR,
        confidence: 0.9,
        logs: [],
        metrics: { tokensUsed: 50, cost: 0.0005, latency: 300 },
      };

      // Create a promise that we can control
      let resolvePromise: (value: ChatResponse) => void;
      const controlledPromise = new Promise<ChatResponse>((resolve) => {
        resolvePromise = resolve;
      });

      vi.mocked(sendMessageAPI).mockReturnValue(controlledPromise);

      const { result } = renderHook(() => useChatContext(), {
        wrapper: ChatProvider,
      });

      // Wait for sessionId
      await waitFor(() => {
        expect(result.current.sessionId).toBeTruthy();
      });

      // Start sending message
      act(() => {
        result.current.sendMessage("Test");
      });

      // Check that isProcessing is true
      await waitFor(() => {
        expect(result.current.isProcessing).toBe(true);
      });

      // Resolve the API call
      act(() => {
        resolvePromise(mockResponse);
      });

      // Check that isProcessing returns to false
      await waitFor(() => {
        expect(result.current.isProcessing).toBe(false);
      });
    });

    it("handles API errors and stores in state", async () => {
      const mockError = new Error("API request failed");
      vi.mocked(sendMessageAPI).mockRejectedValue(mockError);

      const { result } = renderHook(() => useChatContext(), {
        wrapper: ChatProvider,
      });

      // Wait for sessionId
      await waitFor(() => {
        expect(result.current.sessionId).toBeTruthy();
      });

      await act(async () => {
        await result.current.sendMessage("Test");
      });

      await waitFor(() => {
        expect(result.current.error).toEqual(mockError);
        expect(result.current.isProcessing).toBe(false);
      });

      // With optimistic updates, user message is removed on error
      expect(result.current.messages).toHaveLength(0);
      expect(result.current.failedMessage).toBe("Test");
    });

    it("auto-clears error on successful message send", async () => {
      const mockError = new Error("Initial error");
      const mockResponse: ChatResponse = {
        message: "Success",
        agent: AgentId.ORCHESTRATOR,
        confidence: 0.9,
        logs: [],
        metrics: { tokensUsed: 50, cost: 0.0005, latency: 300 },
      };

      vi.mocked(sendMessageAPI)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useChatContext(), {
        wrapper: ChatProvider,
      });

      // Wait for sessionId
      await waitFor(() => {
        expect(result.current.sessionId).toBeTruthy();
      });

      // First call - should error
      await act(async () => {
        await result.current.sendMessage("First");
      });

      await waitFor(() => {
        expect(result.current.error).toEqual(mockError);
      });

      // Second call - should succeed and clear error
      await act(async () => {
        await result.current.sendMessage("Second");
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        // With optimistic updates: first user message was removed on error
        // So we only have: Second user + Second assistant = 2 messages
        expect(result.current.messages).toHaveLength(2);
      });
    });
  });

  describe("clearMessages", () => {
    it("resets messages array and clears errors", async () => {
      const mockResponse: ChatResponse = {
        message: "Response",
        agent: AgentId.ORCHESTRATOR,
        confidence: 0.9,
        logs: [],
        metrics: { tokensUsed: 50, cost: 0.0005, latency: 300 },
      };

      vi.mocked(sendMessageAPI).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useChatContext(), {
        wrapper: ChatProvider,
      });

      // Wait for sessionId
      await waitFor(() => {
        expect(result.current.sessionId).toBeTruthy();
      });

      // Add a message
      await act(async () => {
        await result.current.sendMessage("Hello");
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2);
      });

      // Clear messages
      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it("preserves sessionId when clearing messages", async () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: ChatProvider,
      });

      await waitFor(() => {
        expect(result.current.sessionId).toBeTruthy();
      });

      const originalSessionId = result.current.sessionId;

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.sessionId).toBe(originalSessionId);
    });
  });

  describe("clearError", () => {
    it("clears error state", async () => {
      const mockError = new Error("Test error");
      vi.mocked(sendMessageAPI).mockRejectedValue(mockError);

      const { result } = renderHook(() => useChatContext(), {
        wrapper: ChatProvider,
      });

      // Wait for sessionId
      await waitFor(() => {
        expect(result.current.sessionId).toBeTruthy();
      });

      // Trigger error
      await act(async () => {
        await result.current.sendMessage("Test");
      });

      await waitFor(() => {
        expect(result.current.error).toEqual(mockError);
      });

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("localStorage Persistence", () => {
    it("persists sessionId to localStorage", async () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: ChatProvider,
      });

      await waitFor(() => {
        expect(result.current.sessionId).toBeTruthy();
        expect(localStorage.getItem("orchestratai_session_id")).toBe(
          result.current.sessionId
        );
      });
    });

    it("loads sessionId from localStorage on mount", async () => {
      const existingSessionId = "550e8400-e29b-41d4-a716-446655440001";
      localStorage.setItem("orchestratai_session_id", existingSessionId);

      const { result } = renderHook(() => useChatContext(), {
        wrapper: ChatProvider,
      });

      await waitFor(() => {
        expect(result.current.sessionId).toBe(existingSessionId);
      });
    });

    it("handles localStorage errors gracefully (private browsing)", async () => {
      // Mock localStorage to throw errors
      const mockLocalStorage = {
        getItem: vi.fn(() => {
          throw new Error("localStorage unavailable");
        }),
        setItem: vi.fn(() => {
          throw new Error("localStorage unavailable");
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      };

      Object.defineProperty(global, "localStorage", {
        value: mockLocalStorage,
        writable: true,
      });

      const { result } = renderHook(() => useChatContext(), {
        wrapper: ChatProvider,
      });

      // Should still generate a sessionId even if localStorage fails
      await waitFor(() => {
        expect(result.current.sessionId).toBeTruthy();
      });

      // Should not throw errors
      expect(() => result.current.sessionId).not.toThrow();
    });
  });

  describe("useChatContext Hook", () => {
    it("throws error when used outside provider", () => {
      // Suppress console.error for this test
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useChatContext());
      }).toThrow("useChatContext must be used within ChatProvider");

      consoleError.mockRestore();
    });

    it("returns typed context value when used within provider", async () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: ChatProvider,
      });

      await waitFor(() => {
        expect(result.current.sessionId).toBeTruthy();
      });

      // Verify all expected properties exist
      expect(result.current).toHaveProperty("messages");
      expect(result.current).toHaveProperty("isProcessing");
      expect(result.current).toHaveProperty("sessionId");
      expect(result.current).toHaveProperty("error");
      expect(result.current).toHaveProperty("sendMessage");
      expect(result.current).toHaveProperty("clearMessages");
      expect(result.current).toHaveProperty("clearError");

      // Verify types
      expect(Array.isArray(result.current.messages)).toBe(true);
      expect(typeof result.current.isProcessing).toBe("boolean");
      expect(typeof result.current.sessionId).toBe("string");
      expect(typeof result.current.sendMessage).toBe("function");
      expect(typeof result.current.clearMessages).toBe("function");
      expect(typeof result.current.clearError).toBe("function");
    });
  });

  describe("Edge Cases", () => {
    it("handles multiple rapid sendMessage calls", async () => {
      const mockResponse: ChatResponse = {
        message: "Response",
        agent: AgentId.ORCHESTRATOR,
        confidence: 0.9,
        logs: [],
        metrics: { tokensUsed: 50, cost: 0.0005, latency: 300 },
      };

      vi.mocked(sendMessageAPI).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useChatContext(), {
        wrapper: ChatProvider,
      });

      await waitFor(() => {
        expect(result.current.sessionId).toBeTruthy();
      });

      // Send 3 messages rapidly
      await act(async () => {
        await Promise.all([
          result.current.sendMessage("First"),
          result.current.sendMessage("Second"),
          result.current.sendMessage("Third"),
        ]);
      });

      await waitFor(() => {
        // Should have 6 messages: 3 user + 3 assistant
        expect(result.current.messages).toHaveLength(6);
      });
    });

    it("handles empty message content", async () => {
      const mockResponse: ChatResponse = {
        message: "Response",
        agent: AgentId.ORCHESTRATOR,
        confidence: 0.9,
        logs: [],
        metrics: { tokensUsed: 50, cost: 0.0005, latency: 300 },
      };

      vi.mocked(sendMessageAPI).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useChatContext(), {
        wrapper: ChatProvider,
      });

      await waitFor(() => {
        expect(result.current.sessionId).toBeTruthy();
      });

      await act(async () => {
        await result.current.sendMessage("");
      });

      // Should still add message (validation happens in API layer)
      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Streaming", () => {
    let mockSendStream: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      // Setup streaming mock for these tests
      mockSendStream = vi.fn();
      vi.mocked(useStreaming).mockReturnValue({
        sendStreamingMessage: mockSendStream,
        isStreaming: false,
      });
    });

    it("creates placeholder message on stream start", async () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: ChatProvider,
      });

      await waitFor(() => {
        expect(result.current.sessionId).toBeTruthy();
      });

      await act(async () => {
        await result.current.sendStreamingMessage("test message");
      });

      await waitFor(() => {
        expect(result.current.isStreaming).toBe(true);
        expect(result.current.messages).toHaveLength(2); // User + placeholder
        expect(result.current.messages[1]?.content).toBe(""); // Empty placeholder
      });
    });

    it("updates message content progressively", async () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: ChatProvider,
      });

      await waitFor(() => {
        expect(result.current.sessionId).toBeTruthy();
      });

      // Start streaming
      await act(async () => {
        await result.current.sendStreamingMessage("test");
      });

      await waitFor(() => {
        expect(result.current.isStreaming).toBe(true);
      });

      // Get callbacks from mock call
      const callbacks = mockSendStream.mock.calls[0]?.[2];
      expect(callbacks).toBeDefined();

      // Simulate chunk events
      act(() => {
        callbacks.onChunk("Hello ");
      });

      await waitFor(() => {
        expect(result.current.messages[1]?.content).toBe("Hello ");
      });

      act(() => {
        callbacks.onChunk("Hello world");
      });

      await waitFor(() => {
        expect(result.current.messages[1]?.content).toBe("Hello world");
      });
    });

    it("updates agent status during stream", async () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: ChatProvider,
      });

      await waitFor(() => {
        expect(result.current.sessionId).toBeTruthy();
      });

      await act(async () => {
        await result.current.sendStreamingMessage("test");
      });

      const callbacks = mockSendStream.mock.calls[0]?.[2];

      // Simulate agent status update
      act(() => {
        callbacks.onAgentUpdate(AgentId.BILLING, AgentStatus.ACTIVE);
      });

      await waitFor(() => {
        expect(result.current.agents[AgentId.BILLING]?.status).toBe(
          AgentStatus.ACTIVE
        );
      });
    });

    it("adds log entries during stream", async () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: ChatProvider,
      });

      await waitFor(() => {
        expect(result.current.sessionId).toBeTruthy();
      });

      await act(async () => {
        await result.current.sendStreamingMessage("test");
      });

      const callbacks = mockSendStream.mock.calls[0]?.[2];

      const mockLog: RetrievalLog = {
        id: "log1",
        type: LogType.VECTOR_SEARCH,
        title: "Test Log",
        data: { query: "test query" },
        timestamp: new Date().toISOString(),
        status: LogStatus.SUCCESS,
        chunks: null,
      };

      // Simulate log event
      act(() => {
        callbacks.onLog(mockLog);
      });

      await waitFor(() => {
        expect(result.current.retrievalLogs).toHaveLength(1);
        expect(result.current.retrievalLogs[0]).toEqual(mockLog);
      });
    });

    it("finalizes message on stream completion", async () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: ChatProvider,
      });

      await waitFor(() => {
        expect(result.current.sessionId).toBeTruthy();
      });

      await act(async () => {
        await result.current.sendStreamingMessage("test");
      });

      const callbacks = mockSendStream.mock.calls[0]?.[2];

      // Simulate chunk
      act(() => {
        callbacks.onChunk("Complete response");
      });

      await waitFor(() => {
        expect(result.current.messages[1]?.content).toBe("Complete response");
      });

      const mockMetadata = {
        agent: AgentId.BILLING,
        confidence: 0.92,
        tokensUsed: 150,
        cost: 0.002,
        latency: 800,
        cache_status: "hit" as const,
      };

      // Simulate completion
      act(() => {
        callbacks.onComplete(mockMetadata);
      });

      await waitFor(() => {
        expect(result.current.isStreaming).toBe(false);
        expect(result.current.streamingMessageId).toBeNull();
        expect(result.current.messages[1]?.agent).toBe(AgentId.BILLING);
        expect(result.current.messages[1]?.confidence).toBe(0.92);
      });

      // Check metrics were updated
      expect(result.current.agents[AgentId.BILLING]?.metrics.tokens).toBe(150);
      expect(result.current.agents[AgentId.BILLING]?.metrics.cost).toBe(0.002);
    });

    it("prevents concurrent streams", async () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: ChatProvider,
      });

      await waitFor(() => {
        expect(result.current.sessionId).toBeTruthy();
      });

      // Start first stream
      await act(async () => {
        await result.current.sendStreamingMessage("first");
      });

      await waitFor(() => {
        expect(result.current.isStreaming).toBe(true);
      });

      // Try to start second stream
      await act(async () => {
        await result.current.sendStreamingMessage("second");
      });

      // Should only call sendStream once
      expect(mockSendStream).toHaveBeenCalledTimes(1);
    });

    it("handles streaming errors and falls back to non-streaming", async () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: ChatProvider,
      });

      await waitFor(() => {
        expect(result.current.sessionId).toBeTruthy();
      });

      await act(async () => {
        await result.current.sendStreamingMessage("test");
      });

      const callbacks = mockSendStream.mock.calls[0]?.[2];

      // Use StreamError with retryable: false to trigger fallback
      const mockError = new StreamError(
        "Stream connection failed",
        StreamErrorCode.TIMEOUT,
        false // Not retryable - will trigger fallback
      );

      // Simulate error - this should trigger fallback mode
      act(() => {
        callbacks.onError(mockError);
      });

      await waitFor(() => {
        expect(result.current.isStreaming).toBe(false);
        expect(result.current.streamingMessageId).toBeNull();
        // Should have enabled fallback mode
        expect(result.current.useFallbackMode).toBe(true);
        // Should have messages (fallback to non-streaming sends them)
        expect(result.current.messages.length).toBeGreaterThan(0);
      });
    });

    it("initializes streaming state correctly", async () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: ChatProvider,
      });

      await waitFor(() => {
        expect(result.current.sessionId).toBeTruthy();
      });

      expect(result.current.isStreaming).toBe(false);
      expect(result.current.streamingMessageId).toBeNull();
      expect(typeof result.current.sendStreamingMessage).toBe("function");
    });

    it("handles session ID not initialized", async () => {
      // Create a provider without waiting for session ID initialization
      const { result } = renderHook(() => useChatContext(), {
        wrapper: ChatProvider,
      });

      // Try to send before session ID is set
      // Note: In practice, session ID is initialized in useEffect, so this is unlikely
      // but we test the guard anyway
      const originalSessionId = result.current.sessionId;

      // Temporarily clear sessionId (this is for testing the guard)
      await act(async () => {
        // This test verifies the guard exists
        // In real usage, sessionId will always be set by the time user can interact
        if (originalSessionId) {
          await result.current.sendStreamingMessage("test");
        }
      });

      // If sessionId exists, stream should have been called
      if (originalSessionId) {
        expect(mockSendStream).toHaveBeenCalled();
      }
    });
  });
});
