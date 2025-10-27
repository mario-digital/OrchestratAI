// @vitest-environment jsdom

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AgentCard } from "@/components/panels/agent-card";
import { AgentId, AgentStatus, RetrievalStrategy } from "@/lib/enums";

describe("AgentCard", () => {
  const defaultProps = {
    agentId: AgentId.ORCHESTRATOR,
    name: "Orchestrator Agent",
    status: AgentStatus.IDLE,
    model: "OpenAI GPT-4o",
    strategy: null,
    metrics: {
      tokens: 450,
      cost: 0.0023,
      latency: 1200,
    },
    cacheStatus: "hit" as const,
  };

  it("renders agent name correctly", () => {
    render(<AgentCard {...defaultProps} />);

    expect(screen.getByText("Orchestrator Agent")).toBeInTheDocument();
  });

  it("displays correct model name", () => {
    render(<AgentCard {...defaultProps} />);

    expect(screen.getByText("OpenAI GPT-4o")).toBeInTheDocument();
  });

  it("shows strategy badge when strategy is provided", () => {
    render(<AgentCard {...defaultProps} strategy={RetrievalStrategy.PURE_RAG} />);

    expect(screen.getByText("Pure RAG")).toBeInTheDocument();
  });

  it("hides strategy badge when strategy is null", () => {
    render(<AgentCard {...defaultProps} strategy={null} />);

    expect(screen.queryByText(/RAG|CAG|Hybrid/)).not.toBeInTheDocument();
  });

  it("applies correct border color based on agent (Orchestrator - cyan)", () => {
    const { container } = render(<AgentCard {...defaultProps} />);

    const card = container.querySelector('[style*="border-left-color"]');
    expect(card).toBeInTheDocument();
  });

  it("applies correct border color based on agent (Billing - green)", () => {
    const { container } = render(
      <AgentCard
        {...defaultProps}
        agentId={AgentId.BILLING}
        name="Billing Agent"
      />
    );

    const card = container.querySelector('[style*="border-left-color"]');
    expect(card).toBeInTheDocument();
  });

  it("applies correct border color based on agent (Technical - blue)", () => {
    const { container } = render(
      <AgentCard
        {...defaultProps}
        agentId={AgentId.TECHNICAL}
        name="Technical Agent"
      />
    );

    const card = container.querySelector('[style*="border-left-color"]');
    expect(card).toBeInTheDocument();
  });

  it("applies correct border color based on agent (Policy - purple)", () => {
    const { container } = render(
      <AgentCard
        {...defaultProps}
        agentId={AgentId.POLICY}
        name="Policy Agent"
      />
    );

    const card = container.querySelector('[style*="border-left-color"]');
    expect(card).toBeInTheDocument();
  });

  it("includes hover effect class", () => {
    const { container } = render(<AgentCard {...defaultProps} />);

    const card = container.querySelector(".hover\\:shadow-md");
    expect(card).toBeInTheDocument();
  });

  it("includes transition classes", () => {
    const { container } = render(<AgentCard {...defaultProps} />);

    const card = container.querySelector(".transition-shadow");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("duration-200");
  });

  it("renders AgentStatusBadge component", () => {
    render(<AgentCard {...defaultProps} status={AgentStatus.ACTIVE} />);

    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("displays agent icon with first letter of name", () => {
    render(<AgentCard {...defaultProps} name="Orchestrator Agent" />);

    expect(screen.getByText("O")).toBeInTheDocument();
  });

  it("renders all strategy types correctly", () => {
    const { rerender } = render(
      <AgentCard {...defaultProps} strategy={RetrievalStrategy.PURE_RAG} />
    );
    expect(screen.getByText("Pure RAG")).toBeInTheDocument();

    rerender(<AgentCard {...defaultProps} strategy={RetrievalStrategy.PURE_CAG} />);
    expect(screen.getByText("Pure CAG")).toBeInTheDocument();

    rerender(
      <AgentCard {...defaultProps} strategy={RetrievalStrategy.HYBRID_RAG_CAG} />
    );
    expect(screen.getByText("Hybrid RAG/CAG")).toBeInTheDocument();
  });

  it("applies correct strategy badge colors for RAG", () => {
    render(
      <AgentCard {...defaultProps} strategy={RetrievalStrategy.PURE_RAG} />
    );

    const badge = screen.getByText("Pure RAG");
    expect(badge).toHaveClass("bg-agent-card-border-purple/20");
    expect(badge).toHaveClass("text-agent-card-text-purple");
  });

  it("applies correct strategy badge colors for CAG", () => {
    render(
      <AgentCard {...defaultProps} strategy={RetrievalStrategy.PURE_CAG} />
    );

    const badge = screen.getByText("Pure CAG");
    expect(badge).toHaveClass("bg-agent-card-border-cyan/20");
    expect(badge).toHaveClass("text-agent-card-text-cyan");
  });

  it("applies correct strategy badge colors for Hybrid", () => {
    render(
      <AgentCard {...defaultProps} strategy={RetrievalStrategy.HYBRID_RAG_CAG} />
    );

    const badge = screen.getByText("Hybrid RAG/CAG");
    expect(badge).toHaveClass("bg-agent-card-border-blue/20");
    expect(badge).toHaveClass("text-agent-card-text-blue");
  });

  // Integration tests with AgentMetrics component
  describe("AgentMetrics Integration", () => {
    it("renders AgentMetrics component with correct metrics", () => {
      render(<AgentCard {...defaultProps} />);

      expect(screen.getByText("450 tokens")).toBeInTheDocument();
      expect(screen.getByText("$0.0023")).toBeInTheDocument();
      expect(screen.getByText("1,200ms")).toBeInTheDocument();
    });

    it("passes cache status to AgentMetrics component", () => {
      const { container } = render(<AgentCard {...defaultProps} cacheStatus="hit" />);

      const cacheIcon = container.querySelector(".text-cache-hit");
      expect(cacheIcon).toBeInTheDocument();
    });

    it("renders AgentMetrics with different cache statuses", () => {
      const { container, rerender } = render(
        <AgentCard {...defaultProps} cacheStatus="miss" />
      );

      let cacheIcon = container.querySelector(".text-cache-miss");
      expect(cacheIcon).toBeInTheDocument();

      rerender(<AgentCard {...defaultProps} cacheStatus="none" />);
      cacheIcon = container.querySelector(".text-cache-none");
      expect(cacheIcon).toBeInTheDocument();
    });

    it("updates metrics when props change", () => {
      const { rerender } = render(<AgentCard {...defaultProps} />);

      expect(screen.getByText("450 tokens")).toBeInTheDocument();

      rerender(
        <AgentCard
          {...defaultProps}
          metrics={{
            tokens: 1000,
            cost: 0.005,
            latency: 2500,
          }}
        />
      );

      expect(screen.getByText("1,000 tokens")).toBeInTheDocument();
      expect(screen.getByText("$0.0050")).toBeInTheDocument();
      expect(screen.getByText("2,500ms")).toBeInTheDocument();
    });

    it("renders separator between strategy and metrics", () => {
      const { container } = render(
        <AgentCard {...defaultProps} strategy={RetrievalStrategy.PURE_RAG} />
      );

      // Separator component from shadcn should be present
      const separator = container.querySelector('[data-orientation="horizontal"]');
      expect(separator).toBeInTheDocument();
    });

    it("displays all four metric labels correctly", () => {
      render(<AgentCard {...defaultProps} />);

      expect(screen.getByText("Tokens")).toBeInTheDocument();
      expect(screen.getByText("Cost")).toBeInTheDocument();
      expect(screen.getByText("Latency")).toBeInTheDocument();
      expect(screen.getByText("Cache")).toBeInTheDocument();
    });

    it("handles zero metrics correctly", () => {
      render(
        <AgentCard
          {...defaultProps}
          metrics={{
            tokens: 0,
            cost: 0,
            latency: 0,
          }}
          cacheStatus="none"
        />
      );

      expect(screen.getByText("0 tokens")).toBeInTheDocument();
      expect(screen.getByText("$0.0000")).toBeInTheDocument();
      expect(screen.getByText("0ms")).toBeInTheDocument();
    });

    it("handles large metrics with proper formatting", () => {
      render(
        <AgentCard
          {...defaultProps}
          metrics={{
            tokens: 1234567,
            cost: 12.3456,
            latency: 125000,
          }}
        />
      );

      expect(screen.getByText("1,234,567 tokens")).toBeInTheDocument();
      expect(screen.getByText("$12.3456")).toBeInTheDocument();
      expect(screen.getByText("125,000ms")).toBeInTheDocument();
    });

    it("renders complete agent card layout with all components", () => {
      render(
        <AgentCard
          {...defaultProps}
          status={AgentStatus.ACTIVE}
          strategy={RetrievalStrategy.HYBRID_RAG_CAG}
        />
      );

      // Verify all major components are present
      expect(screen.getByText("Orchestrator Agent")).toBeInTheDocument(); // Name
      expect(screen.getByText("O")).toBeInTheDocument(); // Icon
      expect(screen.getByText("Active")).toBeInTheDocument(); // Status
      expect(screen.getByText("OpenAI GPT-4o")).toBeInTheDocument(); // Model
      expect(screen.getByText("Hybrid RAG/CAG")).toBeInTheDocument(); // Strategy
      expect(screen.getByText("450 tokens")).toBeInTheDocument(); // Metrics
      expect(screen.getByText("$0.0023")).toBeInTheDocument();
      expect(screen.getByText("1,200ms")).toBeInTheDocument();
    });
  });
});
