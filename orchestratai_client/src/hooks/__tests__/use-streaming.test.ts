/**
 * Tests for useStreaming Hook (Two-Step Secure Streaming)
 *
 * Tests the two-step secure streaming approach:
 * 1. POST to /api/chat/stream/initiate
 * 2. EventSource to /api/chat/stream/{stream_id}
 *
 * @module hooks/__tests__/use-streaming
 */

import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useStreaming } from "../use-streaming";
import { AgentId, AgentStatus, LogType, LogStatus } from "@/lib/enums";
import type { RetrievalLog, ChatMetrics } from "@/lib/types";

/**
 * Mock EventSource for testing
 */
class MockEventSource {
  public readonly url: string;
  public readonly readyState: number = 1; // OPEN
  public onerror: ((error: Event) => void) | null = null;
  public listeners: Map<string, ((e: MessageEvent) => void)[]> = new Map();

  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSED = 2;

  constructor(url: string) {
    this.url = url;
  }

  addEventListener(event: string, handler: (e: MessageEvent) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler);
  }

  close() {
    // Mock close
  }

  // Helper to simulate events
  simulateEvent(event: string, data: unknown) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        handler({ data: JSON.stringify(data) } as MessageEvent);
      });
    }
  }
}

describe("useStreaming", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let EventSourceMock: typeof MockEventSource;

  beforeEach(() => {
    // Mock global fetch
    fetchMock = vi.fn();
    global.fetch = fetchMock;

    // Mock EventSource
    EventSourceMock = MockEventSource;
    global.EventSource = EventSourceMock as unknown as typeof EventSource;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with isStreaming false", () => {
      const { result } = renderHook(() => useStreaming());
      expect(result.current.isStreaming).toBe(false);
    });

    it("should provide sendStreamingMessage function", () => {
      const { result } = renderHook(() => useStreaming());
      expect(result.current.sendStreamingMessage).toBeDefined();
      expect(typeof result.current.sendStreamingMessage).toBe("function");
    });
  });

  describe("Two-Step Initiation", () => {
    it("should POST to /api/chat/stream/initiate first", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ stream_id: "test-stream-id" }),
      });

      const { result } = renderHook(() => useStreaming());
      const callbacks = {
        onChunk: vi.fn(),
        onAgentUpdate: vi.fn(),
        onLog: vi.fn(),
        onComplete: vi.fn(),
      };

      await act(async () => {
        await result.current.sendStreamingMessage(
          "test message",
          "abc-123",
          callbacks
        );
      });

      // Should POST to initiate endpoint
      expect(fetchMock).toHaveBeenCalledWith("/api/chat/stream/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "test message",
          session_id: "abc-123",
        }),
      });
    });

    it("should create EventSource with stream_id", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ stream_id: "test-stream-123" }),
      });

      const { result } = renderHook(() => useStreaming());
      const callbacks = {
        onChunk: vi.fn(),
        onAgentUpdate: vi.fn(),
        onLog: vi.fn(),
        onComplete: vi.fn(),
      };

      await act(async () => {
        await result.current.sendStreamingMessage(
          "test",
          "session-id",
          callbacks
        );
      });

      // Should create EventSource with stream_id
      const eventSource = EventSourceMock.prototype;
      expect(eventSource).toBeDefined();
    });

    it("should throw error if initiate fails", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: "Server error" }),
      });

      const { result } = renderHook(() => useStreaming());
      const onError = vi.fn();
      const callbacks = {
        onChunk: vi.fn(),
        onAgentUpdate: vi.fn(),
        onLog: vi.fn(),
        onComplete: vi.fn(),
        onError,
      };

      await expect(
        (async () => {
          await act(async () => {
            await result.current.sendStreamingMessage(
              "test",
              "session-id",
              callbacks
            );
          });
        })()
      ).rejects.toThrow();

      expect(onError).toHaveBeenCalled();
    });
  });

  describe("EventSource Event Handling", () => {
    let mockEventSource: MockEventSource;

    beforeEach(() => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ stream_id: "test-stream" }),
      });

      // Capture the created EventSource
      const OriginalEventSource = EventSourceMock;
      global.EventSource = vi.fn((url: string) => {
        mockEventSource = new OriginalEventSource(url) as MockEventSource;
        return mockEventSource;
      }) as unknown as typeof EventSource;
    });

    it("should handle message_chunk events", async () => {
      const { result } = renderHook(() => useStreaming());
      const onChunk = vi.fn();
      const callbacks = {
        onChunk,
        onAgentUpdate: vi.fn(),
        onLog: vi.fn(),
        onComplete: vi.fn(),
      };

      await act(async () => {
        await result.current.sendStreamingMessage(
          "test",
          "session-id",
          callbacks
        );
      });

      // Wait for EventSource to be created
      await waitFor(() => expect(mockEventSource).toBeDefined());

      // Simulate chunk events
      act(() => {
        mockEventSource.simulateEvent("message_chunk", { content: "Hello " });
        mockEventSource.simulateEvent("message_chunk", { content: "world" });
      });

      expect(onChunk).toHaveBeenCalledTimes(2);
      expect(onChunk).toHaveBeenNthCalledWith(1, "Hello ");
      expect(onChunk).toHaveBeenNthCalledWith(2, "Hello world");
    });

    it("should handle agent_status events", async () => {
      const { result } = renderHook(() => useStreaming());
      const onAgentUpdate = vi.fn();
      const callbacks = {
        onChunk: vi.fn(),
        onAgentUpdate,
        onLog: vi.fn(),
        onComplete: vi.fn(),
      };

      await act(async () => {
        await result.current.sendStreamingMessage(
          "test",
          "session-id",
          callbacks
        );
      });
      await waitFor(() => expect(mockEventSource).toBeDefined());

      act(() => {
        mockEventSource.simulateEvent("agent_status", {
          agent: AgentId.ORCHESTRATOR,
          status: AgentStatus.ROUTING,
        });
      });

      expect(onAgentUpdate).toHaveBeenCalledWith(
        AgentId.ORCHESTRATOR,
        AgentStatus.ROUTING
      );
    });

    it("normalizes agent_status payload casing", async () => {
      const { result } = renderHook(() => useStreaming());
      const onAgentUpdate = vi.fn();
      const callbacks = {
        onChunk: vi.fn(),
        onAgentUpdate,
        onLog: vi.fn(),
        onComplete: vi.fn(),
      };

      await act(async () => {
        await result.current.sendStreamingMessage(
          "test",
          "session-id",
          callbacks
        );
      });
      await waitFor(() => expect(mockEventSource).toBeDefined());

      act(() => {
        mockEventSource.simulateEvent("agent_status", {
          agent: "ORCHESTRATOR",
          status: "ACTIVE",
        });
      });

      expect(onAgentUpdate).toHaveBeenCalledWith(
        AgentId.ORCHESTRATOR,
        AgentStatus.ACTIVE
      );
    });

    it("should handle retrieval_log events", async () => {
      const mockLog: RetrievalLog = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        type: LogType.VECTOR_SEARCH,
        title: "Vector search",
        data: {},
        timestamp: "2024-01-01T00:00:00Z",
        status: LogStatus.SUCCESS,
      };

      const { result } = renderHook(() => useStreaming());
      const onLog = vi.fn();
      const callbacks = {
        onChunk: vi.fn(),
        onAgentUpdate: vi.fn(),
        onLog,
        onComplete: vi.fn(),
      };

      await act(async () => {
        await result.current.sendStreamingMessage(
          "test",
          "session-id",
          callbacks
        );
      });
      await waitFor(() => expect(mockEventSource).toBeDefined());

      act(() => {
        mockEventSource.simulateEvent("retrieval_log", mockLog);
      });

      expect(onLog).toHaveBeenCalledWith(mockLog);
    });

    it("should handle done event and close connection", async () => {
      const mockMetadata: ChatMetrics = {
        tokensUsed: 150,
        cost: 0.002,
        latency: 1234,
        cache_status: "hit",
      };

      const { result } = renderHook(() => useStreaming());
      const onComplete = vi.fn();
      const callbacks = {
        onChunk: vi.fn(),
        onAgentUpdate: vi.fn(),
        onLog: vi.fn(),
        onComplete,
      };

      await act(async () => {
        await result.current.sendStreamingMessage(
          "test",
          "session-id",
          callbacks
        );
      });
      await waitFor(() => expect(mockEventSource).toBeDefined());

      act(() => {
        mockEventSource.simulateEvent("done", { metadata: mockMetadata });
      });

      expect(onComplete).toHaveBeenCalledWith(mockMetadata);

      // Wait for state update
      await waitFor(() => {
        expect(result.current.isStreaming).toBe(false);
      });
    });
  });

  describe("Message Accumulation", () => {
    let mockEventSource: MockEventSource;

    beforeEach(() => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ stream_id: "test-stream" }),
      });

      const OriginalEventSource = EventSourceMock;
      global.EventSource = vi.fn((url: string) => {
        mockEventSource = new OriginalEventSource(url) as MockEventSource;
        return mockEventSource;
      }) as unknown as typeof EventSource;
    });

    it("should accumulate chunks correctly", async () => {
      const { result } = renderHook(() => useStreaming());
      const onChunk = vi.fn();
      const callbacks = {
        onChunk,
        onAgentUpdate: vi.fn(),
        onLog: vi.fn(),
        onComplete: vi.fn(),
      };

      await act(async () => {
        await result.current.sendStreamingMessage(
          "test",
          "session-id",
          callbacks
        );
      });
      await waitFor(() => expect(mockEventSource).toBeDefined());

      act(() => {
        mockEventSource.simulateEvent("message_chunk", { content: "Hello " });
        mockEventSource.simulateEvent("message_chunk", {
          content: "beautiful ",
        });
        mockEventSource.simulateEvent("message_chunk", { content: "world!" });
      });

      expect(onChunk).toHaveBeenCalledTimes(3);
      expect(onChunk).toHaveBeenNthCalledWith(1, "Hello ");
      expect(onChunk).toHaveBeenNthCalledWith(2, "Hello beautiful ");
      expect(onChunk).toHaveBeenNthCalledWith(3, "Hello beautiful world!");
    });
  });

  describe("Error Handling", () => {
    let mockEventSource: MockEventSource;

    beforeEach(() => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ stream_id: "test-stream" }),
      });

      const OriginalEventSource = EventSourceMock;
      global.EventSource = vi.fn((url: string) => {
        mockEventSource = new OriginalEventSource(url) as MockEventSource;
        return mockEventSource;
      }) as unknown as typeof EventSource;
    });

    it("should handle JSON parsing errors gracefully", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const { result } = renderHook(() => useStreaming());
      const callbacks = {
        onChunk: vi.fn(),
        onAgentUpdate: vi.fn(),
        onLog: vi.fn(),
        onComplete: vi.fn(),
      };

      await act(async () => {
        await result.current.sendStreamingMessage(
          "test",
          "session-id",
          callbacks
        );
      });
      await waitFor(() => expect(mockEventSource).toBeDefined());

      // Simulate malformed JSON - pass invalid string
      const handlers = mockEventSource.listeners.get("message_chunk");
      if (handlers && handlers[0]) {
        act(() => {
          handlers[0]!({ data: "invalid json" } as MessageEvent);
        });
      }

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it("should handle connection errors with CLOSED state", async () => {
      const { result } = renderHook(() => useStreaming());
      const onError = vi.fn();
      const callbacks = {
        onChunk: vi.fn(),
        onAgentUpdate: vi.fn(),
        onLog: vi.fn(),
        onComplete: vi.fn(),
        onError,
      };

      await act(async () => {
        await result.current.sendStreamingMessage(
          "test",
          "session-id",
          callbacks
        );
      });
      await waitFor(() => expect(mockEventSource).toBeDefined());

      // Simulate permanent connection failure
      act(() => {
        Object.defineProperty(mockEventSource, "readyState", {
          value: EventSourceMock.CLOSED,
          writable: true,
        });
        mockEventSource.onerror?.(new Event("error"));
      });

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle missing stream_id from server", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({}), // No stream_id
      });

      const { result } = renderHook(() => useStreaming());
      const onError = vi.fn();
      const callbacks = {
        onChunk: vi.fn(),
        onAgentUpdate: vi.fn(),
        onLog: vi.fn(),
        onComplete: vi.fn(),
        onError,
      };

      await expect(
        (async () => {
          await act(async () => {
            await result.current.sendStreamingMessage(
              "test",
              "session-id",
              callbacks
            );
          });
        })()
      ).rejects.toThrow("No stream_id received from server");

      expect(onError).toHaveBeenCalled();
    });
  });

  describe("Cleanup", () => {
    it("should cleanup on component unmount", () => {
      const { unmount } = renderHook(() => useStreaming());
      expect(() => unmount()).not.toThrow();
    });
  });
});
