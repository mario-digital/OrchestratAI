// @vitest-environment jsdom

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AgentPanel } from "@/components/panels/agent-panel";
import { ChatProvider } from "@/components/providers/chat-provider";

describe("AgentPanel", () => {
  // Helper function to render with ChatProvider
  const renderWithProvider = () => {
    return render(
      <ChatProvider>
        <AgentPanel />
      </ChatProvider>
    );
  };

  it('displays "Agent Pipeline" header', () => {
    renderWithProvider();

    expect(screen.getByText("Agent Pipeline")).toBeInTheDocument();
  });

  it("renders all 4 agent cards", () => {
    renderWithProvider();

    expect(screen.getByText("Orchestrator")).toBeInTheDocument();
    expect(screen.getByText("Billing Agent")).toBeInTheDocument();
    expect(screen.getByText("Technical Agent")).toBeInTheDocument();
    expect(screen.getByText("Policy Agent")).toBeInTheDocument();
  });

  it("renders agents in the correct order", () => {
    renderWithProvider();

    const agentNames = screen
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent);

    expect(agentNames).toEqual([
      "Orchestrator",
      "Billing Agent",
      "Technical Agent",
      "Policy Agent",
    ]);
  });

  it("container has scrollable content", () => {
    const { container } = renderWithProvider();

    const scrollContainer = container.querySelector('[data-slot="scroll-area-viewport"]');
    expect(scrollContainer).toBeInTheDocument();
  });

  it("container has h-full class for full height", () => {
    const { container } = renderWithProvider();

    const mainContainer = container.querySelector(".h-full");
    expect(mainContainer).toBeInTheDocument();
  });

  it("applies correct spacing classes", () => {
    const { container } = renderWithProvider();

    const contentContainer = container.querySelector(".flex.flex-col");
    expect(contentContainer).toBeInTheDocument();
  });

  it("all agents start with IDLE status", () => {
    renderWithProvider();

    expect(screen.getByText("Agent Pipeline")).toBeInTheDocument();
    const idleBadges = screen.getAllByText("IDLE");
    expect(idleBadges).toHaveLength(4);
  });

  it("displays all 4 agents from context", () => {
    renderWithProvider();

    expect(screen.getByText("Orchestrator")).toBeInTheDocument();
    expect(screen.getByText("Billing Agent")).toBeInTheDocument();
    expect(screen.getByText("Technical Agent")).toBeInTheDocument();
    expect(screen.getByText("Policy Agent")).toBeInTheDocument();
  });

  it("displays agent status badges for all agents", () => {
    renderWithProvider();

    // All should be IDLE initially
    const idleBadges = screen.getAllByText("IDLE");
    expect(idleBadges).toHaveLength(4);
  });

  it("displays agent models for all agents", () => {
    renderWithProvider();

    const modelTexts = screen.getAllByText("OpenAI GPT-4o");
    expect(modelTexts).toHaveLength(4);
  });
});
