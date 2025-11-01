"use client";

import type { JSX } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

/**
 * DocumentModal Props
 * Displays full document content in a modal dialog
 */
interface DocumentModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Document data to display (null if no document selected) */
  document: {
    /** Source file path or document identifier */
    source: string;
    /** Full document content */
    content: string;
    /** Similarity score from vector search (0.0 to 1.0) */
    similarity: number;
  } | null;
}

/**
 * Get similarity badge color based on score
 * Uses semantic design tokens for success/warning/error states
 * @param similarity - Similarity score (0.0 to 1.0)
 * @returns Tailwind CSS classes for badge styling
 */
function getSimilarityBadgeColor(similarity: number): string {
  // High similarity: >= 80% (success/green)
  if (similarity >= 0.8) {
    return "bg-success/20 text-success";
  }
  // Medium similarity: 60-79% (warning/yellow)
  if (similarity >= 0.6) {
    return "bg-warning/20 text-warning";
  }
  // Low similarity: < 60% (error/red)
  return "bg-error/20 text-error";
}

/**
 * DocumentModal Component
 *
 * Displays the full text of a retrieved document in a modal dialog.
 * Features:
 * - Shows document source filename as title
 * - Displays similarity score as color-coded percentage badge
 * - Renders full content in monospace font with preserved formatting
 * - Max width (3xl) and max height (80vh) with scrolling
 * - Accessible: keyboard navigation, focus trap, Esc to close
 *
 * Usage:
 * ```tsx
 * const [isModalOpen, setIsModalOpen] = useState(false);
 *
 * <DocumentModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   document={{
 *     source: "docs/architecture.md",
 *     content: "Full document text...",
 *     similarity: 0.92
 *   }}
 * />
 * ```
 *
 * @see Story 3.7 - Implement Document Preview Modal with Full Text Viewer
 */
export function DocumentModal({
  isOpen,
  onClose,
  document,
}: DocumentModalProps): JSX.Element | null {
  // Don't render if no document is provided
  if (!document) {
    return null;
  }

  const { source, content, similarity } = document;
  const similarityPercentage = (similarity * 100).toFixed(1);
  const badgeColor = getSimilarityBadgeColor(similarity);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-modal overflow-y-auto"
        style={{ maxHeight: "var(--size-modal-max-height)" }}
      >
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="truncate">{source}</DialogTitle>
            <Badge className={badgeColor}>{similarityPercentage}%</Badge>
          </div>
        </DialogHeader>
        <div className="mt-4 p-4 bg-background-secondary rounded-md">
          <pre className="whitespace-pre-wrap font-mono text-sm text-text-primary">
            {content}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
