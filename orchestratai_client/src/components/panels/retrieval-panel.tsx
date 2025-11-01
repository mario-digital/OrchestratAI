"use client";

import type { JSX } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatLogs } from "@/hooks/use-chat-logs";
import { usePanelCollapse } from "@/components/layout/three-panel-layout";
import { QueryAnalysisCard } from "./query-analysis-card";
import { VectorSearchCard } from "./vector-search-card";
import { CacheOperationCard } from "./cache-operation-card";
import { LogType, AgentId } from "@/lib/enums";
import type { RetrievalLog } from "@/lib/types";

/**
 * DocumentChunk interface for vector search results
 */
interface DocumentChunk {
  source: string;
  content: string;
  similarity: number;
  metadata?: Record<string, unknown>;
}

/**
 * Type guard to validate DocumentChunk objects
 */
function isDocumentChunk(value: unknown): value is DocumentChunk {
  return (
    typeof value === "object" &&
    value !== null &&
    "source" in value &&
    typeof (value as DocumentChunk).source === "string" &&
    "content" in value &&
    typeof (value as DocumentChunk).content === "string" &&
    "similarity" in value &&
    typeof (value as DocumentChunk).similarity === "number"
  );
}

/**
 * Safely parse chunks data with runtime validation
 */
function parseDocumentChunks(data: unknown): DocumentChunk[] {
  if (!Array.isArray(data)) return [];
  return data.filter(isDocumentChunk);
}

/**
 * Validate and parse query analysis log data
 */
interface QueryAnalysisData {
  intent: string;
  confidence: number;
  target_agent: AgentId;
  reasoning?: string;
}

function parseQueryAnalysisData(data: unknown): QueryAnalysisData {
  if (typeof data !== "object" || data === null) {
    return {
      intent: "unknown",
      confidence: 0,
      target_agent: AgentId.ORCHESTRATOR,
    };
  }

  const obj = data as Record<string, unknown>;

  // Validate required fields
  const intent = typeof obj["intent"] === "string" ? obj["intent"] : "unknown";
  const confidence =
    typeof obj["confidence"] === "number" ? obj["confidence"] : 0;
  const targetAgent =
    typeof obj["target_agent"] === "string" &&
    Object.values(AgentId).includes(obj["target_agent"] as AgentId)
      ? (obj["target_agent"] as AgentId)
      : AgentId.ORCHESTRATOR;
  const reasoning =
    typeof obj["reasoning"] === "string" ? obj["reasoning"] : undefined;

  return {
    intent,
    confidence,
    target_agent: targetAgent,
    reasoning,
  };
}

/**
 * Validate and parse vector search log data
 */
interface VectorSearchData {
  collection_name: string;
  chunks: DocumentChunk[];
  latency_ms: number;
}

function parseVectorSearchData(data: unknown): VectorSearchData {
  if (typeof data !== "object" || data === null) {
    return {
      collection_name: "unknown",
      chunks: [],
      latency_ms: 0,
    };
  }

  const obj = data as Record<string, unknown>;

  return {
    collection_name:
      typeof obj["collection_name"] === "string"
        ? obj["collection_name"]
        : "unknown",
    chunks: parseDocumentChunks(obj["chunks"]),
    latency_ms: typeof obj["latency_ms"] === "number" ? obj["latency_ms"] : 0,
  };
}

/**
 * Validate and parse cache operation log data
 */
interface CacheOperationData {
  is_hit: boolean;
  hit_rate: number;
  cache_size: number;
  cache_key?: string;
}

function parseCacheOperationData(data: unknown): CacheOperationData {
  if (typeof data !== "object" || data === null) {
    return {
      is_hit: false,
      hit_rate: 0,
      cache_size: 0,
    };
  }

  const obj = data as Record<string, unknown>;

  return {
    is_hit: typeof obj["is_hit"] === "boolean" ? obj["is_hit"] : false,
    hit_rate: typeof obj["hit_rate"] === "number" ? obj["hit_rate"] : 0,
    cache_size: typeof obj["cache_size"] === "number" ? obj["cache_size"] : 0,
    cache_key:
      typeof obj["cache_key"] === "string" ? obj["cache_key"] : undefined,
  };
}

/**
 * Get section header color and label based on log type (Mockup v2.0)
 */
function getLogSectionConfig(logType: LogType): {
  headerClass: string;
  label: string;
} {
  switch (logType) {
    case LogType.ROUTING:
      return {
        headerClass: "text-log-header-query",
        label: "QUERY ANALYSIS",
      };
    case LogType.VECTOR_SEARCH:
      return {
        headerClass: "text-log-header-vector",
        label: "VECTOR SEARCH",
      };
    case LogType.CACHE:
      return {
        headerClass: "text-log-header-cache",
        label: "CACHED CONTEXT",
      };
    case LogType.DOCUMENTS:
      return {
        headerClass: "text-log-header-docs",
        label: "RETRIEVED DOCUMENTS",
      };
    default:
      return {
        headerClass: "text-text-tertiary",
        label: "LOG ENTRY",
      };
  }
}

/**
 * Render the appropriate card component based on log type
 * Document modals are now managed locally within DocumentPreview (Story 3.7)
 */
function renderLogCard(log: RetrievalLog): JSX.Element {
  const data = log.data;

  switch (log.type) {
    case LogType.ROUTING: {
      // Query analysis data structure with validation
      const queryData = parseQueryAnalysisData(data);
      return (
        <QueryAnalysisCard
          intent={queryData.intent}
          confidence={queryData.confidence}
          targetAgent={queryData.target_agent}
          reasoning={queryData.reasoning}
        />
      );
    }

    case LogType.VECTOR_SEARCH: {
      // Vector search data structure with validation
      const vectorData = parseVectorSearchData(data);
      return (
        <VectorSearchCard
          collectionName={vectorData.collection_name}
          chunks={vectorData.chunks}
          latencyMs={vectorData.latency_ms}
        />
      );
    }

    case LogType.CACHE: {
      // Cache operation data structure with validation
      const cacheData = parseCacheOperationData(data);
      return (
        <CacheOperationCard
          _isHit={cacheData.is_hit}
          hitRate={cacheData.hit_rate}
          cacheSize={cacheData.cache_size}
          cacheKey={cacheData.cache_key}
        />
      );
    }

    case LogType.DOCUMENTS: {
      // Document retrieval - similar to vector search with validation
      const docsData = parseVectorSearchData(data);
      return (
        <VectorSearchCard
          collectionName={docsData.collection_name}
          chunks={docsData.chunks}
          latencyMs={docsData.latency_ms}
        />
      );
    }

    default:
      // Error or unknown log type
      return (
        <div className="text-sm text-text-tertiary">
          <p className="font-medium mb-1">{log.title}</p>
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
  }
}

/**
 * RetrievalPanel Component
 *
 * Displays retrieval logs in reverse chronological order (newest first).
 * Logs include query analysis, vector search results, cache operations,
 * and document retrieval events.
 *
 * Features:
 * - Independent scrolling via ScrollArea
 * - Color-coded log entries by type
 * - Formatted timestamps (HH:mm:ss)
 * - Expandable document previews (connects to Story 3.7 modal)
 *
 * Usage:
 * ```tsx
 * <RetrievalPanel />
 * ```
 */
export function RetrievalPanel(): JSX.Element {
  const { logs } = useChatLogs();
  const { isRightPanelCollapsed, toggleRightPanel } = usePanelCollapse();

  // Sort logs by timestamp (newest first)
  const sortedLogs = [...logs].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeB - timeA;
  });

  return (
    <div className="flex flex-col h-full bg-bg-secondary">
      {/* Header - Mockup v2.0: Purple icon + title + collapse chevron */}
      <div className="p-4 border-b border-border-default flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-log-header-query"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2 className="text-sm font-semibold text-log-header-query uppercase tracking-wide">
            Retrieval Log
          </h2>
        </div>
        {/* Collapse chevron - collapses entire right panel */}
        <button
          onClick={toggleRightPanel}
          className="text-text-tertiary hover:text-text-primary transition-colors"
          aria-label={
            isRightPanelCollapsed
              ? "Expand retrieval log"
              : "Collapse retrieval log"
          }
        >
          <svg
            className="w-4 h-4 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{
              transform: isRightPanelCollapsed
                ? "rotate(180deg)"
                : "rotate(0deg)",
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      </div>

      {/* Log entries with colored section headers (Mockup v2.0) */}
      <ScrollArea className="flex-1 p-4">
        {sortedLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-text-tertiary italic">
              No retrieval logs yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedLogs.map((log) => {
              const sectionConfig = getLogSectionConfig(log.type);
              const formattedTime = new Date(log.timestamp).toLocaleTimeString(
                "en-US",
                {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }
              );

              return (
                <div key={log.id} className="space-y-2">
                  {/* Section Header with Timestamp */}
                  <div className="flex items-center justify-between px-1">
                    <h3
                      className={`${sectionConfig.headerClass} section-header`}
                    >
                      {sectionConfig.label}
                    </h3>
                    <span className="text-log-header-timestamp text-xs">
                      {formattedTime}
                    </span>
                  </div>

                  {/* Log Content Card - DARKER background, no thick border */}
                  <div className="bg-bg-primary border border-border-default rounded-md p-3">
                    {renderLogCard(log)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
