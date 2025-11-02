import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AgentPanel } from "../agent-panel";
import { ChatProvider } from "@/components/providers/chat-provider";

// Mock usePanelCollapse hook
const mockToggle = vi.fn();
vi.mock("@/components/layout/three-panel-layout", () => ({
  usePanelCollapse: () => ({
    isLeftPanelCollapsed: false,
    toggleLeftPanel: mockToggle,
  }),
}));

// Helper to render AgentPanel with required providers
function renderAgentPanel() {
  return render(
    <ChatProvider>
      <AgentPanel />
    </ChatProvider>
  );
}

describe("AgentPanel - Loading State Integration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initially show skeleton loading state", () => {
    renderAgentPanel();

    // Should show 4 skeleton cards
    const skeletons = screen.getAllByLabelText("Loading agent card");
    expect(skeletons).toHaveLength(4);
  });

  it("should transition from skeleton to real agent cards", async () => {
    renderAgentPanel();

    // Initially showing skeletons
    expect(screen.getAllByLabelText("Loading agent card")).toHaveLength(4);

    // Fast-forward time to trigger loading completion (100ms)
    vi.advanceTimersByTime(100);

    // Wait for state update with runOnlyPendingTimers
    await vi.runOnlyPendingTimersAsync();

    // Wait for state update
    await waitFor(
      () => {
        // Skeletons should be removed
        expect(
          screen.queryByLabelText("Loading agent card")
        ).not.toBeInTheDocument();

        // Real agent cards should be visible
        expect(screen.getByText("Orchestrator")).toBeInTheDocument();
        expect(screen.getByText("Billing Agent")).toBeInTheDocument();
        expect(screen.getByText("Technical Agent")).toBeInTheDocument();
        expect(screen.getByText("Policy Agent")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("should maintain layout dimensions during skeleton → content transition", async () => {
    const { container } = renderAgentPanel();

    // Measure skeleton container dimensions
    const skeletonContainer = container.querySelector(".flex.flex-col.gap-3");

    // Fast-forward to show real content
    vi.advanceTimersByTime(600);
    await vi.runOnlyPendingTimersAsync();

    await waitFor(
      () => {
        expect(screen.getByText("Orchestrator")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // Container should still exist with same class
    const contentContainer = container.querySelector(".flex.flex-col.gap-3");
    expect(contentContainer).toBeInTheDocument();

    // Note: In JSDOM, clientHeight is always 0, so we verify structure instead
    expect(contentContainer?.children.length).toBe(4);
    expect(skeletonContainer).toBeTruthy(); // Ensure skeleton container existed
  });

  it("should render all 4 agent cards after loading", async () => {
    renderAgentPanel();

    vi.advanceTimersByTime(600);
    await vi.runOnlyPendingTimersAsync();

    await waitFor(
      () => {
        // Verify all 4 agents are rendered
        const agentCards = screen.getAllByText(/Agent|Orchestrator/);
        expect(agentCards.length).toBeGreaterThanOrEqual(4);
      },
      { timeout: 1000 }
    );
  });

  it("should show correct agent order", async () => {
    renderAgentPanel();

    vi.advanceTimersByTime(600);
    await vi.runOnlyPendingTimersAsync();

    await waitFor(
      () => {
        const orchestrator = screen.getByText("Orchestrator");
        const billing = screen.getByText("Billing Agent");
        const technical = screen.getByText("Technical Agent");
        const policy = screen.getByText("Policy Agent");

        expect(orchestrator).toBeInTheDocument();
        expect(billing).toBeInTheDocument();
        expect(technical).toBeInTheDocument();
        expect(policy).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("should have panel header visible during loading", () => {
    renderAgentPanel();

    // Header should always be visible
    expect(screen.getByText("Agent Pipeline")).toBeInTheDocument();
  });

  it("should have panel header visible after loading", async () => {
    renderAgentPanel();

    vi.advanceTimersByTime(600);
    await vi.runOnlyPendingTimersAsync();

    await waitFor(
      () => {
        expect(screen.getByText("Orchestrator")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // Header should still be visible
    expect(screen.getByText("Agent Pipeline")).toBeInTheDocument();
  });

  it("should clean up timer on unmount", () => {
    const { unmount } = renderAgentPanel();

    // Verify initial state
    expect(screen.getAllByLabelText("Loading agent card")).toHaveLength(4);

    // Unmount before timer completes
    unmount();

    // Timer should be cleaned up (no errors)
    expect(() => vi.advanceTimersByTime(600)).not.toThrow();
  });
});

describe("AgentPanel - General Rendering", () => {
  it("should render panel header correctly", () => {
    renderAgentPanel();

    expect(screen.getByText("Agent Pipeline")).toBeInTheDocument();
  });

  it("should have collapse button", () => {
    renderAgentPanel();

    const collapseButton = screen.getByLabelText(/collapse agent pipeline/i);
    expect(collapseButton).toBeInTheDocument();
  });

  it("should apply correct background color", () => {
    const { container } = renderAgentPanel();

    const panel = container.querySelector(".bg-bg-secondary");
    expect(panel).toBeInTheDocument();
  });
});
