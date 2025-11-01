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
    <div className="space-y-2 text-sm">
      {/* Collection and chunk count */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-xs text-text-tertiary">Collection:</span>
          <p className="text-text-primary">{collectionName}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-text-tertiary">Chunks:</span>
          <p className="text-text-primary">{chunks.length}</p>
        </div>
      </div>

      {/* TopSimilarity and Method */}
      {chunks.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-xs text-text-tertiary">TopSimilarity:</span>
            <p className="text-text-primary">
              {chunks[0]!.similarity.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-text-tertiary">Method:</span>
            <p className="text-agent-card-text-blue">RAG</p>
          </div>
        </div>
      )}

      {/* Latency */}
      <div>
        <span className="text-xs text-text-tertiary">Latency:</span>
        <p className="text-agent-card-text-cyan">{latencyMs}ms</p>
      </div>

      {/* Retrieved Documents Section */}
      {chunks.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border-default">
          <div className="space-y-3">
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
  );
}
