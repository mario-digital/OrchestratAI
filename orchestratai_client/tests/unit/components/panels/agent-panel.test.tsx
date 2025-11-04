// @vitest-environment jsdom

import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { AgentPanel } from "@/components/panels/agent-panel";
import { ChatProvider } from "@/components/providers/chat-provider";
import { AgentId } from "@/lib/enums";
import { getAgentModelLabel } from "@/lib/agent-models";

const MODEL_ENV_KEYS = [
  "NEXT_PUBLIC_ORCHESTRATOR_MODEL",
  "NEXT_PUBLIC_BILLING_MODEL",
  "NEXT_PUBLIC_TECHNICAL_MODEL",
  "NEXT_PUBLIC_POLICY_MODEL",
];

const originalEnv: Record<string, string | undefined> = {};

beforeAll(() => {
  for (const key of MODEL_ENV_KEYS) {
    originalEnv[key] = process.env[key];
  }
});

beforeEach(() => {
  process.env["NEXT_PUBLIC_ORCHESTRATOR_MODEL"] = "gpt-4o";
  process.env["NEXT_PUBLIC_BILLING_MODEL"] = "gpt-4o-mini";
  process.env["NEXT_PUBLIC_TECHNICAL_MODEL"] = "gpt-4o";
  process.env["NEXT_PUBLIC_POLICY_MODEL"] = "gpt-4o-mini";
});

afterAll(() => {
  for (const key of MODEL_ENV_KEYS) {
    const value = originalEnv[key];
    if (typeof value === "undefined") {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

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

    const agentCards = [
      { id: AgentId.ORCHESTRATOR, name: "Orchestrator" },
      { id: AgentId.BILLING, name: "Billing Agent" },
      { id: AgentId.TECHNICAL, name: "Technical Agent" },
      { id: AgentId.POLICY, name: "Policy Agent" },
    ];

    for (const { id, name } of agentCards) {
      const heading = await screen.findByText(name);
      const card = heading.closest('[data-slot="card"]') ?? heading.closest("div");
      if (!(card instanceof HTMLElement)) {
        throw new Error(`Agent card container not found for ${name}`);
      }
      expect(within(card).getByText(getAgentModelLabel(id))).toBeInTheDocument();
    }
  });
});
