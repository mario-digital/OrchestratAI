/**
 * Unit tests for TypingIndicator component
 * Tests agent name display, animations, and accessibility
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TypingIndicator } from "../typing-indicator";
import { AgentId } from "@/lib/enums";

describe("TypingIndicator", () => {
  describe("Agent Name Display", () => {
    it("displays agent name with typing text", () => {
      render(
        <TypingIndicator agentName="Billing Agent" agentId={AgentId.BILLING} />
      );

      expect(screen.getByText("Billing Agent is typing")).toBeInTheDocument();
    });

    it("displays correct name for orchestrator agent", () => {
      render(
        <TypingIndicator
          agentName="Orchestrator Agent"
          agentId={AgentId.ORCHESTRATOR}
        />
      );

      expect(
        screen.getByText("Orchestrator Agent is typing")
      ).toBeInTheDocument();
    });

    it("displays correct name for technical agent", () => {
      render(
        <TypingIndicator
          agentName="Technical Support"
          agentId={AgentId.TECHNICAL}
        />
      );

      expect(
        screen.getByText("Technical Support is typing")
      ).toBeInTheDocument();
    });

    it("displays correct name for policy agent", () => {
      render(
        <TypingIndicator agentName="Policy Agent" agentId={AgentId.POLICY} />
      );

      expect(screen.getByText("Policy Agent is typing")).toBeInTheDocument();
    });
  });

  describe("Animated Dots", () => {
    const renderIndicator = () =>
      render(
        <TypingIndicator agentName="Test Agent" agentId={AgentId.BILLING} />
      );

    it("renders three animated dots", () => {
      renderIndicator();
      expect(screen.getAllByTestId("typing-dot")).toHaveLength(3);
    });

    it("applies base styling to the dots", () => {
      renderIndicator();
      screen.getAllByTestId("typing-dot").forEach((dot) => {
        expect(dot).toHaveClass("rounded-full");
        expect(dot).toHaveClass("bg-current");
      });
    });

    it("applies staggered animation delays", () => {
      renderIndicator();
      const dots = screen.getAllByTestId("typing-dot");

      expect((dots[0] as HTMLElement).style.animationDelay).toBe("0ms");
      expect((dots[1] as HTMLElement).style.animationDelay).toBe("150ms");
      expect((dots[2] as HTMLElement).style.animationDelay).toBe("300ms");
    });

    it("uses design token for animation duration", () => {
      renderIndicator();
      const firstDot = screen.getAllByTestId("typing-dot")[0] as HTMLElement;

      expect(firstDot.style.animationDuration).toBe("var(--duration-slow)");
    });

    it("dots are hidden from screen readers", () => {
      renderIndicator();

      const wrapper = screen.getByLabelText(
        "Test Agent is composing a response"
      );
      const dotsContainer = wrapper.querySelector('[aria-hidden="true"]');
      expect(dotsContainer).toBeInTheDocument();
      expect(
        dotsContainer?.querySelectorAll('[data-testid="typing-dot"]').length
      ).toBe(3);
    });
  });

  describe("Agent Color Theming", () => {
    it("applies agent-specific color for orchestrator", () => {
      const { container } = render(
        <TypingIndicator
          agentName="Orchestrator"
          agentId={AgentId.ORCHESTRATOR}
        />
      );

      const wrapper = container.querySelector('[aria-live="assertive"]');
      expect(wrapper).toHaveStyle({
        color: "var(--color-agent-card-text-cyan)",
      });
    });

    it("applies agent-specific color for billing", () => {
      const { container } = render(
        <TypingIndicator agentName="Billing" agentId={AgentId.BILLING} />
      );

      const wrapper = container.querySelector('[aria-live="assertive"]');
      expect(wrapper).toHaveStyle({
        color: "var(--color-agent-card-text-green)",
      });
    });

    it("applies agent-specific color for technical", () => {
      const { container } = render(
        <TypingIndicator agentName="Technical" agentId={AgentId.TECHNICAL} />
      );

      const wrapper = container.querySelector('[aria-live="assertive"]');
      expect(wrapper).toHaveStyle({
        color: "var(--color-agent-card-text-blue)",
      });
    });

    it("applies agent-specific color for policy", () => {
      const { container } = render(
        <TypingIndicator agentName="Policy" agentId={AgentId.POLICY} />
      );

      const wrapper = container.querySelector('[aria-live="assertive"]');
      expect(wrapper).toHaveStyle({
        color: "var(--color-agent-card-text-purple)",
      });
    });
  });

  describe("Accessibility", () => {
    it("has aria-live region set to assertive", () => {
      const { container } = render(
        <TypingIndicator agentName="Test Agent" agentId={AgentId.BILLING} />
      );

      const liveRegion = container.querySelector('[aria-live="assertive"]');
      expect(liveRegion).toBeInTheDocument();
    });

    it("has descriptive aria-label", () => {
      render(
        <TypingIndicator agentName="Billing Agent" agentId={AgentId.BILLING} />
      );

      expect(
        screen.getByLabelText("Billing Agent is composing a response")
      ).toBeInTheDocument();
    });

    it("provides different aria-labels for different agents", () => {
      const { unmount: unmount1 } = render(
        <TypingIndicator
          agentName="Orchestrator"
          agentId={AgentId.ORCHESTRATOR}
        />
      );
      expect(
        screen.getByLabelText("Orchestrator is composing a response")
      ).toBeInTheDocument();
      unmount1();

      const { unmount: unmount2 } = render(
        <TypingIndicator
          agentName="Technical Support"
          agentId={AgentId.TECHNICAL}
        />
      );
      expect(
        screen.getByLabelText("Technical Support is composing a response")
      ).toBeInTheDocument();
      unmount2();
    });

    it("announces immediately to screen readers", () => {
      const { container } = render(
        <TypingIndicator agentName="Test Agent" agentId={AgentId.BILLING} />
      );

      const liveRegion = container.querySelector('[aria-live="assertive"]');
      expect(liveRegion).toHaveAttribute("aria-live", "assertive");
    });
  });

  describe("Visual Structure", () => {
    it("renders with flex layout", () => {
      const { container } = render(
        <TypingIndicator agentName="Test Agent" agentId={AgentId.BILLING} />
      );

      const wrapper = container.querySelector('[aria-live="assertive"]');
      expect(wrapper).toHaveClass("flex");
      expect(wrapper).toHaveClass("items-center");
      expect(wrapper).toHaveClass("gap-2");
    });

    it("applies correct padding", () => {
      const { container } = render(
        <TypingIndicator agentName="Test Agent" agentId={AgentId.BILLING} />
      );

      const wrapper = container.querySelector('[aria-live="assertive"]');
      expect(wrapper).toHaveClass("px-4");
      expect(wrapper).toHaveClass("py-3");
    });

    it("text has correct styling", () => {
      const { container } = render(
        <TypingIndicator agentName="Test Agent" agentId={AgentId.BILLING} />
      );

      const text = container.querySelector("span");
      expect(text).toHaveClass("text-sm");
      expect(text).toHaveClass("font-medium");
    });

    it("dots are circular with correct size", () => {
      const { container } = render(
        <TypingIndicator agentName="Test Agent" agentId={AgentId.BILLING} />
      );

      const dots = container.querySelectorAll(".animate-bounce");
      dots.forEach((dot) => {
        expect(dot).toHaveClass("h-2");
        expect(dot).toHaveClass("w-2");
        expect(dot).toHaveClass("rounded-full");
        expect(dot).toHaveClass("bg-current");
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles very long agent names", () => {
      render(
        <TypingIndicator
          agentName="Very Long Agent Name That Should Still Display Properly"
          agentId={AgentId.BILLING}
        />
      );

      expect(
        screen.getByText(
          "Very Long Agent Name That Should Still Display Properly is typing"
        )
      ).toBeInTheDocument();
    });

    it("handles short agent names", () => {
      render(<TypingIndicator agentName="AI" agentId={AgentId.BILLING} />);

      expect(screen.getByText("AI is typing")).toBeInTheDocument();
    });

    it("handles agent names with special characters", () => {
      render(
        <TypingIndicator
          agentName="Agent-123 (Beta)"
          agentId={AgentId.TECHNICAL}
        />
      );

      expect(
        screen.getByText("Agent-123 (Beta) is typing")
      ).toBeInTheDocument();
    });
  });
});
