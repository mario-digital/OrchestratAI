/**
 * Unit tests for MessageBubble component
 * Tests user/assistant message rendering, agent badges, and confidence scores
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageBubble } from "../message-bubble";
import { MessageRole, AgentId } from "@/lib/enums";

describe("MessageBubble", () => {
  describe("User Messages", () => {
    it("renders user messages right-aligned with correct styling", () => {
      render(
        <MessageBubble role={MessageRole.USER} content="Hello from user" />
      );

      const message = screen.getByText("Hello from user");
      expect(message).toBeInTheDocument();

      // Check aria-label
      const container = screen.getByLabelText("Message from user");
      expect(container).toBeInTheDocument();

      // Check for user message styling classes
      const bubble = message.closest("div");
      expect(bubble).toHaveClass("bg-message-user-bg");
      expect(bubble).toHaveClass("text-message-user-text");
    });

    it("does not render agent badge for user messages", () => {
      render(<MessageBubble role={MessageRole.USER} content="User message" />);

      // Badge should not be present
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("does not render confidence score for user messages", () => {
      render(
        <MessageBubble
          role={MessageRole.USER}
          content="User message"
          confidence={0.95}
        />
      );

      expect(screen.queryByText(/confident/i)).not.toBeInTheDocument();
    });
  });

  describe("Assistant Messages", () => {
    it("renders assistant messages left-aligned with correct styling", () => {
      render(
        <MessageBubble
          role={MessageRole.ASSISTANT}
          content="Hello from assistant"
          agent={AgentId.BILLING}
        />
      );

      const message = screen.getByText("Hello from assistant");
      expect(message).toBeInTheDocument();

      // Check aria-label
      const container = screen.getByLabelText("Message from billing");
      expect(container).toBeInTheDocument();

      // Check for assistant message styling classes
      const bubble = message.closest("div");
      expect(bubble).toHaveClass("bg-message-assistant-bg");
      expect(bubble).toHaveClass("text-message-assistant-text");
      expect(bubble).toHaveClass("border-message-assistant-border");
    });

    it("renders agent badge for assistant messages", () => {
      render(
        <MessageBubble
          role={MessageRole.ASSISTANT}
          content="Response"
          agent={AgentId.ORCHESTRATOR}
        />
      );

      // Check badge text
      expect(screen.getByText("orchestrator")).toBeInTheDocument();
    });

    it("renders all agent types correctly", () => {
      const agents = [
        AgentId.ORCHESTRATOR,
        AgentId.BILLING,
        AgentId.TECHNICAL,
        AgentId.POLICY,
      ];

      agents.forEach((agentId) => {
        const { unmount } = render(
          <MessageBubble
            role={MessageRole.ASSISTANT}
            content="Test message"
            agent={agentId}
          />
        );

        expect(screen.getByText(agentId)).toBeInTheDocument();
        unmount();
      });
    });

    it("displays confidence score when provided", () => {
      render(
        <MessageBubble
          role={MessageRole.ASSISTANT}
          content="Response"
          agent={AgentId.BILLING}
          confidence={0.95}
        />
      );

      expect(screen.getByText("95% confident")).toBeInTheDocument();
    });

    it("displays confidence score rounded correctly", () => {
      render(
        <MessageBubble
          role={MessageRole.ASSISTANT}
          content="Response"
          agent={AgentId.TECHNICAL}
          confidence={0.874}
        />
      );

      expect(screen.getByText("87% confident")).toBeInTheDocument();
    });

    it("does not display confidence score when not provided", () => {
      render(
        <MessageBubble
          role={MessageRole.ASSISTANT}
          content="Response"
          agent={AgentId.POLICY}
        />
      );

      expect(screen.queryByText(/confident/i)).not.toBeInTheDocument();
    });
  });

  describe("Timestamps", () => {
    it("displays timestamp when provided", () => {
      const testDate = new Date("2025-10-26T14:30:00");

      render(
        <MessageBubble
          role={MessageRole.USER}
          content="Timestamped message"
          timestamp={testDate}
        />
      );

      // Check for time string (format may vary by locale)
      const timeString = testDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      expect(screen.getByText(timeString)).toBeInTheDocument();
    });

    it("does not display timestamp when not provided", () => {
      const { container } = render(
        <MessageBubble role={MessageRole.USER} content="No timestamp" />
      );

      // Check that there's no element with time-related classes
      const timeElements = container.querySelectorAll(".text-xs.opacity-60");
      expect(timeElements.length).toBe(0);
    });
  });

  describe("Content Rendering", () => {
    it("renders multiline content correctly", () => {
      const multilineContent = "Line 1\nLine 2\nLine 3";

      const { container } = render(
        <MessageBubble role={MessageRole.USER} content={multilineContent} />
      );

      // Check that paragraph element contains multiline text
      const paragraph = container.querySelector("p");
      expect(paragraph).toHaveClass("whitespace-pre-wrap");
      expect(paragraph?.textContent).toBe(multilineContent);
    });

    it("handles long content with word wrapping", () => {
      const longContent =
        "This is a very long message that should wrap properly when it exceeds the maximum width of the message bubble container";

      const { container } = render(
        <MessageBubble role={MessageRole.USER} content={longContent} />
      );

      const paragraph = container.querySelector("p");
      expect(paragraph).toHaveClass("whitespace-pre-wrap");
      expect(paragraph).toHaveClass("break-words");
    });

    it("renders empty content gracefully", () => {
      render(<MessageBubble role={MessageRole.USER} content="" />);

      const container = screen.getByLabelText("Message from user");
      expect(container).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels for user messages", () => {
      render(
        <MessageBubble role={MessageRole.USER} content="Accessible message" />
      );

      expect(screen.getByLabelText("Message from user")).toBeInTheDocument();
    });

    it("has proper ARIA labels for assistant messages with agent", () => {
      render(
        <MessageBubble
          role={MessageRole.ASSISTANT}
          content="Agent message"
          agent={AgentId.BILLING}
        />
      );

      expect(screen.getByLabelText("Message from billing")).toBeInTheDocument();
    });

    it("has proper ARIA labels for assistant messages without agent", () => {
      render(
        <MessageBubble role={MessageRole.ASSISTANT} content="Generic message" />
      );

      expect(
        screen.getByLabelText("Message from assistant")
      ).toBeInTheDocument();
    });
  });
});
