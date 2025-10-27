/**
 * Unit tests for ChatProvider agent state management
 *
 * Tests the agent-related reducer actions and state updates
 */

import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ChatProvider, useChatContext } from "@/components/providers/chat-provider";
import { AgentId, AgentStatus } from "@/lib/enums";
import type { ReactNode } from "react";

// Wrapper component for testing hooks within ChatProvider
function wrapper({ children }: { children: ReactNode }) {
  return <ChatProvider>{children}</ChatProvider>;
}

describe("ChatProvider agent state management", () => {
  describe("Initial agent state", () => {
    it("initializes all agents with IDLE status and zero metrics", () => {
      const { result } = renderHook(() => useChatContext(), { wrapper });

      // Check all 4 agents are initialized
      expect(result.current.agents).toBeDefined();
      expect(Object.keys(result.current.agents)).toHaveLength(4);

      // Check Orchestrator
      expect(result.current.agents[AgentId.ORCHESTRATOR]).toEqual({
        status: AgentStatus.IDLE,
        model: "OpenAI GPT-4o",
        strategy: null,
        metrics: { tokens: 0, cost: 0, latency: 0 },
        cacheStatus: "none",
      });

      // Check Billing
      expect(result.current.agents[AgentId.BILLING]).toEqual({
        status: AgentStatus.IDLE,
        model: "OpenAI GPT-4o",
        strategy: null,
        metrics: { tokens: 0, cost: 0, latency: 0 },
        cacheStatus: "none",
      });

      // Check Technical
      expect(result.current.agents[AgentId.TECHNICAL]).toEqual({
        status: AgentStatus.IDLE,
        model: "OpenAI GPT-4o",
        strategy: null,
        metrics: { tokens: 0, cost: 0, latency: 0 },
        cacheStatus: "none",
      });

      // Check Policy
      expect(result.current.agents[AgentId.POLICY]).toEqual({
        status: AgentStatus.IDLE,
        model: "OpenAI GPT-4o",
        strategy: null,
        metrics: { tokens: 0, cost: 0, latency: 0 },
        cacheStatus: "none",
      });
    });
  });

  describe("UPDATE_AGENT_STATUS action", () => {
    it("updates single agent status without affecting others", () => {
      const { result } = renderHook(() => useChatContext(), { wrapper });

      act(() => {
        result.current.updateAgentStatus(AgentId.ORCHESTRATOR, AgentStatus.ROUTING);
      });

      // Orchestrator should be updated
      expect(result.current.agents[AgentId.ORCHESTRATOR].status).toBe(
        AgentStatus.ROUTING
      );

      // Other agents should remain IDLE
      expect(result.current.agents[AgentId.BILLING].status).toBe(AgentStatus.IDLE);
      expect(result.current.agents[AgentId.TECHNICAL].status).toBe(AgentStatus.IDLE);
      expect(result.current.agents[AgentId.POLICY].status).toBe(AgentStatus.IDLE);
    });

    it("can update agent status multiple times", () => {
      const { result } = renderHook(() => useChatContext(), { wrapper });

      // Update to ROUTING
      act(() => {
        result.current.updateAgentStatus(AgentId.BILLING, AgentStatus.ROUTING);
      });
      expect(result.current.agents[AgentId.BILLING].status).toBe(AgentStatus.ROUTING);

      // Update to ACTIVE
      act(() => {
        result.current.updateAgentStatus(AgentId.BILLING, AgentStatus.ACTIVE);
      });
      expect(result.current.agents[AgentId.BILLING].status).toBe(AgentStatus.ACTIVE);

      // Update to COMPLETE
      act(() => {
        result.current.updateAgentStatus(AgentId.BILLING, AgentStatus.COMPLETE);
      });
      expect(result.current.agents[AgentId.BILLING].status).toBe(AgentStatus.COMPLETE);
    });
  });

  describe("INCREMENT_AGENT_METRICS action", () => {
    it("accumulates metrics correctly across multiple increments", () => {
      const { result } = renderHook(() => useChatContext(), { wrapper });

      // First increment
      act(() => {
        result.current.incrementAgentMetrics(AgentId.BILLING, {
          tokens: 450,
          cost: 0.001,
          latency: 120,
        });
      });

      expect(result.current.agents[AgentId.BILLING].metrics).toEqual({
        tokens: 450,
        cost: 0.001,
        latency: 120,
      });

      // Second increment
      act(() => {
        result.current.incrementAgentMetrics(AgentId.BILLING, {
          tokens: 300,
          cost: 0.0005,
          latency: 80,
        });
      });

      // Metrics should be summed
      expect(result.current.agents[AgentId.BILLING].metrics).toEqual({
        tokens: 750,
        cost: 0.0015,
        latency: 200,
      });

      // Third increment
      act(() => {
        result.current.incrementAgentMetrics(AgentId.BILLING, {
          tokens: 250,
          cost: 0.0003,
          latency: 60,
        });
      });

      expect(result.current.agents[AgentId.BILLING].metrics).toEqual({
        tokens: 1000,
        cost: 0.0018,
        latency: 260,
      });
    });

    it("supports partial metric updates", () => {
      const { result } = renderHook(() => useChatContext(), { wrapper });

      // Update only tokens
      act(() => {
        result.current.incrementAgentMetrics(AgentId.TECHNICAL, {
          tokens: 100,
        });
      });

      expect(result.current.agents[AgentId.TECHNICAL].metrics).toEqual({
        tokens: 100,
        cost: 0,
        latency: 0,
      });

      // Update only cost
      act(() => {
        result.current.incrementAgentMetrics(AgentId.TECHNICAL, {
          cost: 0.002,
        });
      });

      expect(result.current.agents[AgentId.TECHNICAL].metrics).toEqual({
        tokens: 100,
        cost: 0.002,
        latency: 0,
      });
    });

    it("updates cache status when provided", () => {
      const { result } = renderHook(() => useChatContext(), { wrapper });

      act(() => {
        result.current.incrementAgentMetrics(
          AgentId.POLICY,
          { tokens: 200 },
          "hit"
        );
      });

      expect(result.current.agents[AgentId.POLICY].cacheStatus).toBe("hit");

      act(() => {
        result.current.incrementAgentMetrics(
          AgentId.POLICY,
          { tokens: 150 },
          "miss"
        );
      });

      expect(result.current.agents[AgentId.POLICY].cacheStatus).toBe("miss");
    });

    it("does not affect other agents' metrics", () => {
      const { result } = renderHook(() => useChatContext(), { wrapper });

      // Update one agent
      act(() => {
        result.current.incrementAgentMetrics(AgentId.BILLING, {
          tokens: 500,
          cost: 0.003,
          latency: 100,
        });
      });

      // Other agents should still have zero metrics
      expect(result.current.agents[AgentId.ORCHESTRATOR].metrics).toEqual({
        tokens: 0,
        cost: 0,
        latency: 0,
      });
      expect(result.current.agents[AgentId.TECHNICAL].metrics).toEqual({
        tokens: 0,
        cost: 0,
        latency: 0,
      });
      expect(result.current.agents[AgentId.POLICY].metrics).toEqual({
        tokens: 0,
        cost: 0,
        latency: 0,
      });
    });
  });

  describe("Combined agent operations", () => {
    it("handles status updates and metric increments together", () => {
      const { result } = renderHook(() => useChatContext(), { wrapper });

      // Update status
      act(() => {
        result.current.updateAgentStatus(AgentId.BILLING, AgentStatus.ACTIVE);
      });

      // Increment metrics
      act(() => {
        result.current.incrementAgentMetrics(AgentId.BILLING, {
          tokens: 300,
          cost: 0.0015,
          latency: 150,
        });
      });

      // Both should be updated
      expect(result.current.agents[AgentId.BILLING].status).toBe(AgentStatus.ACTIVE);
      expect(result.current.agents[AgentId.BILLING].metrics).toEqual({
        tokens: 300,
        cost: 0.0015,
        latency: 150,
      });

      // Complete the agent
      act(() => {
        result.current.updateAgentStatus(AgentId.BILLING, AgentStatus.COMPLETE);
      });

      expect(result.current.agents[AgentId.BILLING].status).toBe(
        AgentStatus.COMPLETE
      );
      // Metrics should persist
      expect(result.current.agents[AgentId.BILLING].metrics).toEqual({
        tokens: 300,
        cost: 0.0015,
        latency: 150,
      });
    });
  });
});
