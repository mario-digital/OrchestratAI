import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AgentCardSkeleton } from "../agent-card-skeleton";

describe("AgentCardSkeleton", () => {
  it("should render without errors", () => {
    const { container } = render(<AgentCardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should have accessibility attributes", () => {
    const { container } = render(<AgentCardSkeleton />);
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveAttribute("aria-busy", "true");
    expect(card).toHaveAttribute("aria-label", "Loading agent card");
  });

  it("should render correct number of skeleton elements", () => {
    const { container } = render(<AgentCardSkeleton />);

    // Count skeleton elements (should have multiple for different parts)
    const skeletons = container.querySelectorAll(
      '[aria-busy="true"][aria-live="polite"]'
    );

    // Should have:
    // - Icon skeleton
    // - Agent name skeleton
    // - Status badge skeleton
    // - Model name skeleton
    // - Strategy label skeleton
    // - Strategy value skeleton
    expect(skeletons.length).toBe(6);
  });

  it("should match AgentCard layout structure", () => {
    const { container } = render(<AgentCardSkeleton />);

    // Should have elements with flex layout (header) and space-y-2 (content)
    const headerElements = container.querySelectorAll(".flex.flex-row");
    const contentElements = container.querySelectorAll(".space-y-2");

    expect(headerElements.length).toBeGreaterThan(0);
    expect(contentElements.length).toBeGreaterThan(0);
  });

  it("should have correct skeleton dimensions for icon", () => {
    const { container } = render(<AgentCardSkeleton />);

    // Icon skeleton should be size-4 (16px square)
    const iconSkeleton = container.querySelector(".size-4");
    expect(iconSkeleton).toBeInTheDocument();
    expect(iconSkeleton).toHaveClass("rounded-sm");
  });

  it("should have correct skeleton dimensions for agent name", () => {
    const { container } = render(<AgentCardSkeleton />);

    // Agent name skeleton should be h-4 w-24
    const nameSkeleton = container.querySelector(".h-4.w-24");
    expect(nameSkeleton).toBeInTheDocument();
  });

  it("should have correct skeleton dimensions for status badge", () => {
    const { container } = render(<AgentCardSkeleton />);

    // Status badge skeleton should be h-5 w-16 rounded-full
    const badgeSkeleton = container.querySelector(".h-5.w-16.rounded-full");
    expect(badgeSkeleton).toBeInTheDocument();
  });

  it("should have strategy row skeleton", () => {
    const { container } = render(<AgentCardSkeleton />);

    // Strategy row should have label and value skeletons
    const strategyLabel = container.querySelector(".h-4.w-16");
    const strategyValue = container.querySelector(".h-4.w-12");

    expect(strategyLabel).toBeInTheDocument();
    expect(strategyValue).toBeInTheDocument();
  });

  it("should use consistent spacing", () => {
    const { container } = render(<AgentCardSkeleton />);

    // CardContent should have space-y-2 class
    const content = container.querySelector(".space-y-2");
    expect(content).toBeInTheDocument();
  });

  it("should apply correct card background and border", () => {
    const { container } = render(<AgentCardSkeleton />);
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveClass("bg-bg-primary");
    expect(card).toHaveClass("border-border-default");
  });
});
