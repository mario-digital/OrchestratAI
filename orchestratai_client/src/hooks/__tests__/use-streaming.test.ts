/**
 * Tests for useStreaming Hook
 *
 * Comprehensive test suite for SSE streaming hook covering:
 * - EventSource connection creation
 * - Message chunk accumulation
 * - Agent status event handling
 * - Log entry event handling
 * - Done event and connection cleanup
 * - Error handling
 * - Component unmount cleanup
 *
 * @module hooks/__tests__/use-streaming
 */

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useStreaming } from "../use-streaming";
import { AgentId, AgentStatus, LogType, LogStatus } from "@/lib/enums";
import type { RetrievalLog, ChatMetrics } from "@/lib/types";

/**
 * Mock EventSource implementation for testing
 */
class MockEventSource {
  public url: string;
  public listeners: Map<string, Array<(event: MessageEvent) => void>>;
  public onerror: ((error: Event) => void) | null = null;
  public readyState: number = 1; // OPEN
  public close = vi.fn();

  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSED = 2;

  constructor(url: string) {
    this.url = url;
    this.listeners = new Map();
    // Store instance for test access
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, handler: (event: MessageEvent) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(handler);
  }

  removeEventListener(
    type: string,
    handler: (event: MessageEvent) => void
  ): void {
    const handlers = this.listeners.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Simulate receiving an event from server
   */
  simulateEvent(type: string, data: unknown): void {
    const handlers = this.listeners.get(type);
    if (handlers) {
      const event = {
        data: JSON.stringify(data),
        type,
      } as MessageEvent;
      handlers.forEach((handler) => handler(event));
    }
  }

  /**
   * Simulate connection error
   */
  simulateError(readyState: number = MockEventSource.CLOSED): void {
    this.readyState = readyState;
    if (this.onerror) {
      this.onerror(new Event("error"));
    }
  }

  // Track all instances for test access
  static instances: MockEventSource[] = [];
  static resetInstances(): void {
    MockEventSource.instances = [];
  }
}

describe("useStreaming", () => {
  const originalEnv = process.env;
  const mockApiUrl = "http://localhost:8000";

  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv, NEXT_PUBLIC_API_URL: mockApiUrl };

    // Mock EventSource globally
    global.EventSource = MockEventSource as unknown as typeof EventSource;
    MockEventSource.resetInstances();
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;

    // Clear all mocks
    vi.clearAllMocks();
    MockEventSource.resetInstances();
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

  describe("EventSource Connection", () => {
    it("should create EventSource with correct URL", async () => {
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

      expect(MockEventSource.instances).toHaveLength(1);
      const instance = MockEventSource.instances[0]!;
      expect(instance.url).toBe(
        `${mockApiUrl}/api/chat/stream?message=test%20message&session_id=abc-123`
      );
    });

    it("should encode special characters in message", async () => {
      const { result } = renderHook(() => useStreaming());
      const callbacks = {
        onChunk: vi.fn(),
        onAgentUpdate: vi.fn(),
        onLog: vi.fn(),
        onComplete: vi.fn(),
      };

      await act(async () => {
        await result.current.sendStreamingMessage(
          "What are your pricing tiers?",
          "session-id",
          callbacks
        );
      });

      const instance = MockEventSource.instances[0]!;
      expect(instance.url).toContain(
        "message=What%20are%20your%20pricing%20tiers%3F"
      );
    });

    it("should set isStreaming to true when connection opens", async () => {
      const { result } = renderHook(() => useStreaming());
      const callbacks = {
        onChunk: vi.fn(),
        onAgentUpdate: vi.fn(),
        onLog: vi.fn(),
        onComplete: vi.fn(),
      };

      expect(result.current.isStreaming).toBe(false);

      await act(async () => {
        await result.current.sendStreamingMessage(
          "test",
          "session-id",
          callbacks
        );
      });

      expect(result.current.isStreaming).toBe(true);
    });

    it("should throw error if NEXT_PUBLIC_API_URL is not set", async () => {
      process.env["NEXT_PUBLIC_API_URL"] = "";
      const { result } = renderHook(() => useStreaming());
      const callbacks = {
        onChunk: vi.fn(),
        onAgentUpdate: vi.fn(),
        onLog: vi.fn(),
        onComplete: vi.fn(),
        onError: vi.fn(),
      };

      await expect(
        result.current.sendStreamingMessage("test", "session-id", callbacks)
      ).rejects.toThrow("NEXT_PUBLIC_API_URL environment variable not set");

      expect(callbacks.onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "NEXT_PUBLIC_API_URL environment variable not set",
        })
      );
    });
  });

  describe("Message Chunk Handling", () => {
    it("should accumulate message chunks correctly", async () => {
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

      const instance = MockEventSource.instances[0]!;

      // Simulate first chunk
      act(() => {
        instance.simulateEvent("message_chunk", { content: "Hello " });
      });

      expect(onChunk).toHaveBeenCalledWith("Hello ");

      // Simulate second chunk - should accumulate
      act(() => {
        instance.simulateEvent("message_chunk", { content: "world" });
      });

      expect(onChunk).toHaveBeenCalledWith("Hello world");

      // Simulate third chunk - should continue accumulating
      act(() => {
        instance.simulateEvent("message_chunk", { content: "!" });
      });

      expect(onChunk).toHaveBeenCalledWith("Hello world!");
      expect(onChunk).toHaveBeenCalledTimes(3);
    });

    it("should handle JSON parsing errors in chunks gracefully", async () => {
      const { result } = renderHook(() => useStreaming());
      const onChunk = vi.fn();
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
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

      const instance = MockEventSource.instances[0]!;

      // Simulate malformed JSON
      act(() => {
        const handlers = instance.listeners.get("message_chunk");
        if (handlers) {
          handlers.forEach((handler) => {
            handler({
              data: "invalid json",
              type: "message_chunk",
            } as MessageEvent);
          });
        }
      });

      // Should log error but not crash
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to parse message_chunk:",
        expect.any(Error)
      );
      expect(result.current.isStreaming).toBe(true); // Stream should continue

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Agent Status Updates", () => {
    it("should handle agent status updates", async () => {
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

      const instance = MockEventSource.instances[0]!;

      act(() => {
        instance.simulateEvent("agent_status", {
          agent: AgentId.ORCHESTRATOR,
          status: AgentStatus.ROUTING,
        });
      });

      expect(onAgentUpdate).toHaveBeenCalledWith(
        AgentId.ORCHESTRATOR,
        AgentStatus.ROUTING
      );

      act(() => {
        instance.simulateEvent("agent_status", {
          agent: AgentId.TECHNICAL,
          status: AgentStatus.ACTIVE,
        });
      });

      expect(onAgentUpdate).toHaveBeenCalledWith(
        AgentId.TECHNICAL,
        AgentStatus.ACTIVE
      );
      expect(onAgentUpdate).toHaveBeenCalledTimes(2);
    });

    it("should handle JSON parsing errors in agent_status gracefully", async () => {
      const { result } = renderHook(() => useStreaming());
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
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

      const instance = MockEventSource.instances[0]!;

      // Simulate malformed JSON
      act(() => {
        const handlers = instance.listeners.get("agent_status");
        if (handlers) {
          handlers.forEach((handler) => {
            handler({
              data: "invalid json",
              type: "agent_status",
            } as MessageEvent);
          });
        }
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to parse agent_status:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Retrieval Log Handling", () => {
    it("should handle retrieval log events", async () => {
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

      const instance = MockEventSource.instances[0]!;

      const mockLog: RetrievalLog = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        type: LogType.VECTOR_SEARCH,
        title: "Vector search completed",
        data: { query: "test", results: 5 },
        timestamp: "2024-01-01T00:00:00Z",
        status: LogStatus.SUCCESS,
      };

      act(() => {
        instance.simulateEvent("retrieval_log", mockLog);
      });

      expect(onLog).toHaveBeenCalledWith(mockLog);
      expect(onLog).toHaveBeenCalledTimes(1);
    });

    it("should handle JSON parsing errors in retrieval_log gracefully", async () => {
      const { result } = renderHook(() => useStreaming());
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
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

      const instance = MockEventSource.instances[0]!;

      // Simulate malformed JSON
      act(() => {
        const handlers = instance.listeners.get("retrieval_log");
        if (handlers) {
          handlers.forEach((handler) => {
            handler({
              data: "invalid json",
              type: "retrieval_log",
            } as MessageEvent);
          });
        }
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to parse retrieval_log:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Stream Completion", () => {
    it("should handle done event and close connection", async () => {
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

      const instance = MockEventSource.instances[0]!;

      expect(result.current.isStreaming).toBe(true);

      const mockMetadata: ChatMetrics = {
        tokensUsed: 150,
        cost: 0.002,
        latency: 1234,
        cache_status: "hit",
      };

      act(() => {
        instance.simulateEvent("done", { metadata: mockMetadata });
      });

      expect(onComplete).toHaveBeenCalledWith(mockMetadata);
      expect(instance.close).toHaveBeenCalled();
      expect(result.current.isStreaming).toBe(false);
    });

    it("should close connection even if done event parsing fails", async () => {
      const { result } = renderHook(() => useStreaming());
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
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

      const instance = MockEventSource.instances[0]!;

      // Simulate malformed JSON in done event
      act(() => {
        const handlers = instance.listeners.get("done");
        if (handlers) {
          handlers.forEach((handler) => {
            handler({ data: "invalid json", type: "done" } as MessageEvent);
          });
        }
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to parse done event:",
        expect.any(Error)
      );
      expect(instance.close).toHaveBeenCalled();
      expect(result.current.isStreaming).toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Error Handling", () => {
    it("should handle connection errors when CLOSED", async () => {
      const { result } = renderHook(() => useStreaming());
      const onError = vi.fn();
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
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

      const instance = MockEventSource.instances[0]!;

      act(() => {
        instance.simulateError(MockEventSource.CLOSED);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith("SSE connection closed");
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: "SSE connection failed" })
      );
      expect(instance.close).toHaveBeenCalled();
      expect(result.current.isStreaming).toBe(false);

      consoleErrorSpy.mockRestore();
    });

    it("should log reconnection attempts when CONNECTING", async () => {
      const { result } = renderHook(() => useStreaming());
      const consoleLogSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});
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

      const instance = MockEventSource.instances[0]!;

      act(() => {
        instance.simulateError(MockEventSource.CONNECTING);
      });

      expect(consoleLogSpy).toHaveBeenCalledWith("SSE reconnecting...");
      expect(result.current.isStreaming).toBe(true); // Should still be streaming

      consoleLogSpy.mockRestore();
    });

    it("should handle other error states", async () => {
      const { result } = renderHook(() => useStreaming());
      const onError = vi.fn();
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
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

      const instance = MockEventSource.instances[0]!;

      // Simulate unknown error state (readyState = 999)
      act(() => {
        instance.simulateError(999);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "SSE connection error:",
        expect.any(Event)
      );
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: "SSE connection error" })
      );
      expect(instance.close).toHaveBeenCalled();
      expect(result.current.isStreaming).toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Cleanup", () => {
    it("should cleanup connection on component unmount", async () => {
      const { result, unmount } = renderHook(() => useStreaming());
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

      const instance = MockEventSource.instances[0]!;

      expect(result.current.isStreaming).toBe(true);

      // Unmount component
      unmount();

      expect(instance.close).toHaveBeenCalled();
    });

    it("should close existing connection when sending new message", async () => {
      const { result } = renderHook(() => useStreaming());
      const callbacks = {
        onChunk: vi.fn(),
        onAgentUpdate: vi.fn(),
        onLog: vi.fn(),
        onComplete: vi.fn(),
      };

      // Send first message
      await act(async () => {
        await result.current.sendStreamingMessage(
          "first",
          "session-1",
          callbacks
        );
      });

      const firstInstance = MockEventSource.instances[0]!;

      // Send second message (should close first connection)
      await act(async () => {
        await result.current.sendStreamingMessage(
          "second",
          "session-2",
          callbacks
        );
      });

      expect(firstInstance.close).toHaveBeenCalled();
      expect(MockEventSource.instances).toHaveLength(2);
    });

    it("should handle cleanup when no connection exists", () => {
      const { unmount } = renderHook(() => useStreaming());

      // Should not throw when unmounting without active connection
      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Integration", () => {
    it("should handle complete streaming flow", async () => {
      const { result } = renderHook(() => useStreaming());
      const onChunk = vi.fn();
      const onAgentUpdate = vi.fn();
      const onLog = vi.fn();
      const onComplete = vi.fn();

      const callbacks = {
        onChunk,
        onAgentUpdate,
        onLog,
        onComplete,
      };

      await act(async () => {
        await result.current.sendStreamingMessage(
          "test",
          "session-id",
          callbacks
        );
      });

      const instance = MockEventSource.instances[0]!;

      // Simulate complete streaming flow
      act(() => {
        // Agent status update
        instance.simulateEvent("agent_status", {
          agent: AgentId.ORCHESTRATOR,
          status: AgentStatus.ROUTING,
        });

        // First chunk
        instance.simulateEvent("message_chunk", { content: "Hello " });

        // Log entry
        instance.simulateEvent("retrieval_log", {
          id: "550e8400-e29b-41d4-a716-446655440000",
          type: LogType.ROUTING,
          title: "Route selected",
          data: {},
          timestamp: "2024-01-01T00:00:00Z",
          status: LogStatus.SUCCESS,
        });

        // Second chunk
        instance.simulateEvent("message_chunk", { content: "world!" });

        // Another agent status
        instance.simulateEvent("agent_status", {
          agent: AgentId.TECHNICAL,
          status: AgentStatus.COMPLETE,
        });

        // Done event
        instance.simulateEvent("done", {
          metadata: {
            tokensUsed: 200,
            cost: 0.003,
            latency: 2000,
          },
        });
      });

      // Verify all callbacks were called correctly
      expect(onAgentUpdate).toHaveBeenCalledTimes(2);
      expect(onChunk).toHaveBeenCalledTimes(2);
      expect(onChunk).toHaveBeenLastCalledWith("Hello world!");
      expect(onLog).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledWith({
        tokensUsed: 200,
        cost: 0.003,
        latency: 2000,
      });
      expect(instance.close).toHaveBeenCalled();
      expect(result.current.isStreaming).toBe(false);
    });
  });
});
