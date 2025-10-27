// @vitest-environment jsdom

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AgentCard } from "@/components/panels/agent-card";
import { AgentId, AgentStatus, RetrievalStrategy } from "@/lib/enums";

/**
 * Integration Test: Metrics Accumulation Across Multiple Messages
 *
 * This test validates AC6: "Metrics accumulate correctly across multiple messages"
 *
 * Simulates an agent processing multiple messages in a session and verifies
 * that the metrics (tokens, cost, latency) accumulate properly.
 */
describe("Metrics Accumulation Integration", () => {
  it("accumulates tokens across multiple agent messages", () => {
    // Simulate initial state after first message
    const { rerender } = render(
      <AgentCard
        agentId={AgentId.ORCHESTRATOR}
        name="Orchestrator Agent"
        status={AgentStatus.ACTIVE}
        model="OpenAI GPT-4o"
        strategy={RetrievalStrategy.PURE_RAG}
        metrics={{
          tokens: 450,
          cost: 0.0023,
          latency: 1200,
        }}
        cacheStatus="miss"
      />
    );

    // Verify initial metrics
    expect(screen.getByText("450 tokens")).toBeInTheDocument();
    expect(screen.getByText("$0.0023")).toBeInTheDocument();
    expect(screen.getByText("1,200ms")).toBeInTheDocument();

    // Simulate second message - metrics should accumulate
    rerender(
      <AgentCard
        agentId={AgentId.ORCHESTRATOR}
        name="Orchestrator Agent"
        status={AgentStatus.ACTIVE}
        model="OpenAI GPT-4o"
        strategy={RetrievalStrategy.PURE_RAG}
        metrics={{
          tokens: 450 + 320, // First message + second message
          cost: 0.0023 + 0.0016, // Accumulated cost
          latency: 1200 + 980, // Total latency
        }}
        cacheStatus="miss"
      />
    );

    // Verify accumulated metrics
    expect(screen.getByText("770 tokens")).toBeInTheDocument();
    expect(screen.getByText("$0.0039")).toBeInTheDocument();
    expect(screen.getByText("2,180ms")).toBeInTheDocument();

    // Simulate third message - continue accumulation
    rerender(
      <AgentCard
        agentId={AgentId.ORCHESTRATOR}
        name="Orchestrator Agent"
        status={AgentStatus.ACTIVE}
        model="OpenAI GPT-4o"
        strategy={RetrievalStrategy.PURE_RAG}
        metrics={{
          tokens: 770 + 280, // Previous + third message
          cost: 0.0039 + 0.0014,
          latency: 2180 + 850,
        }}
        cacheStatus="hit"
      />
    );

    // Verify final accumulated metrics
    expect(screen.getByText("1,050 tokens")).toBeInTheDocument();
    expect(screen.getByText("$0.0053")).toBeInTheDocument();
    expect(screen.getByText("3,030ms")).toBeInTheDocument();
  });

  it("accumulates metrics correctly with cache hits reducing cost", () => {
    // First message - cache miss, full cost
    const { rerender } = render(
      <AgentCard
        agentId={AgentId.TECHNICAL}
        name="Technical Agent"
        status={AgentStatus.ACTIVE}
        model="OpenAI GPT-4o"
        strategy={RetrievalStrategy.HYBRID_RAG_CAG}
        metrics={{
          tokens: 500,
          cost: 0.0025,
          latency: 1500,
        }}
        cacheStatus="miss"
      />
    );

    expect(screen.getByText("500 tokens")).toBeInTheDocument();
    expect(screen.getByText("$0.0025")).toBeInTheDocument();

    // Second message - cache hit, lower incremental cost
    rerender(
      <AgentCard
        agentId={AgentId.TECHNICAL}
        name="Technical Agent"
        status={AgentStatus.ACTIVE}
        model="OpenAI GPT-4o"
        strategy={RetrievalStrategy.HYBRID_RAG_CAG}
        metrics={{
          tokens: 500 + 500, // Same tokens
          cost: 0.0025 + 0.0005, // But lower cost due to cache
          latency: 1500 + 600, // Faster response
        }}
        cacheStatus="hit"
      />
    );

    expect(screen.getByText("1,000 tokens")).toBeInTheDocument();
    expect(screen.getByText("$0.0030")).toBeInTheDocument();
    expect(screen.getByText("2,100ms")).toBeInTheDocument();
  });

  it("handles accumulation with zero incremental metrics", () => {
    // Initial state
    const { rerender } = render(
      <AgentCard
        agentId={AgentId.BILLING}
        name="Billing Agent"
        status={AgentStatus.ACTIVE}
        model="OpenAI GPT-4o"
        strategy={null}
        metrics={{
          tokens: 300,
          cost: 0.0015,
          latency: 800,
        }}
        cacheStatus="none"
      />
    );

    expect(screen.getByText("300 tokens")).toBeInTheDocument();

    // Second message with zero incremental tokens (edge case)
    rerender(
      <AgentCard
        agentId={AgentId.BILLING}
        name="Billing Agent"
        status={AgentStatus.ACTIVE}
        model="OpenAI GPT-4o"
        strategy={null}
        metrics={{
          tokens: 300, // No new tokens
          cost: 0.0015, // No additional cost
          latency: 800, // Same latency
        }}
        cacheStatus="none"
      />
    );

    // Metrics should remain unchanged
    expect(screen.getByText("300 tokens")).toBeInTheDocument();
    expect(screen.getByText("$0.0015")).toBeInTheDocument();
    expect(screen.getByText("800ms")).toBeInTheDocument();
  });

  it("accumulates large metrics correctly with proper formatting", () => {
    // Simulate a long conversation session
    const { rerender } = render(
      <AgentCard
        agentId={AgentId.POLICY}
        name="Policy Agent"
        status={AgentStatus.ACTIVE}
        model="OpenAI GPT-4o"
        strategy={RetrievalStrategy.PURE_CAG}
        metrics={{
          tokens: 10000,
          cost: 0.05,
          latency: 15000,
        }}
        cacheStatus="miss"
      />
    );

    expect(screen.getByText("10,000 tokens")).toBeInTheDocument();
    expect(screen.getByText("$0.0500")).toBeInTheDocument();
    expect(screen.getByText("15,000ms")).toBeInTheDocument();

    // After many more messages
    rerender(
      <AgentCard
        agentId={AgentId.POLICY}
        name="Policy Agent"
        status={AgentStatus.ACTIVE}
        model="OpenAI GPT-4o"
        strategy={RetrievalStrategy.PURE_CAG}
        metrics={{
          tokens: 50000,
          cost: 0.25,
          latency: 75000,
        }}
        cacheStatus="hit"
      />
    );

    expect(screen.getByText("50,000 tokens")).toBeInTheDocument();
    expect(screen.getByText("$0.2500")).toBeInTheDocument();
    expect(screen.getByText("75,000ms")).toBeInTheDocument();
  });

  it("displays updated cache status as metrics accumulate", () => {
    const { container, rerender } = render(
      <AgentCard
        agentId={AgentId.ORCHESTRATOR}
        name="Orchestrator Agent"
        status={AgentStatus.ACTIVE}
        model="OpenAI GPT-4o"
        strategy={null}
        metrics={{
          tokens: 100,
          cost: 0.0005,
          latency: 500,
        }}
        cacheStatus="none"
      />
    );

    // Initial cache status: none (semantic token)
    let cacheIcon = container.querySelector(".text-cache-none");
    expect(cacheIcon).toBeInTheDocument();

    // After first query: miss (semantic token)
    rerender(
      <AgentCard
        agentId={AgentId.ORCHESTRATOR}
        name="Orchestrator Agent"
        status={AgentStatus.ACTIVE}
        model="OpenAI GPT-4o"
        strategy={null}
        metrics={{
          tokens: 200,
          cost: 0.001,
          latency: 1000,
        }}
        cacheStatus="miss"
      />
    );

    cacheIcon = container.querySelector(".text-cache-miss");
    expect(cacheIcon).toBeInTheDocument();

    // After second query: hit (semantic token)
    rerender(
      <AgentCard
        agentId={AgentId.ORCHESTRATOR}
        name="Orchestrator Agent"
        status={AgentStatus.ACTIVE}
        model="OpenAI GPT-4o"
        strategy={null}
        metrics={{
          tokens: 300,
          cost: 0.0012,
          latency: 1400,
        }}
        cacheStatus="hit"
      />
    );

    cacheIcon = container.querySelector(".text-cache-hit");
    expect(cacheIcon).toBeInTheDocument();
  });

  it("accumulates metrics independently for different agents", () => {
    // Orchestrator agent
    const { container: container1 } = render(
      <AgentCard
        agentId={AgentId.ORCHESTRATOR}
        name="Orchestrator Agent"
        status={AgentStatus.ACTIVE}
        model="OpenAI GPT-4o"
        strategy={null}
        metrics={{
          tokens: 450,
          cost: 0.0023,
          latency: 1200,
        }}
        cacheStatus="hit"
      />
    );

    // Technical agent (separate metrics)
    const { container: container2 } = render(
      <AgentCard
        agentId={AgentId.TECHNICAL}
        name="Technical Agent"
        status={AgentStatus.ACTIVE}
        model="OpenAI GPT-4o"
        strategy={RetrievalStrategy.PURE_RAG}
        metrics={{
          tokens: 680,
          cost: 0.0034,
          latency: 1800,
        }}
        cacheStatus="miss"
      />
    );

    // Verify both agents maintain independent metrics
    expect(container1.textContent).toContain("450 tokens");
    expect(container1.textContent).toContain("$0.0023");
    expect(container2.textContent).toContain("680 tokens");
    expect(container2.textContent).toContain("$0.0034");
  });
});
