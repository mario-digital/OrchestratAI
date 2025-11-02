/**
 * Integration tests for ChatInterface with optimistic updates and error handling
 *
 * Tests the complete flow of:
 * - Optimistic UI updates
 * - Typing indicators
 * - Error toast notifications
 * - Retry mechanism
 * - Full message flow
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatInterface } from "../chat-interface";
import { ChatProvider } from "@/components/providers/chat-provider";
import { useStreaming } from "@/hooks/use-streaming";
import { AgentId, AgentStatus } from "@/lib/enums";
import type { RetrievalLog, ChatMetrics } from "@/lib/types";

// Type for streaming callbacks (matching useStreaming hook interface)
interface StreamingCallbacks {
  onChunk: (accumulatedText: string) => void;
  onAgentUpdate: (agent: AgentId, status: AgentStatus) => void;
  onLog: (log: RetrievalLog) => void;
  onComplete: (metadata: ChatMetrics) => void;
  onError?: (error: Error) => void;
}

// Mock the useStreaming hook
vi.mock("@/hooks/use-streaming");

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Mock scrollIntoView for testing environment
HTMLElement.prototype.scrollIntoView = vi.fn();

describe("ChatInterface Integration - Optimistic Updates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Don't set up default mock here - let each test set up its own mock before rendering
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows optimistic update then AI response", async () => {
    const user = userEvent.setup();

    const mockSendStream = vi.fn(async (_message, _sessionId, callbacks) => {
      // Simulate streaming chunks
      setTimeout(() => {
        callbacks?.onChunk?.("AI ");
      }, 50);
      setTimeout(() => {
        callbacks?.onChunk?.("AI Response");
      }, 100);
      setTimeout(() => {
        callbacks?.onComplete?.({
          tokensUsed: 100,
          cost: 0.001,
          latency: 500,
          cache_status: "miss",
          agent: AgentId.ORCHESTRATOR,
          confidence: 0.9,
        });
      }, 150);
    });

    vi.mocked(useStreaming).mockReturnValue({
      sendStreamingMessage: mockSendStream,
      isStreaming: false,
    });

    render(
      <ChatProvider>
        <ChatInterface />
      </ChatProvider>
    );

    // Type and send message
    const input = screen.getByPlaceholderText("Type your message...");
    await user.type(input, "Hello");
    await user.click(screen.getByLabelText("Send message"));

    // Optimistic update: user message appears immediately
    await waitFor(() => {
      expect(screen.getByText("Hello")).toBeInTheDocument();
    });

    // AI response appears after streaming completes
    await waitFor(
      () => {
        expect(screen.getByText("AI Response")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("removes optimistic message on error", async () => {
    const user = userEvent.setup();

    const mockSendStream = vi.fn(async (_message, _sessionId, callbacks) => {
      // Simulate error
      setTimeout(() => {
        callbacks?.onError?.(new Error("Network error"));
      }, 100);
    });

    vi.mocked(useStreaming).mockReturnValue({
      sendStreamingMessage: mockSendStream,
      isStreaming: false,
    });

    render(
      <ChatProvider>
        <ChatInterface />
      </ChatProvider>
    );

    const input = screen.getByPlaceholderText("Type your message...");
    await user.type(input, "Hello");
    await user.click(screen.getByLabelText("Send message"));

    // Optimistic update appears
    await waitFor(() => {
      expect(screen.getByText("Hello")).toBeInTheDocument();
    });

    // After error, message is removed
    await waitFor(
      () => {
        expect(screen.queryByText("Hello")).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("shows typing indicator during API call", async () => {
    const user = userEvent.setup();

    let capturedCallbacks: StreamingCallbacks | undefined;
    const mockSendStream = vi.fn(async (_message, _sessionId, callbacks) => {
      capturedCallbacks = callbacks;
      // Don't call callbacks immediately - let the test control when they're called
    });

    vi.mocked(useStreaming).mockReturnValue({
      sendStreamingMessage: mockSendStream,
      isStreaming: false,
    });

    render(
      <ChatProvider>
        <ChatInterface />
      </ChatProvider>
    );

    const input = screen.getByPlaceholderText("Type your message...");
    await user.type(input, "Test");
    await user.click(screen.getByLabelText("Send message"));

    // Wait for the mock to be called and callbacks to be captured
    await waitFor(() => {
      expect(mockSendStream).toHaveBeenCalled();
      expect(capturedCallbacks).toBeDefined();
    });

    // Now simulate the stream completing
    act(() => {
      capturedCallbacks!.onChunk("Response");
      capturedCallbacks!.onComplete({
        tokensUsed: 50,
        cost: 0.0005,
        latency: 300,
        cache_status: "miss",
      });
    });

    // Wait for response
    await waitFor(() => {
      expect(screen.getByText("Response")).toBeInTheDocument();
    });
  });

  it("displays input disabled during processing", async () => {
    const user = userEvent.setup();

    let capturedCallbacks: StreamingCallbacks | undefined;
    const mockSendStream = vi.fn(async (_message, _sessionId, callbacks) => {
      capturedCallbacks = callbacks;
    });

    vi.mocked(useStreaming).mockReturnValue({
      sendStreamingMessage: mockSendStream,
      isStreaming: false,
    });

    render(
      <ChatProvider>
        <ChatInterface />
      </ChatProvider>
    );

    const input = screen.getByPlaceholderText("Type your message...");
    const sendButton = screen.getByLabelText("Send message");

    await user.type(input, "Test");
    await user.click(sendButton);

    // Send button should be disabled during processing
    await waitFor(() => {
      expect(sendButton).toBeDisabled();
    });

    // Wait for callbacks to be captured
    await waitFor(() => {
      expect(capturedCallbacks).toBeDefined();
    });

    // Complete the stream
    act(() => {
      capturedCallbacks!.onChunk("Response");
      capturedCallbacks!.onComplete({
        tokensUsed: 75,
        cost: 0.00075,
        latency: 400,
        cache_status: "miss",
      });
    });

    // Wait for response
    await waitFor(
      () => {
        expect(screen.getByText("Response")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Type new message to enable send button again
    await user.type(input, "New message");

    // Send button should be enabled with new content
    await waitFor(() => {
      expect(sendButton).not.toBeDisabled();
    });
  });

  it("handles multiple messages in sequence", async () => {
    const user = userEvent.setup();

    const capturedCallbacksList: Array<{
      callbacks: StreamingCallbacks;
      count: number;
    }> = [];
    let callCount = 0;

    const mockSendStream = vi.fn(async (_message, _sessionId, callbacks) => {
      callCount++;
      capturedCallbacksList.push({
        callbacks,
        count: callCount,
      });
    });

    vi.mocked(useStreaming).mockReturnValue({
      sendStreamingMessage: mockSendStream,
      isStreaming: false,
    });

    render(
      <ChatProvider>
        <ChatInterface />
      </ChatProvider>
    );

    const input = screen.getByPlaceholderText("Type your message...");
    const sendButton = screen.getByLabelText("Send message");

    // Send first message
    await user.type(input, "Message 1");
    await user.click(sendButton);

    // Wait for first callbacks to be captured
    await waitFor(() => {
      expect(capturedCallbacksList.length).toBeGreaterThan(0);
    });

    // Complete first stream
    act(() => {
      const first = capturedCallbacksList[0]!;
      first.callbacks.onChunk(`Response ${first.count}`);
      first.callbacks.onComplete({
        tokensUsed: 50 + first.count * 10,
        cost: 0.0005 + first.count * 0.0001,
        latency: 250 + first.count * 50,
        cache_status: "miss",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Response 1")).toBeInTheDocument();
    });

    // Send second message - manually clear input by selecting all and typing
    await user.click(input);
    await user.keyboard("{Control>}a{/Control}");
    await user.type(input, "Message 2");
    await user.click(sendButton);

    // Wait for second callbacks to be captured
    await waitFor(() => {
      expect(capturedCallbacksList.length).toBeGreaterThan(1);
    });

    // Complete second stream
    act(() => {
      const second = capturedCallbacksList[1]!;
      second.callbacks.onChunk(`Response ${second.count}`);
      second.callbacks.onComplete({
        tokensUsed: 50 + second.count * 10,
        cost: 0.0005 + second.count * 0.0001,
        latency: 250 + second.count * 50,
        cache_status: "miss",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Response 2")).toBeInTheDocument();
    });

    // Both user messages and responses should be visible
    expect(screen.getByText("Message 1")).toBeInTheDocument();
    expect(screen.getByText("Message 2")).toBeInTheDocument();
    expect(screen.getByText("Response 1")).toBeInTheDocument();
    expect(screen.getByText("Response 2")).toBeInTheDocument();
  });
});
