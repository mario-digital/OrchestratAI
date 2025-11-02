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

  it("renders all 4 agent cards", async () => {
    renderWithProvider();

    expect(await screen.findByText("Orchestrator")).toBeInTheDocument();
    expect(await screen.findByText("Billing Agent")).toBeInTheDocument();
    expect(await screen.findByText("Technical Agent")).toBeInTheDocument();
    expect(await screen.findByText("Policy Agent")).toBeInTheDocument();
  });

  it("renders agents in the correct order", async () => {
    renderWithProvider();

    const agentNames = (await screen.findAllByRole("heading", { level: 3 }))
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

  it("all agents start with IDLE status", async () => {
    renderWithProvider();

    expect(await screen.findByText("Agent Pipeline")).toBeInTheDocument();
    const idleBadges = await screen.findAllByText("IDLE");
    expect(idleBadges).toHaveLength(4);
  });

  it("displays all 4 agents from context", async () => {
    renderWithProvider();

    expect(await screen.findByText("Orchestrator")).toBeInTheDocument();
    expect(await screen.findByText("Billing Agent")).toBeInTheDocument();
    expect(await screen.findByText("Technical Agent")).toBeInTheDocument();
    expect(await screen.findByText("Policy Agent")).toBeInTheDocument();
  });

  it("displays agent status badges for all agents", async () => {
    renderWithProvider();

    // All should be IDLE initially
    const idleBadges = await screen.findAllByText("IDLE");
    expect(idleBadges).toHaveLength(4);
  });

  it("displays agent models for all agents", async () => {
    renderWithProvider();

    const modelTexts = await screen.findAllByText("OpenAI GPT-4o");
    expect(modelTexts).toHaveLength(4);
  });
});
