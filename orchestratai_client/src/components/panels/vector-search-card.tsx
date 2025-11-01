"use client";

import type { JSX } from "react";
import { DocumentPreview } from "./document-preview";

/**
 * DocumentChunk data structure for vector search results
 */
interface DocumentChunk {
  /** Source file path or document identifier */
  source: string;
  /** Document content excerpt */
  content: string;
  /** Cosine similarity score (0.0 to 1.0) */
  similarity: number;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * VectorSearchCard Props
 * Displays vector database search results
 */
interface VectorSearchCardProps {
  /** Name of the vector collection searched */
  collectionName: string;
  /** Array of retrieved document chunks */
  chunks: DocumentChunk[];
  /** Search operation latency in milliseconds */
  latencyMs: number;
  /** Callback when document preview "View Full" is clicked */
  onViewDocument?: (chunk: DocumentChunk) => void;
}

/**
 * VectorSearchCard Component
 *
 * Displays the results of a vector similarity search including:
 * - Collection name and number of chunks retrieved
 * - Search latency for performance monitoring
 * - List of document previews with similarity scores
 *
 * Usage:
 * ```tsx
 * <VectorSearchCard
 *   collectionName="technical_docs"
 *   chunks={[
 *     { source: "docs/api.md", content: "...", similarity: 0.92 },
 *     { source: "docs/guide.md", content: "...", similarity: 0.85 }
 *   ]}
 *   latencyMs={245}
 *   onViewDocument={(chunk) => openModal(chunk)}
 * />
 * ```
 */
export function VectorSearchCard({
  collectionName,
  chunks,
  latencyMs,
  onViewDocument,
}: VectorSearchCardProps): JSX.Element {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text-primary">
          Vector Search
        </h4>
      </div>

      <div className="space-y-2">
        {/* Collection and count */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-text-secondary">
              Collection:
            </span>
            <p className="text-sm text-text-primary mt-0.5">{collectionName}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium text-text-secondary">
              Retrieved:
            </span>
            <p className="text-sm text-text-primary mt-0.5">
              {chunks.length} chunk{chunks.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Latency */}
        <div>
          <span className="text-xs font-medium text-text-secondary">
            Latency:
          </span>
          <p className="text-sm text-text-primary mt-0.5">{latencyMs}ms</p>
        </div>

        {/* Document chunks */}
        {chunks.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-medium text-text-secondary">
              Retrieved Documents:
            </span>
            <div className="space-y-2">
              {chunks.map((chunk, index) => (
                <DocumentPreview
                  key={`${chunk.source}-${index}`}
                  source={chunk.source}
                  content={chunk.content}
                  similarity={chunk.similarity}
                  onViewFull={() => onViewDocument?.(chunk)}
                />
              ))}
            </div>
          </div>
        )}

        {chunks.length === 0 && (
          <p className="text-xs text-text-tertiary italic">
            No documents retrieved
          </p>
        )}
      </div>
    </div>
  );
}
