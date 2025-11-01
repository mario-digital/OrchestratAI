"use client";

import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * DocumentPreview Props
 * Displays a truncated preview of a retrieved document chunk
 */
interface DocumentPreviewProps {
  /** Source file path or document identifier */
  source: string;
  /** Document content (will be truncated at 200 chars) */
  content: string;
  /** Similarity score from vector search (0.0 to 1.0) */
  similarity: number;
  /** Callback when "View Full" button is clicked (opens modal in Story 3.7) */
  onViewFull: () => void;
}

/**
 * Truncate content to specified maximum length
 * @param content - Content to truncate
 * @param maxLength - Maximum length (default: 200)
 * @returns Truncated content with "..." if needed
 */
function truncateContent(content: string, maxLength: number = 200): string {
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength) + "...";
}

/**
 * Get color class for similarity score
 * - High similarity (>= 0.8): Green
 * - Medium similarity (0.6 - 0.8): Yellow
 * - Low similarity (< 0.6): Red
 */
function getSimilarityColorClass(similarity: number): string {
  if (similarity >= 0.8) return "bg-green-500";
  if (similarity >= 0.6) return "bg-yellow-500";
  return "bg-red-500";
}

/**
 * DocumentPreview Component
 *
 * Displays a preview of a retrieved document including:
 * - Source filename with icon
 * - Truncated content (200 chars max)
 * - Color-coded similarity score progress bar
 * - "View Full" button to open modal (Story 3.7)
 *
 * Usage:
 * ```tsx
 * <DocumentPreview
 *   source="docs/architecture.md"
 *   content="This is the architecture document..."
 *   similarity={0.92}
 *   onViewFull={() => setModalOpen(true)}
 * />
 * ```
 */
export function DocumentPreview({
  source,
  content,
  similarity,
  onViewFull,
}: DocumentPreviewProps): JSX.Element {
  const truncatedContent = truncateContent(content, 200);
  const similarityPercent = Math.round(similarity * 100);
  const similarityColorClass = getSimilarityColorClass(similarity);

  return (
    <div className="border border-border-default rounded-md p-3 space-y-2 bg-bg-secondary">
      {/* Source filename */}
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-text-tertiary" />
        <span className="text-xs font-medium text-text-secondary truncate">
          {source}
        </span>
      </div>

      {/* Content preview */}
      <p className="text-xs text-text-tertiary leading-relaxed">
        {truncatedContent}
      </p>

      {/* Similarity score */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-text-secondary">
            Similarity
          </span>
          <span className="text-xs text-text-secondary">
            {similarityPercent}%
          </span>
        </div>
        <Progress
          value={similarityPercent}
          className={cn("h-1.5", similarityColorClass)}
        />
      </div>

      {/* View Full button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onViewFull}
        className="w-full text-xs"
      >
        View Full Document
      </Button>
    </div>
  );
}
