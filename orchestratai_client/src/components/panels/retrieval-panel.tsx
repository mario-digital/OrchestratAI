"use client";

import { useState } from "react";
import type { JSX } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatLogs } from "@/hooks/use-chat-logs";
import { LogEntry } from "./log-entry";
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
 * Map LogType enum to LogEntry component type
 */
function mapLogTypeToEntryType(
  logType: LogType
): "routing" | "vector_search" | "cache" | "documents" | "error" {
  switch (logType) {
    case LogType.ROUTING:
      return "routing";
    case LogType.VECTOR_SEARCH:
      return "vector_search";
    case LogType.CACHE:
      return "cache";
    case LogType.DOCUMENTS:
      return "documents";
    default:
      return "error";
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
          isHit={data["is_hit"] as boolean}
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border-default">
        <h2 className="text-lg font-semibold text-text-primary">
          Retrieval Logs
        </h2>
        {logs.length > 0 && (
          <p className="text-xs text-text-tertiary mt-1">
            {logs.length} entr{logs.length !== 1 ? "ies" : "y"}
          </p>
        )}
      </div>

      {/* Log entries */}
      <ScrollArea className="flex-1 p-4">
        {sortedLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-text-tertiary italic">
              No retrieval logs yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedLogs.map((log) => (
              <LogEntry
                key={log.id}
                type={mapLogTypeToEntryType(log.type)}
                timestamp={new Date(log.timestamp)}
              >
                {renderLogCard(log, handleViewDocument)}
              </LogEntry>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
