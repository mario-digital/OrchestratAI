"use client";

import type { JSX } from "react";

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

  return (
    <div className="space-y-2">
      {/* Source filename - Mockup v2.0: Cyan color, no icon */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-doc-filename truncate">
          {source}
        </span>
        <span className="text-xs text-doc-similarity-label whitespace-nowrap">
          sim:{" "}
          <span className="text-doc-similarity-value">
            {similarity.toFixed(2)}
          </span>
        </span>
      </div>

      {/* Content preview */}
      <p className="text-xs text-text-tertiary leading-relaxed">
        {truncatedContent}
      </p>

      {/* View Full link - Mockup v2.0: Cyan with eye icon */}
      <button
        onClick={onViewFull}
        className="flex items-center gap-1.5 text-doc-view-link text-xs hover:underline"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        View Full
      </button>
    </div>
  );
}
