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

    const card = container.querySelector('[class*="border-agent"]');
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

    const card = container.querySelector('[class*="border-agent"]');
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

    const card = container.querySelector('[class*="border-agent"]');
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

    const card = container.querySelector('[class*="border-agent"]');
    expect(card).toBeInTheDocument();
  });

  it("includes transition classes", () => {
    const { container } = render(<AgentCard {...defaultProps} />);

    const card = container.querySelector('[class*="transition"]');
    expect(card).toBeInTheDocument();
  });

  it("renders AgentStatusBadge component", () => {
    render(<AgentCard {...defaultProps} status={AgentStatus.ACTIVE} />);

    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
  });

  it("displays agent icon", () => {
    const { container } = render(<AgentCard {...defaultProps} name="Orchestrator Agent" />);

    // Check for SVG icon instead of first letter
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
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

  it("displays strategy for RAG", () => {
    render(
      <AgentCard {...defaultProps} strategy={RetrievalStrategy.PURE_RAG} />
    );

    expect(screen.getByText("Pure RAG")).toBeInTheDocument();
  });

  it("displays strategy for CAG", () => {
    render(
      <AgentCard {...defaultProps} strategy={RetrievalStrategy.PURE_CAG} />
    );

    expect(screen.getByText("Pure CAG")).toBeInTheDocument();
  });

  it("displays strategy for Hybrid", () => {
    render(
      <AgentCard {...defaultProps} strategy={RetrievalStrategy.HYBRID_RAG_CAG} />
    );

    expect(screen.getByText("Hybrid RAG/CAG")).toBeInTheDocument();
  });

  // Integration tests with metrics display
  describe("Metrics Display", () => {
    it("renders metrics for ACTIVE agents", () => {
      render(<AgentCard {...defaultProps} status={AgentStatus.ACTIVE} />);

      expect(screen.getByText("450")).toBeInTheDocument();
      expect(screen.getByText("$0.0023")).toBeInTheDocument();
    });

    it("does not display metrics for IDLE agents", () => {
      render(<AgentCard {...defaultProps} status={AgentStatus.IDLE} />);

      // Metrics should not be displayed for IDLE agents
      expect(screen.queryByText("450")).not.toBeInTheDocument();
      expect(screen.queryByText("$0.0023")).not.toBeInTheDocument();
    });

    it("updates metrics when props change", () => {
      const { rerender } = render(<AgentCard {...defaultProps} status={AgentStatus.ACTIVE} />);

      expect(screen.getByText("450")).toBeInTheDocument();

      rerender(
        <AgentCard
          {...defaultProps}
          status={AgentStatus.ACTIVE}
          metrics={{
            tokens: 1000,
            cost: 0.005,
            latency: 2500,
          }}
        />
      );

      expect(screen.getByText("1,000")).toBeInTheDocument();
      expect(screen.getByText("$0.0050")).toBeInTheDocument();
    });

    it("displays metric labels correctly for ACTIVE agents", () => {
      render(<AgentCard {...defaultProps} status={AgentStatus.ACTIVE} />);

      expect(screen.getByText("Tokens:")).toBeInTheDocument();
      expect(screen.getByText("Cost:")).toBeInTheDocument();
      expect(screen.getByText("Cache:")).toBeInTheDocument();
    });

    it("handles zero metrics correctly", () => {
      render(
        <AgentCard
          {...defaultProps}
          status={AgentStatus.ACTIVE}
          metrics={{
            tokens: 0,
            cost: 0,
            latency: 0,
          }}
          cacheStatus="none"
        />
      );

      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("$0.0000")).toBeInTheDocument();
    });

    it("handles large metrics with proper formatting", () => {
      render(
        <AgentCard
          {...defaultProps}
          status={AgentStatus.ACTIVE}
          metrics={{
            tokens: 1234567,
            cost: 12.3456,
            latency: 125000,
          }}
        />
      );

      expect(screen.getByText("1,234,567")).toBeInTheDocument();
      expect(screen.getByText("$12.3456")).toBeInTheDocument();
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
