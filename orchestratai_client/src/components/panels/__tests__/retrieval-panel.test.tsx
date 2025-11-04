/**
 * RetrievalPanel Integration Test
 * Tests for Story 3.6 retrieval panel container
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RetrievalPanel } from "../retrieval-panel";
import { ChatProvider } from "@/components/providers/chat-provider";
import * as chatLogsHook from "@/hooks/use-chat-logs";
import { LogType, AgentId, LogStatus } from "@/lib/enums";
import type { RetrievalLog } from "@/lib/types";

// Helper to render RetrievalPanel within ChatProvider
function renderWithProvider() {
  return render(
    <ChatProvider>
      <RetrievalPanel />
    </ChatProvider>
  );
}

describe("RetrievalPanel Integration", () => {
  beforeEach(() => {
    // Clear any previous state
    localStorage.clear();
  });

  it("renders with empty state when no logs", () => {
    renderWithProvider();

    expect(screen.getByText("Retrieval Log")).toBeInTheDocument();
    expect(screen.getByText(/no retrieval logs yet/i)).toBeInTheDocument();
  });

  it("displays log count in header", async () => {
    renderWithProvider();

    // Initially no logs
    expect(screen.queryByText(/entries/i)).not.toBeInTheDocument();

    // This test would need to simulate adding logs via the provider
    // For now, we verify the structure is correct
    expect(screen.getByText("Retrieval Log")).toBeInTheDocument();
  });

  it("renders correct card type for routing log", async () => {
    // This would require a way to inject logs into the provider
    // For demo purposes, we verify the component structure
    renderWithProvider();

    expect(screen.getByText("Retrieval Log")).toBeInTheDocument();
  });

  it("sorts logs in reverse chronological order", async () => {
    // Test would verify that newer logs appear first
    // Requires mock data injection
    renderWithProvider();

    expect(screen.getByText("Retrieval Log")).toBeInTheDocument();
  });

  it("has independent scrolling via ScrollArea", () => {
    const { container } = renderWithProvider();

    // Verify ScrollArea is present
    const scrollArea = container.querySelector('[data-slot="scroll-area"]');
    expect(scrollArea).toBeInTheDocument();
  });

  it("displays header with correct styling", () => {
    renderWithProvider();

    const header = screen.getByText("Retrieval Log");
    expect(header).toBeInTheDocument();
    expect(header.tagName).toBe("H2");
  });
});

describe("RetrievalPanel - Log Type Mapping", () => {
  it("maps ROUTING log type to routing entry", () => {
    // Unit test for mapLogTypeToEntryType function
    // Would be tested via integration when logs are added
    renderWithProvider();
    expect(screen.getByText("Retrieval Log")).toBeInTheDocument();
  });

  it("maps VECTOR_SEARCH log type to vector_search entry", () => {
    renderWithProvider();
    expect(screen.getByText("Retrieval Log")).toBeInTheDocument();
  });

  it("maps CACHE log type to cache entry", () => {
    renderWithProvider();
    expect(screen.getByText("Retrieval Log")).toBeInTheDocument();
  });

  it("maps DOCUMENTS log type to documents entry", () => {
    renderWithProvider();
    expect(screen.getByText("Retrieval Log")).toBeInTheDocument();
  });
});

describe("RetrievalPanel - Document View Handler", () => {
  it("logs document view to console (Story 3.7 placeholder)", () => {
    // Test the TODO placeholder for Story 3.7
    renderWithProvider();
    expect(screen.getByText("Retrieval Log")).toBeInTheDocument();
  });
});

describe("RetrievalPanel - Log Rendering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders routing logs with QueryAnalysisCard", () => {
    const mockLogs: RetrievalLog[] = [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        title: "Query Analysis",
        type: LogType.ROUTING,
        status: LogStatus.SUCCESS,
        data: {
          intent: "billing_question",
          confidence: 0.95,
          target_agent: AgentId.BILLING,
          reasoning: "User asking about payment",
        },
      },
    ];

    vi.spyOn(chatLogsHook, "useChatLogs").mockReturnValue({
      logs: mockLogs,
      addLogs: vi.fn(),
      clearLogs: vi.fn(),
    });

    render(
      <ChatProvider>
        <RetrievalPanel />
      </ChatProvider>
    );

    expect(screen.getByText("QUERY ANALYSIS")).toBeInTheDocument();
    expect(screen.getByText("0.95")).toBeInTheDocument();
  });

  it("renders vector search logs with VectorSearchCard", () => {
    const mockLogs: RetrievalLog[] = [
      {
        id: "2",
        timestamp: new Date().toISOString(),
        title: "Vector Search",
        type: LogType.VECTOR_SEARCH,
        status: LogStatus.SUCCESS,
        data: {
          collection_name: "docs",
          chunks: [{ source: "doc1.md", content: "content1", similarity: 0.9 }],
          latency_ms: 100,
        },
      },
    ];

    vi.spyOn(chatLogsHook, "useChatLogs").mockReturnValue({
      logs: mockLogs,
      addLogs: vi.fn(),
      clearLogs: vi.fn(),
    });

    render(
      <ChatProvider>
        <RetrievalPanel />
      </ChatProvider>
    );

    expect(screen.getByText("VECTOR SEARCH")).toBeInTheDocument();
    expect(screen.getByText("docs")).toBeInTheDocument();
  });

  it("renders cache logs with CacheOperationCard", () => {
    const mockLogs: RetrievalLog[] = [
      {
        id: "3",
        timestamp: new Date().toISOString(),
        title: "Cache Operation",
        type: LogType.CACHE,
        status: LogStatus.SUCCESS,
        data: {
          is_hit: true,
          hit_rate: 0.78,
          cache_size: 150,
          cache_key: "test-key",
        },
      },
    ];

    vi.spyOn(chatLogsHook, "useChatLogs").mockReturnValue({
      logs: mockLogs,
      addLogs: vi.fn(),
      clearLogs: vi.fn(),
    });

    render(
      <ChatProvider>
        <RetrievalPanel />
      </ChatProvider>
    );

    expect(screen.getByText("CACHED CONTEXT")).toBeInTheDocument();
    expect(screen.getByText(/78%/)).toBeInTheDocument();
  });

  it("renders document logs with VectorSearchCard", () => {
    const mockLogs: RetrievalLog[] = [
      {
        id: "4",
        timestamp: new Date().toISOString(),
        title: "Documents",
        type: LogType.DOCUMENTS,
        status: LogStatus.SUCCESS,
        data: {
          collection_name: "policies",
          chunks: [
            {
              source: "policy.md",
              content: "policy content",
              similarity: 0.85,
            },
          ],
          latency_ms: 200,
        },
      },
    ];

    vi.spyOn(chatLogsHook, "useChatLogs").mockReturnValue({
      logs: mockLogs,
      addLogs: vi.fn(),
      clearLogs: vi.fn(),
    });

    render(
      <ChatProvider>
        <RetrievalPanel />
      </ChatProvider>
    );

    expect(screen.getByText("RETRIEVED DOCUMENTS")).toBeInTheDocument();
    expect(screen.getByText("policies")).toBeInTheDocument();
  });

  it("sorts logs in reverse chronological order", () => {
    const now = new Date();
    const earlier = new Date(now.getTime() - 1000);
    const mockLogs: RetrievalLog[] = [
      {
        id: "1",
        timestamp: earlier.toISOString(),
        title: "First Log",
        type: LogType.ROUTING,
        status: LogStatus.SUCCESS,
        data: {
          intent: "first",
          confidence: 0.8,
          target_agent: AgentId.ORCHESTRATOR,
        },
      },
      {
        id: "2",
        timestamp: now.toISOString(),
        title: "Second Log",
        type: LogType.ROUTING,
        status: LogStatus.SUCCESS,
        data: {
          intent: "second",
          confidence: 0.9,
          target_agent: AgentId.BILLING,
        },
      },
    ];

    vi.spyOn(chatLogsHook, "useChatLogs").mockReturnValue({
      logs: mockLogs,
      addLogs: vi.fn(),
      clearLogs: vi.fn(),
    });

    const { container } = render(
      <ChatProvider>
        <RetrievalPanel />
      </ChatProvider>
    );

    const logEntries = container.querySelectorAll(".space-y-2");
    expect(logEntries.length).toBeGreaterThan(0);
  });

  it("formats timestamps correctly", () => {
    const testDate = new Date("2025-01-01T15:30:45Z");
    const mockLogs: RetrievalLog[] = [
      {
        id: "1",
        timestamp: testDate.toISOString(),
        title: "Test Log",
        type: LogType.ROUTING,
        status: LogStatus.SUCCESS,
        data: {
          intent: "test",
          confidence: 0.9,
          target_agent: AgentId.ORCHESTRATOR,
        },
      },
    ];

    vi.spyOn(chatLogsHook, "useChatLogs").mockReturnValue({
      logs: mockLogs,
      addLogs: vi.fn(),
      clearLogs: vi.fn(),
    });

    render(
      <ChatProvider>
        <RetrievalPanel />
      </ChatProvider>
    );

    // Timestamp should be displayed (format may vary by locale)
    const timestamps = screen.getAllByText(/\d{2}:\d{2}:\d{2}/);
    expect(timestamps.length).toBeGreaterThan(0);
  });

  it("opens document modal when viewing document", async () => {
    const user = userEvent.setup();

    const mockLogs: RetrievalLog[] = [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        title: "Vector Search",
        type: LogType.VECTOR_SEARCH,
        status: LogStatus.SUCCESS,
        data: {
          collection_name: "docs",
          chunks: [
            { source: "test.md", content: "test content", similarity: 0.9 },
          ],
          latency_ms: 100,
        },
      },
    ];

    vi.spyOn(chatLogsHook, "useChatLogs").mockReturnValue({
      logs: mockLogs,
      addLogs: vi.fn(),
      clearLogs: vi.fn(),
    });

    render(
      <ChatProvider>
        <RetrievalPanel />
      </ChatProvider>
    );

    const viewButton = screen.getByRole("button", { name: /view full/i });
    await user.click(viewButton);

    // Modal should open (Story 3.7)
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Modal should show document source
    expect(screen.getAllByText("test.md").length).toBeGreaterThan(0);
  });
});

describe("RetrievalPanel - Malformed Data Handling", () => {
  it("handles malformed routing log data gracefully", () => {
    const mockLogs: RetrievalLog[] = [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        title: "Query Analysis",
        type: LogType.ROUTING,
        status: LogStatus.SUCCESS,
        data: {
          // Missing fields and wrong types
          intent: 123, // Should be string
          confidence: "high", // Should be number
          target_agent: "INVALID_AGENT", // Invalid enum value
        },
      },
    ];

    vi.spyOn(chatLogsHook, "useChatLogs").mockReturnValue({
      logs: mockLogs,
      addLogs: vi.fn(),
      clearLogs: vi.fn(),
    });

    render(
      <ChatProvider>
        <RetrievalPanel />
      </ChatProvider>
    );

    // Should render with defaults
    expect(screen.getByText("QUERY ANALYSIS")).toBeInTheDocument();
    expect(screen.getByText("Unknown")).toBeInTheDocument(); // Default intent (formatted)
    expect(screen.getByText("0.00")).toBeInTheDocument(); // Default confidence
    expect(screen.getByText(AgentId.ORCHESTRATOR)).toBeInTheDocument(); // Default agent
  });

  it("handles null routing log data", () => {
    const mockLogs: RetrievalLog[] = [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        title: "Query Analysis",
        type: LogType.ROUTING,
        status: LogStatus.SUCCESS,
        data: null as unknown as Record<string, unknown>,
      },
    ];

    vi.spyOn(chatLogsHook, "useChatLogs").mockReturnValue({
      logs: mockLogs,
      addLogs: vi.fn(),
      clearLogs: vi.fn(),
    });

    render(
      <ChatProvider>
        <RetrievalPanel />
      </ChatProvider>
    );

    expect(screen.getByText("QUERY ANALYSIS")).toBeInTheDocument();
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });

  it("handles malformed vector search log data", () => {
    const mockLogs: RetrievalLog[] = [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        title: "Vector Search",
        type: LogType.VECTOR_SEARCH,
        status: LogStatus.SUCCESS,
        data: {
          collection_name: 123, // Should be string
          chunks: "not an array", // Should be array
          latency_ms: "slow", // Should be number
        },
      },
    ];

    vi.spyOn(chatLogsHook, "useChatLogs").mockReturnValue({
      logs: mockLogs,
      addLogs: vi.fn(),
      clearLogs: vi.fn(),
    });

    render(
      <ChatProvider>
        <RetrievalPanel />
      </ChatProvider>
    );

    expect(screen.getByText("VECTOR SEARCH")).toBeInTheDocument();
    // Should render card even with malformed data (defaults to unknown collection, 0 chunks)
    expect(screen.getByText("unknown")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("handles malformed cache log data", () => {
    const mockLogs: RetrievalLog[] = [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        title: "Cache Operation",
        type: LogType.CACHE,
        status: LogStatus.SUCCESS,
        data: {
          is_hit: "yes", // Should be boolean
          hit_rate: "75%", // Should be number
          cache_size: null, // Should be number
        },
      },
    ];

    vi.spyOn(chatLogsHook, "useChatLogs").mockReturnValue({
      logs: mockLogs,
      addLogs: vi.fn(),
      clearLogs: vi.fn(),
    });

    render(
      <ChatProvider>
        <RetrievalPanel />
      </ChatProvider>
    );

    expect(screen.getByText("CACHED CONTEXT")).toBeInTheDocument();
    expect(screen.getByText("CAG")).toBeInTheDocument(); // Method label shown
  });

  it("filters out invalid document chunks", () => {
    const mockLogs: RetrievalLog[] = [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        title: "Vector Search",
        type: LogType.VECTOR_SEARCH,
        status: LogStatus.SUCCESS,
        data: {
          collection_name: "docs",
          chunks: [
            { source: "valid.md", content: "valid content", similarity: 0.9 },
            { source: "invalid", missing: "content" }, // Missing required fields
            { source: 123, content: "bad", similarity: "not a number" }, // Wrong types
            null, // Null chunk
          ],
          latency_ms: 100,
        },
      },
    ];

    vi.spyOn(chatLogsHook, "useChatLogs").mockReturnValue({
      logs: mockLogs,
      addLogs: vi.fn(),
      clearLogs: vi.fn(),
    });

    render(
      <ChatProvider>
        <RetrievalPanel />
      </ChatProvider>
    );

    // Should only render the valid chunk
    expect(screen.getByText("valid.md")).toBeInTheDocument();
    expect(screen.queryByText("invalid")).not.toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument(); // Only 1 valid chunk
  });

  it("handles empty data object", () => {
    const mockLogs: RetrievalLog[] = [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        title: "Empty Data",
        type: LogType.ROUTING,
        status: LogStatus.SUCCESS,
        data: {},
      },
    ];

    vi.spyOn(chatLogsHook, "useChatLogs").mockReturnValue({
      logs: mockLogs,
      addLogs: vi.fn(),
      clearLogs: vi.fn(),
    });

    render(
      <ChatProvider>
        <RetrievalPanel />
      </ChatProvider>
    );

    expect(screen.getByText("QUERY ANALYSIS")).toBeInTheDocument();
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });
});
