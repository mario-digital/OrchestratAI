/**
 * Log Components Test Suite
 * Tests for Story 3.6 log entry components
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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

    expect(screen.getByText(/Technical Question/i)).toBeInTheDocument();
  });

  it("displays confidence score", () => {
    render(
      <QueryAnalysisCard
        intent="greeting"
        confidence={0.78}
        targetAgent={AgentId.ORCHESTRATOR}
      />
    );

    expect(screen.getByText("0.78")).toBeInTheDocument();
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
      />
    );

    expect(screen.getByText("architecture.md")).toBeInTheDocument();
  });

  it("displays similarity score", () => {
    render(
      <DocumentPreview source="test.md" content="test" similarity={0.92} />
    );

    expect(screen.getByText("0.92")).toBeInTheDocument();
  });

  it("renders View Full button", () => {
    render(
      <DocumentPreview source="test.md" content="test" similarity={0.9} />
    );

    const button = screen.getByRole("button", {
      name: /view full/i,
    });
    expect(button).toBeInTheDocument();
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

    expect(screen.getByText("Chunks:")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("displays singular count for single result", () => {
    const chunks = [
      { source: "doc1.md", content: "content1", similarity: 0.9 },
    ];

    render(
      <VectorSearchCard collectionName="docs" chunks={chunks} latencyMs={100} />
    );

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("displays search latency", () => {
    render(
      <VectorSearchCard collectionName="docs" chunks={[]} latencyMs={345} />
    );

    expect(screen.getByText("Latency:")).toBeInTheDocument();
  });

  it("displays chunk count for empty results", () => {
    render(
      <VectorSearchCard collectionName="docs" chunks={[]} latencyMs={100} />
    );

    expect(screen.getByText("0")).toBeInTheDocument();
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
  it("displays cache information when cache hit", () => {
    render(<CacheOperationCard _isHit={true} hitRate={0.78} cacheSize={156} />);

    expect(screen.getByText("HIT")).toBeInTheDocument();
    expect(screen.getByText(/78%/)).toBeInTheDocument();
    expect(screen.getByText("156 B")).toBeInTheDocument();
  });

  it("displays cache information when cache miss", () => {
    render(
      <CacheOperationCard _isHit={false} hitRate={0.65} cacheSize={120} />
    );

    expect(screen.getByText("MISS")).toBeInTheDocument();
    expect(screen.getByText(/65%/)).toBeInTheDocument();
    expect(screen.getByText("120 B")).toBeInTheDocument();
  });

  it("displays hit rate as percentage", () => {
    render(<CacheOperationCard _isHit={true} hitRate={0.82} cacheSize={200} />);

    expect(screen.getByText(/82%/)).toBeInTheDocument();
  });

  it("displays cache size in bytes", () => {
    render(<CacheOperationCard _isHit={true} hitRate={0.75} cacheSize={150} />);

    expect(screen.getByText("150 B")).toBeInTheDocument();
  });

  it("displays cache size for 1 byte", () => {
    render(<CacheOperationCard _isHit={true} hitRate={0.75} cacheSize={1} />);

    expect(screen.getByText("1 B")).toBeInTheDocument();
  });

  it("displays Method: CAG label", () => {
    render(
      <CacheOperationCard
        _isHit={true}
        hitRate={0.75}
        cacheSize={100}
        cacheKey="query:12345"
      />
    );

    expect(screen.getByText("Method:")).toBeInTheDocument();
    expect(screen.getByText("CAG")).toBeInTheDocument();
  });

  it("displays clear explanation message for cache hit", () => {
    render(<CacheOperationCard _isHit={true} hitRate={0.75} cacheSize={100} />);

    expect(
      screen.getByText(
        /Similar question found in cache - instant response with zero cost/i
      )
    ).toBeInTheDocument();
  });

  it("displays HIT badge with green styling for cache hits", () => {
    render(<CacheOperationCard _isHit={true} hitRate={0.75} cacheSize={100} />);

    const hitBadge = screen.getByText("HIT");
    expect(hitBadge).toBeInTheDocument();

    // Check for green styling classes
    const badge = hitBadge.closest("span");
    expect(badge?.className).toContain("text-green-400");
  });

  it("displays MISS badge with orange styling for cache misses", () => {
    render(
      <CacheOperationCard _isHit={false} hitRate={0.65} cacheSize={120} />
    );

    const missBadge = screen.getByText("MISS");
    expect(missBadge).toBeInTheDocument();

    // Check for orange styling classes
    const badge = missBadge.closest("span");
    expect(badge?.className).toContain("text-orange-400");
  });

  it("renders CheckCircle icon for cache hits", () => {
    render(<CacheOperationCard _isHit={true} hitRate={0.75} cacheSize={100} />);

    // Look for SVG icon next to HIT text
    const badge = screen.getByText("HIT").closest("span");
    const icon = badge?.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("renders XCircle icon for cache misses", () => {
    render(
      <CacheOperationCard _isHit={false} hitRate={0.65} cacheSize={120} />
    );

    // Look for SVG icon next to MISS text
    const badge = screen.getByText("MISS").closest("span");
    const icon = badge?.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });
});
