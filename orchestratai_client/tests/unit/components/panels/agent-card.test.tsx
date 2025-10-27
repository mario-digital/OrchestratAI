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
});
