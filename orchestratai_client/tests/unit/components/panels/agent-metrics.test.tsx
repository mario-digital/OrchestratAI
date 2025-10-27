// @vitest-environment jsdom

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AgentMetrics } from "@/components/panels/agent-metrics";

describe("AgentMetrics", () => {
  it("renders all metrics with correct formatting", () => {
    render(
      <AgentMetrics
        tokens={1234}
        cost={0.0023}
        latency={1500}
        cacheStatus="hit"
      />
    );

    expect(screen.getByText("1,234 tokens")).toBeInTheDocument();
    expect(screen.getByText("$0.0023")).toBeInTheDocument();
    expect(screen.getByText("1,500ms")).toBeInTheDocument();
  });

  it("displays zero values correctly", () => {
    render(
      <AgentMetrics
        tokens={0}
        cost={0}
        latency={0}
        cacheStatus="none"
      />
    );

    expect(screen.getByText("0 tokens")).toBeInTheDocument();
    expect(screen.getByText("$0.0000")).toBeInTheDocument();
    expect(screen.getByText("0ms")).toBeInTheDocument();
  });

  it("renders cache hit status with green icon", () => {
    const { container } = render(
      <AgentMetrics
        tokens={100}
        cost={0.001}
        latency={500}
        cacheStatus="hit"
      />
    );

    const icon = container.querySelector(".text-green-600");
    expect(icon).toBeInTheDocument();
  });

  it("renders cache miss status with yellow icon", () => {
    const { container } = render(
      <AgentMetrics
        tokens={100}
        cost={0.001}
        latency={500}
        cacheStatus="miss"
      />
    );

    const icon = container.querySelector(".text-yellow-600");
    expect(icon).toBeInTheDocument();
  });

  it("renders cache none status with gray icon", () => {
    const { container } = render(
      <AgentMetrics
        tokens={100}
        cost={0.001}
        latency={500}
        cacheStatus="none"
      />
    );

    const icon = container.querySelector(".text-gray-400");
    expect(icon).toBeInTheDocument();
  });

  it("displays metric labels correctly", () => {
    render(
      <AgentMetrics
        tokens={450}
        cost={0.0015}
        latency={1200}
        cacheStatus="hit"
      />
    );

    expect(screen.getByText("Tokens")).toBeInTheDocument();
    expect(screen.getByText("Cost")).toBeInTheDocument();
    expect(screen.getByText("Latency")).toBeInTheDocument();
    expect(screen.getByText("Cache")).toBeInTheDocument();
  });

  it("applies correct text styling for labels", () => {
    const { container } = render(
      <AgentMetrics
        tokens={100}
        cost={0.001}
        latency={500}
        cacheStatus="hit"
      />
    );

    const labels = container.querySelectorAll(".text-text-tertiary");
    expect(labels.length).toBeGreaterThan(0);
  });

  it("applies correct text styling for values", () => {
    const { container } = render(
      <AgentMetrics
        tokens={100}
        cost={0.001}
        latency={500}
        cacheStatus="hit"
      />
    );

    const values = container.querySelectorAll(".text-text-primary");
    expect(values.length).toBeGreaterThan(0);
  });

  it("uses grid layout with correct classes", () => {
    const { container } = render(
      <AgentMetrics
        tokens={100}
        cost={0.001}
        latency={500}
        cacheStatus="hit"
      />
    );

    const grid = container.querySelector(".grid.grid-cols-2.gap-2.py-2");
    expect(grid).toBeInTheDocument();
  });

  it("formats large token counts correctly", () => {
    render(
      <AgentMetrics
        tokens={1234567}
        cost={0.5}
        latency={10000}
        cacheStatus="hit"
      />
    );

    expect(screen.getByText("1,234,567 tokens")).toBeInTheDocument();
  });

  it("formats cost with 4 decimal places", () => {
    render(
      <AgentMetrics
        tokens={100}
        cost={1.23456}
        latency={500}
        cacheStatus="hit"
      />
    );

    expect(screen.getByText("$1.2346")).toBeInTheDocument();
  });

  it("formats latency with comma separators", () => {
    render(
      <AgentMetrics
        tokens={100}
        cost={0.001}
        latency={125000}
        cacheStatus="hit"
      />
    );

    expect(screen.getByText("125,000ms")).toBeInTheDocument();
  });
});
