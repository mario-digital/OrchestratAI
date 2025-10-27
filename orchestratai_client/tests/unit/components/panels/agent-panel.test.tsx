// @vitest-environment jsdom

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AgentPanel } from "@/components/panels/agent-panel";
import {
  AgentId,
  AgentStatus,
  RetrievalStrategy,
  AgentColor,
} from "@/lib/enums";
import type { Agent } from "@/lib/types";

describe("AgentPanel", () => {
  const mockAgents: Agent[] = [
    {
      id: AgentId.ORCHESTRATOR,
      name: "Orchestrator Agent",
      status: AgentStatus.ACTIVE,
      model: "OpenAI GPT-4o",
      strategy: RetrievalStrategy.HYBRID_RAG_CAG,
      color: AgentColor.CYAN,
      tokensUsed: 1200,
      cost: 0.0034,
    },
    {
      id: AgentId.BILLING,
      name: "Billing Agent",
      status: AgentStatus.IDLE,
      model: "OpenAI GPT-4o",
      strategy: RetrievalStrategy.PURE_RAG,
      color: AgentColor.GREEN,
      tokensUsed: 0,
      cost: 0,
    },
    {
      id: AgentId.TECHNICAL,
      name: "Technical Agent",
      status: AgentStatus.IDLE,
      model: "OpenAI GPT-4o",
      strategy: RetrievalStrategy.PURE_CAG,
      color: AgentColor.BLUE,
      tokensUsed: 0,
      cost: 0,
    },
    {
      id: AgentId.POLICY,
      name: "Policy Agent",
      status: AgentStatus.COMPLETE,
      model: "OpenAI GPT-4o",
      strategy: RetrievalStrategy.HYBRID_RAG_CAG,
      color: AgentColor.PURPLE,
      tokensUsed: 850,
      cost: 0.0021,
    },
  ];

  it('displays "Agent Pipeline" header', () => {
    render(<AgentPanel agents={mockAgents} />);

    expect(screen.getByText("Agent Pipeline")).toBeInTheDocument();
  });

  it("renders all 4 agent cards", () => {
    render(<AgentPanel agents={mockAgents} />);

    expect(screen.getByText("Orchestrator Agent")).toBeInTheDocument();
    expect(screen.getByText("Billing Agent")).toBeInTheDocument();
    expect(screen.getByText("Technical Agent")).toBeInTheDocument();
    expect(screen.getByText("Policy Agent")).toBeInTheDocument();
  });

  it("renders agents in the correct order", () => {
    render(<AgentPanel agents={mockAgents} />);

    const agentNames = screen
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent);

    expect(agentNames).toEqual([
      "Orchestrator Agent",
      "Billing Agent",
      "Technical Agent",
      "Policy Agent",
    ]);
  });

  it("container has overflow-y-auto for scrolling", () => {
    const { container } = render(<AgentPanel agents={mockAgents} />);

    const scrollContainer = container.querySelector(".overflow-y-auto");
    expect(scrollContainer).toBeInTheDocument();
  });

  it("container has h-full class for full height", () => {
    const { container } = render(<AgentPanel agents={mockAgents} />);

    const mainContainer = container.querySelector(".h-full");
    expect(mainContainer).toBeInTheDocument();
  });

  it("applies correct spacing classes", () => {
    const { container } = render(<AgentPanel agents={mockAgents} />);

    const mainContainer = container.querySelector(".gap-4.p-4");
    expect(mainContainer).toBeInTheDocument();
  });

  it("renders empty list when no agents provided", () => {
    render(<AgentPanel agents={[]} />);

    expect(screen.getByText("Agent Pipeline")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
  });

  it("renders single agent correctly", () => {
    const singleAgent = mockAgents.slice(0, 1);
    render(<AgentPanel agents={singleAgent} />);

    expect(screen.getByText("Orchestrator Agent")).toBeInTheDocument();
    expect(screen.queryByText("Billing Agent")).not.toBeInTheDocument();
  });

  it("displays agent status badges for all agents", () => {
    render(<AgentPanel agents={mockAgents} />);

    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getAllByText("Idle")).toHaveLength(2);
    expect(screen.getByText("Complete")).toBeInTheDocument();
  });

  it("displays agent models for all agents", () => {
    render(<AgentPanel agents={mockAgents} />);

    const modelTexts = screen.getAllByText("OpenAI GPT-4o");
    expect(modelTexts).toHaveLength(4);
  });
});
