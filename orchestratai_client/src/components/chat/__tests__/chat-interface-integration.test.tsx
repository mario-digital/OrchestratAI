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
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatInterface } from "../chat-interface";
import { ChatProvider } from "@/components/providers/chat-provider";
import * as chatAPI from "@/lib/api/chat";
import { AgentId } from "@/lib/enums";
import type { ChatResponse } from "@/lib/schemas";

// Mock the chat API
vi.mock("@/lib/api/chat");

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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows optimistic update then AI response", async () => {
    const user = userEvent.setup();

    const mockResponse: ChatResponse = {
      message: "AI Response",
      agent: AgentId.ORCHESTRATOR,
      confidence: 0.9,
      logs: [],
      metrics: { tokensUsed: 100, cost: 0.001, latency: 500 },
    };

    vi.mocked(chatAPI.sendMessage).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockResponse), 100);
        })
    );

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

    // AI response appears after API call
    await waitFor(
      () => {
        expect(screen.getByText("AI Response")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("removes optimistic message on error", async () => {
    const user = userEvent.setup();

    vi.mocked(chatAPI.sendMessage).mockImplementation(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Network error")), 100);
        })
    );

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

    const mockResponse: ChatResponse = {
      message: "Response",
      agent: AgentId.ORCHESTRATOR,
      confidence: 0.95,
      logs: [],
      metrics: { tokensUsed: 50, cost: 0.0005, latency: 300 },
    };

    // Delay the response to ensure we can see the typing indicator
    vi.mocked(chatAPI.sendMessage).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockResponse), 100);
        })
    );

    render(
      <ChatProvider>
        <ChatInterface />
      </ChatProvider>
    );

    const input = screen.getByPlaceholderText("Type your message...");
    await user.type(input, "Test");
    await user.click(screen.getByLabelText("Send message"));

    // Typing indicator should appear
    await waitFor(() => {
      expect(screen.getByText(/Orchestrator is typing/)).toBeInTheDocument();
    });

    // Wait for response
    await waitFor(() => {
      expect(screen.getByText("Response")).toBeInTheDocument();
    });

    // Typing indicator should disappear
    expect(screen.queryByText(/is typing/)).not.toBeInTheDocument();
  });

  it("displays input disabled during processing", async () => {
    const user = userEvent.setup();

    const mockResponse: ChatResponse = {
      message: "Response",
      agent: AgentId.BILLING,
      confidence: 0.88,
      logs: [],
      metrics: { tokensUsed: 75, cost: 0.00075, latency: 400 },
    };

    vi.mocked(chatAPI.sendMessage).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockResponse), 200);
        })
    );

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

    const mockResponse1: ChatResponse = {
      message: "Response 1",
      agent: AgentId.ORCHESTRATOR,
      confidence: 0.9,
      logs: [],
      metrics: { tokensUsed: 50, cost: 0.0005, latency: 250 },
    };

    const mockResponse2: ChatResponse = {
      message: "Response 2",
      agent: AgentId.TECHNICAL,
      confidence: 0.85,
      logs: [],
      metrics: { tokensUsed: 60, cost: 0.0006, latency: 300 },
    };

    vi.mocked(chatAPI.sendMessage)
      .mockResolvedValueOnce(mockResponse1)
      .mockResolvedValueOnce(mockResponse2);

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

    await waitFor(() => {
      expect(screen.getByText("Response 1")).toBeInTheDocument();
    });

    // Send second message
    await user.clear(input);
    await user.type(input, "Message 2");
    await user.click(sendButton);

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
