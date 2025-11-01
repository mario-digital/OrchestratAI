/**
 * Log Components Test Suite
 * Tests for Story 3.6 log entry components
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LogEntry } from "../log-entry";
import { QueryAnalysisCard } from "../query-analysis-card";
import { VectorSearchCard } from "../vector-search-card";
import { CacheOperationCard } from "../cache-operation-card";
import { DocumentPreview } from "../document-preview";
import { AgentId } from "@/lib/enums";

describe("LogEntry Component", () => {
  it("renders with correct background color for routing type", () => {
    const { container } = render(
      <LogEntry type="routing" timestamp={new Date("2024-01-01T14:23:45")}>
        <div>Test Content</div>
      </LogEntry>
    );

    const card = container.querySelector('[class*="bg-log-query"]');
    expect(card).toBeInTheDocument();
  });

  it("renders with correct background color for vector_search type", () => {
    const { container } = render(
      <LogEntry
        type="vector_search"
        timestamp={new Date("2024-01-01T14:23:45")}
      >
        <div>Test Content</div>
      </LogEntry>
    );

    const card = container.querySelector('[class*="bg-log-vector"]');
    expect(card).toBeInTheDocument();
  });

  it("renders with correct background color for cache type", () => {
    const { container } = render(
      <LogEntry type="cache" timestamp={new Date("2024-01-01T14:23:45")}>
        <div>Test Content</div>
      </LogEntry>
    );

    const card = container.querySelector('[class*="bg-log-cache"]');
    expect(card).toBeInTheDocument();
  });

  it("renders with correct background color for error type", () => {
    const { container } = render(
      <LogEntry type="error" timestamp={new Date("2024-01-01T14:23:45")}>
        <div>Test Content</div>
      </LogEntry>
    );

    const card = container.querySelector('[class*="bg-log-error"]');
    expect(card).toBeInTheDocument();
  });

  it("formats timestamp in HH:mm:ss format", () => {
    render(
      <LogEntry type="routing" timestamp={new Date("2024-01-01T14:23:45Z")}>
        <div>Test Content</div>
      </LogEntry>
    );

    // Time will be displayed in local timezone, so check for the formatted pattern
    const timeElement = screen.getByText(/\d{2}:\d{2}:\d{2}/);
    expect(timeElement).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(
      <LogEntry type="routing" timestamp={new Date()}>
        <div data-testid="child-content">Test Content</div>
      </LogEntry>
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });
});

describe("QueryAnalysisCard Component", () => {
  it("displays intent text", () => {
    render(
      <QueryAnalysisCard
        intent="technical_question"
        confidence={0.92}
        targetAgent={AgentId.TECHNICAL}
      />
    );

    expect(screen.getByText(/technical_question/i)).toBeInTheDocument();
  });

  it("displays confidence as percentage", () => {
    render(
      <QueryAnalysisCard
        intent="greeting"
        confidence={0.78}
        targetAgent={AgentId.ORCHESTRATOR}
      />
    );

    expect(screen.getByText("78%")).toBeInTheDocument();
  });

  it("displays target agent badge", () => {
    render(
      <QueryAnalysisCard
        intent="billing_question"
        confidence={0.85}
        targetAgent={AgentId.BILLING}
      />
    );

    expect(screen.getByText(AgentId.BILLING)).toBeInTheDocument();
  });

  it("displays reasoning when provided", () => {
    const reasoning = "User is asking about payment methods";
    render(
      <QueryAnalysisCard
        intent="billing"
        confidence={0.9}
        targetAgent={AgentId.BILLING}
        reasoning={reasoning}
      />
    );

    expect(screen.getByText(reasoning)).toBeInTheDocument();
  });

  it("does not display reasoning section when not provided", () => {
    render(
      <QueryAnalysisCard
        intent="greeting"
        confidence={0.9}
        targetAgent={AgentId.ORCHESTRATOR}
      />
    );

    expect(screen.queryByText("Reasoning:")).not.toBeInTheDocument();
  });
});

describe("DocumentPreview Component", () => {
  it("truncates content at 200 characters", () => {
    const longContent = "a".repeat(300);
    render(
      <DocumentPreview
        source="test.md"
        content={longContent}
        similarity={0.9}
        onViewFull={vi.fn()}
      />
    );

    const displayedText = screen.getByText(/a{200}\.\.\./);
    expect(displayedText).toBeInTheDocument();
    expect(displayedText.textContent).toHaveLength(203); // 200 + "..."
  });

  it("does not truncate content under 200 characters", () => {
    const shortContent = "Short content";
    render(
      <DocumentPreview
        source="test.md"
        content={shortContent}
        similarity={0.9}
        onViewFull={vi.fn()}
      />
    );

    expect(screen.getByText(shortContent)).toBeInTheDocument();
  });

  it("displays source filename", () => {
    render(
      <DocumentPreview
        source="docs/architecture.md"
        content="test content"
        similarity={0.85}
        onViewFull={vi.fn()}
      />
    );

    expect(screen.getByText("docs/architecture.md")).toBeInTheDocument();
  });

  it("displays similarity score as percentage", () => {
    render(
      <DocumentPreview
        source="test.md"
        content="test"
        similarity={0.92}
        onViewFull={vi.fn()}
      />
    );

    expect(screen.getByText("92%")).toBeInTheDocument();
  });

  it("calls onViewFull when View Full button is clicked", async () => {
    const handleViewFull = vi.fn();
    const user = userEvent.setup();
    render(
      <DocumentPreview
        source="test.md"
        content="test"
        similarity={0.9}
        onViewFull={handleViewFull}
      />
    );

    const button = screen.getByRole("button", {
      name: /view full document/i,
    });
    await user.click(button);

    expect(handleViewFull).toHaveBeenCalledTimes(1);
  });
});

describe("VectorSearchCard Component", () => {
  it("displays collection name", () => {
    render(
      <VectorSearchCard
        collectionName="technical_docs"
        chunks={[]}
        latencyMs={245}
      />
    );

    expect(screen.getByText("technical_docs")).toBeInTheDocument();
  });

  it("displays chunk count", () => {
    const chunks = [
      { source: "doc1.md", content: "content1", similarity: 0.9 },
      { source: "doc2.md", content: "content2", similarity: 0.8 },
    ];

    render(
      <VectorSearchCard collectionName="docs" chunks={chunks} latencyMs={100} />
    );

    expect(screen.getByText("2 chunks")).toBeInTheDocument();
  });

  it("displays singular 'chunk' for single result", () => {
    const chunks = [
      { source: "doc1.md", content: "content1", similarity: 0.9 },
    ];

    render(
      <VectorSearchCard collectionName="docs" chunks={chunks} latencyMs={100} />
    );

    expect(screen.getByText("1 chunk")).toBeInTheDocument();
  });

  it("displays search latency", () => {
    render(
      <VectorSearchCard collectionName="docs" chunks={[]} latencyMs={345} />
    );

    expect(screen.getByText("345ms")).toBeInTheDocument();
  });

  it("shows empty state when no chunks retrieved", () => {
    render(
      <VectorSearchCard collectionName="docs" chunks={[]} latencyMs={100} />
    );

    expect(screen.getByText(/no documents retrieved/i)).toBeInTheDocument();
  });

  it("renders document previews for each chunk", () => {
    const chunks = [
      { source: "doc1.md", content: "content1", similarity: 0.9 },
      { source: "doc2.md", content: "content2", similarity: 0.8 },
    ];

    render(
      <VectorSearchCard collectionName="docs" chunks={chunks} latencyMs={100} />
    );

    expect(screen.getByText("doc1.md")).toBeInTheDocument();
    expect(screen.getByText("doc2.md")).toBeInTheDocument();
  });
});

describe("CacheOperationCard Component", () => {
  it("displays HIT badge when isHit is true", () => {
    render(<CacheOperationCard _isHit={true} hitRate={0.78} cacheSize={156} />);

    expect(screen.getByText("HIT")).toBeInTheDocument();
  });

  it("displays MISS badge when isHit is false", () => {
    render(
      <CacheOperationCard _isHit={false} hitRate={0.65} cacheSize={120} />
    );

    expect(screen.getByText("MISS")).toBeInTheDocument();
  });

  it("displays hit rate as percentage", () => {
    render(<CacheOperationCard _isHit={true} hitRate={0.82} cacheSize={200} />);

    expect(screen.getByText("82%")).toBeInTheDocument();
  });

  it("displays cache size with plural 'entries'", () => {
    render(<CacheOperationCard _isHit={true} hitRate={0.75} cacheSize={150} />);

    expect(screen.getByText("150 entries")).toBeInTheDocument();
  });

  it("displays cache size with singular 'entry'", () => {
    render(<CacheOperationCard _isHit={true} hitRate={0.75} cacheSize={1} />);

    expect(screen.getByText("1 entry")).toBeInTheDocument();
  });

  it("displays cache key when provided", () => {
    render(
      <CacheOperationCard
        _isHit={true}
        hitRate={0.75}
        cacheSize={100}
        cacheKey="query:12345"
      />
    );

    expect(screen.getByText("query:12345")).toBeInTheDocument();
  });

  it("does not display cache key section when not provided", () => {
    render(<CacheOperationCard _isHit={true} hitRate={0.75} cacheSize={100} />);

    expect(screen.queryByText("Cache Key:")).not.toBeInTheDocument();
  });
});
