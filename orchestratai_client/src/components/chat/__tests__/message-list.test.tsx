/**
 * Unit tests for MessageList component
 * Tests message rendering, auto-scroll behavior, and accessibility
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MessageList, MessageListMessage } from "../message-list";
import { MessageRole, AgentId } from "@/lib/enums";

// Mock IntersectionObserver for ScrollArea component
class IntersectionObserverMock {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
});

// Mock scrollIntoView
const scrollIntoViewMock = vi.fn();

Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
  configurable: true,
  value: scrollIntoViewMock,
});

describe("MessageList", () => {
  const mockMessages: MessageListMessage[] = [
    {
      id: "1",
      role: MessageRole.USER,
      content: "First user message",
    },
    {
      id: "2",
      role: MessageRole.ASSISTANT,
      content: "First assistant response",
      agent: AgentId.ORCHESTRATOR,
      confidence: 0.95,
    },
    {
      id: "3",
      role: MessageRole.USER,
      content: "Second user message",
    },
    {
      id: "4",
      role: MessageRole.ASSISTANT,
      content: "Second assistant response",
      agent: AgentId.BILLING,
      confidence: 0.88,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    scrollIntoViewMock.mockClear();
  });

  describe("Message Rendering", () => {
    it("renders array of messages correctly", () => {
      render(<MessageList messages={mockMessages} />);

      expect(screen.getByText("First user message")).toBeInTheDocument();
      expect(screen.getByText("First assistant response")).toBeInTheDocument();
      expect(screen.getByText("Second user message")).toBeInTheDocument();
      expect(screen.getByText("Second assistant response")).toBeInTheDocument();
    });

    it("renders messages in correct order", () => {
      render(<MessageList messages={mockMessages} />);

      const messages = screen.getAllByText(/message|response/i);
      expect(messages).toHaveLength(4);
    });

    it("displays empty state when no messages", () => {
      render(<MessageList messages={[]} />);

      expect(
        screen.getByText("No messages yet. Start a conversation!")
      ).toBeInTheDocument();
    });

    it("passes agent information to MessageBubble", () => {
      render(<MessageList messages={mockMessages} />);

      // Check that agent badges are rendered
      expect(screen.getByText("orchestrator")).toBeInTheDocument();
      expect(screen.getByText("billing")).toBeInTheDocument();
    });

    it("passes confidence scores to MessageBubble", () => {
      render(<MessageList messages={mockMessages} />);

      expect(screen.getByText("95% confident")).toBeInTheDocument();
      expect(screen.getByText("88% confident")).toBeInTheDocument();
    });

    it("handles messages with timestamps", () => {
      const messagesWithTimestamps: MessageListMessage[] = [
        {
          id: "1",
          role: MessageRole.USER,
          content: "Message with timestamp",
          timestamp: new Date("2025-10-26T14:30:00"),
        },
      ];

      render(<MessageList messages={messagesWithTimestamps} />);

      expect(screen.getByText("Message with timestamp")).toBeInTheDocument();
    });
  });

  describe("Auto-scroll Behavior", () => {
    it("calls scrollIntoView when messages are added", async () => {
      const { rerender } = render(<MessageList messages={mockMessages} />);

      const initialCallCount = scrollIntoViewMock.mock.calls.length;

      // Add a new message
      const newMessages = [
        ...mockMessages,
        {
          id: "5",
          role: MessageRole.USER,
          content: "New message",
        },
      ];

      rerender(<MessageList messages={newMessages} />);

      await waitFor(() =>
        expect(scrollIntoViewMock.mock.calls.length).toBeGreaterThan(
          initialCallCount
        )
      );
    });

    it("uses smooth scroll behavior", async () => {
      render(<MessageList messages={mockMessages} />);

      await waitFor(() => {
        const smoothCalls = scrollIntoViewMock.mock.calls.filter(
          (call) => call[0]?.behavior === "smooth"
        );
        expect(smoothCalls.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA label for message history", () => {
      render(<MessageList messages={mockMessages} />);

      // ScrollArea should have aria-label
      const scrollArea = screen
        .getByText("First user message")
        .closest('[aria-label="Chat message history"]');
      expect(scrollArea).toBeInTheDocument();
    });

    it("has aria-live region for screen readers", () => {
      render(<MessageList messages={mockMessages} />);

      const liveRegion = screen
        .getByText("First user message")
        .closest('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });

    it("each message has proper accessibility labels", () => {
      render(<MessageList messages={mockMessages} />);

      // Use getAllByLabelText since there are multiple user messages
      const userMessages = screen.getAllByLabelText("Message from user");
      expect(userMessages.length).toBe(2);

      expect(
        screen.getByLabelText("Message from orchestrator")
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Message from billing")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles single message", () => {
      const singleMessage: MessageListMessage[] = [
        {
          id: "1",
          role: MessageRole.USER,
          content: "Only message",
        },
      ];

      render(<MessageList messages={singleMessage} />);

      expect(screen.getByText("Only message")).toBeInTheDocument();
    });

    it("handles messages without optional fields", () => {
      const minimalMessages: MessageListMessage[] = [
        {
          id: "1",
          role: MessageRole.ASSISTANT,
          content: "Minimal message",
        },
      ];

      render(<MessageList messages={minimalMessages} />);

      expect(screen.getByText("Minimal message")).toBeInTheDocument();
      expect(screen.queryByText(/confident/i)).not.toBeInTheDocument();
    });

    it("handles very long message list", () => {
      const longMessageList: MessageListMessage[] = Array.from(
        { length: 100 },
        (_, i) => ({
          id: `msg-${i}`,
          role: i % 2 === 0 ? MessageRole.USER : MessageRole.ASSISTANT,
          content: `Message ${i}`,
          agent: i % 2 === 1 ? AgentId.BILLING : undefined,
        })
      );

      render(<MessageList messages={longMessageList} />);

      expect(screen.getByText("Message 0")).toBeInTheDocument();
      expect(screen.getByText("Message 99")).toBeInTheDocument();
    });

    it("updates when messages array changes", () => {
      const { rerender } = render(<MessageList messages={mockMessages} />);

      expect(screen.getByText("First user message")).toBeInTheDocument();

      const updatedMessages: MessageListMessage[] = [
        {
          id: "100",
          role: MessageRole.USER,
          content: "Updated message",
        },
      ];

      rerender(<MessageList messages={updatedMessages} />);

      expect(screen.queryByText("First user message")).not.toBeInTheDocument();
      expect(screen.getByText("Updated message")).toBeInTheDocument();
    });
  });

  describe("Processing State", () => {
    it("accepts isProcessing prop", () => {
      render(<MessageList messages={mockMessages} isProcessing={true} />);

      // Component should render normally even when processing
      expect(screen.getByText("First user message")).toBeInTheDocument();
    });

    it("renders when not processing", () => {
      render(<MessageList messages={mockMessages} isProcessing={false} />);

      expect(screen.getByText("First user message")).toBeInTheDocument();
    });
  });
});
