// @vitest-environment jsdom

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AgentStatusBadge } from "@/components/panels/agent-status-badge";
import { AgentStatus } from "@/lib/enums";

describe("AgentStatusBadge", () => {
  it("renders IDLE status with correct text and styling", () => {
    render(<AgentStatusBadge status={AgentStatus.IDLE} agentName="Test Agent" />);

    const badge = screen.getByText("IDLE");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-badge-idle-bg");
    expect(badge).toHaveClass("text-badge-idle-text");
  });

  it("renders ROUTING status with correct text and styling", () => {
    render(<AgentStatusBadge status={AgentStatus.ROUTING} agentName="Test Agent" />);

    const badge = screen.getByText("ROUTING");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-status-badge-routing-bg");
    expect(badge).toHaveClass("text-status-badge-routing-text");
  });

  it("renders ACTIVE status with correct text, styling, and pulse animation", () => {
    render(<AgentStatusBadge status={AgentStatus.ACTIVE} agentName="Test Agent" />);

    const badge = screen.getByText("ACTIVE");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-badge-active-bg");
    expect(badge).toHaveClass("text-badge-active-text");
  });

  it("renders COMPLETE status with correct text and styling", () => {
    render(<AgentStatusBadge status={AgentStatus.COMPLETE} agentName="Test Agent" />);

    const badge = screen.getByText("COMPLETE");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-status-badge-complete-bg");
    expect(badge).toHaveClass("text-status-badge-complete-text");
  });

  it("includes correct ARIA label with agent name and status", () => {
    render(<AgentStatusBadge status={AgentStatus.ACTIVE} agentName="Orchestrator" />);

    const badge = screen.getByText("ACTIVE");
    expect(badge).toHaveAttribute("aria-label", "Orchestrator status: ACTIVE");
  });

  it("applies correct size classes", () => {
    render(<AgentStatusBadge status={AgentStatus.IDLE} agentName="Test Agent" />);

    const badge = screen.getByText("IDLE");
    expect(badge).toHaveClass("text-[10px]");
    expect(badge).toHaveClass("px-2.5");
    expect(badge).toHaveClass("py-0.5");
  });
});
