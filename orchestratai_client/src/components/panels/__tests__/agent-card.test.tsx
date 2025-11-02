import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AgentCard } from "../agent-card";
import { AgentId, AgentStatus, RetrievalStrategy } from "@/lib/enums";

describe("AgentCard", () => {
  const mockProps = {
    agentId: AgentId.BILLING,
    name: "Billing Agent",
    status: AgentStatus.IDLE,
    model: "OpenAI GPT-4o",
    strategy: RetrievalStrategy.PURE_RAG,
    metrics: {
      tokens: 1234,
      cost: 0.0034,
      latency: 450,
    },
    cacheStatus: "none" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render without errors", () => {
      const { container } = render(<AgentCard {...mockProps} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("Content Rendering", () => {
    it("should render agent name correctly", () => {
      render(<AgentCard {...mockProps} />);
      expect(screen.getByText("Billing Agent")).toBeInTheDocument();
    });

    it("should render model name correctly", () => {
      render(<AgentCard {...mockProps} />);
      expect(screen.getByText("OpenAI GPT-4o")).toBeInTheDocument();
    });

    it("should render strategy when in IDLE state", () => {
      render(<AgentCard {...mockProps} />);
      expect(screen.getByText("Strategy:")).toBeInTheDocument();
      expect(screen.getByText("Pure RAG")).toBeInTheDocument();
    });

    it("should render full metrics when ACTIVE", () => {
      render(<AgentCard {...mockProps} status={AgentStatus.ACTIVE} />);

      // Check for all metric labels
      expect(screen.getByText("Strategy:")).toBeInTheDocument();
      expect(screen.getByText("Cache:")).toBeInTheDocument();
      expect(screen.getByText("Tokens:")).toBeInTheDocument();
      expect(screen.getByText("Cost:")).toBeInTheDocument();

      // Check metric values
      expect(screen.getByText("1,234")).toBeInTheDocument(); // Formatted tokens
      expect(screen.getByText("$0.0034")).toBeInTheDocument();
    });

    it("should only render strategy when IDLE with strategy", () => {
      render(<AgentCard {...mockProps} />);

      // Should have strategy
      expect(screen.getByText("Strategy:")).toBeInTheDocument();

      // Should NOT have other metrics
      expect(screen.queryByText("Cache:")).not.toBeInTheDocument();
      expect(screen.queryByText("Tokens:")).not.toBeInTheDocument();
      expect(screen.queryByText("Cost:")).not.toBeInTheDocument();
    });

    it("should render nothing extra when IDLE without strategy", () => {
      render(<AgentCard {...mockProps} strategy={null} />);

      // Should NOT have any metric rows
      expect(screen.queryByText("Strategy:")).not.toBeInTheDocument();
      expect(screen.queryByText("Cache:")).not.toBeInTheDocument();
    });
  });

  describe("Agent Color Coding", () => {
    it("should apply correct class for ORCHESTRATOR", () => {
      render(
        <AgentCard
          {...mockProps}
          agentId={AgentId.ORCHESTRATOR}
          name="Orchestrator"
        />
      );

      const agentName = screen.getByText("Orchestrator");
      expect(agentName).toHaveClass("text-agent-card-text-cyan");
    });

    it("should apply correct class for BILLING", () => {
      render(<AgentCard {...mockProps} />);

      const agentName = screen.getByText("Billing Agent");
      expect(agentName).toHaveClass("text-agent-card-text-green");
    });

    it("should apply correct class for TECHNICAL", () => {
      render(
        <AgentCard
          {...mockProps}
          agentId={AgentId.TECHNICAL}
          name="Technical Agent"
        />
      );

      const agentName = screen.getByText("Technical Agent");
      expect(agentName).toHaveClass("text-agent-card-text-blue");
    });

    it("should apply correct class for POLICY", () => {
      render(
        <AgentCard
          {...mockProps}
          agentId={AgentId.POLICY}
          name="Policy Agent"
        />
      );

      const agentName = screen.getByText("Policy Agent");
      expect(agentName).toHaveClass("text-agent-card-text-purple");
    });
  });

  describe("ACTIVE State Styling", () => {
    it("should apply green background when ACTIVE", () => {
      const { container } = render(
        <AgentCard {...mockProps} status={AgentStatus.ACTIVE} />
      );

      // Find the Card element (second child after motion.div)
      const card = container.querySelector(".bg-agent-active");
      expect(card).toBeInTheDocument();
    });

    it("should apply primary background when IDLE", () => {
      const { container } = render(<AgentCard {...mockProps} />);

      const card = container.querySelector(".bg-bg-primary");
      expect(card).toBeInTheDocument();
    });
  });

  describe("React.memo Optimization", () => {
    it("should memoize component correctly", () => {
      // AgentCard is wrapped with React.memo
      // This test verifies it renders without errors
      const { rerender } = render(<AgentCard {...mockProps} />);

      // Re-render with same props should use memo
      rerender(<AgentCard {...mockProps} />);

      // Should still render correctly
      expect(screen.getByText("Billing Agent")).toBeInTheDocument();
    });
  });
});
