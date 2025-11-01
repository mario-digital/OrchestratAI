"use client";

import { useState } from "react";
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
 */
function renderLogCard(
  log: RetrievalLog,
  onViewDocument?: (source: string, content: string) => void
): JSX.Element {
  const data = log.data;

  switch (log.type) {
    case LogType.ROUTING:
      // Query analysis data structure
      return (
        <QueryAnalysisCard
          intent={data["intent"] as string}
          confidence={data["confidence"] as number}
          targetAgent={data["target_agent"] as AgentId}
          reasoning={data["reasoning"] as string | undefined}
        />
      );

    case LogType.VECTOR_SEARCH:
      // Vector search data structure
      return (
        <VectorSearchCard
          collectionName={data["collection_name"] as string}
          chunks={(data["chunks"] as unknown[] as DocumentChunk[]) || []}
          latencyMs={data["latency_ms"] as number}
          onViewDocument={
            onViewDocument
              ? (chunk) => onViewDocument(chunk.source, chunk.content)
              : undefined
          }
        />
      );

    case LogType.CACHE:
      // Cache operation data structure
      return (
        <CacheOperationCard
          _isHit={data["is_hit"] as boolean}
          hitRate={data["hit_rate"] as number}
          cacheSize={data["cache_size"] as number}
          cacheKey={data["cache_key"] as string | undefined}
        />
      );

    case LogType.DOCUMENTS:
      // Document retrieval - similar to vector search
      return (
        <VectorSearchCard
          collectionName={data["collection_name"] as string}
          chunks={(data["chunks"] as unknown[] as DocumentChunk[]) || []}
          latencyMs={data["latency_ms"] as number}
          onViewDocument={
            onViewDocument
              ? (chunk) => onViewDocument(chunk.source, chunk.content)
              : undefined
          }
        />
      );

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
  const [_selectedDocument, setSelectedDocument] = useState<{
    source: string;
    content: string;
  } | null>(null);

  // Sort logs by timestamp (newest first)
  const sortedLogs = [...logs].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeB - timeA;
  });

  // Handle document preview click (will connect to modal in Story 3.7)
  const handleViewDocument = (source: string, content: string): void => {
    setSelectedDocument({ source, content });
    // TODO: Story 3.7 - Open document modal
    console.log("View document:", source);
  };

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
                    {renderLogCard(log, handleViewDocument)}
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
