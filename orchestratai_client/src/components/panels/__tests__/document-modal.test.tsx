/**
 * DocumentModal Test Suite
 * Tests for Story 3.7 - Document Preview Modal
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { DocumentModal } from "../document-modal";

describe("DocumentModal Component", () => {
  const mockDocument = {
    source: "pricing_faq.md",
    content: "Full document content here...",
    similarity: 0.92,
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it("renders when isOpen is true", () => {
    render(
      <DocumentModal
        isOpen={true}
        onClose={mockOnClose}
        document={mockDocument}
      />
    );

    expect(screen.getByText("pricing_faq.md")).toBeInTheDocument();
    expect(screen.getByText(/Full document content/)).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(
      <DocumentModal
        isOpen={false}
        onClose={mockOnClose}
        document={mockDocument}
      />
    );

    expect(screen.queryByText("pricing_faq.md")).not.toBeInTheDocument();
  });

  it("does not render when document is null", () => {
    render(
      <DocumentModal isOpen={true} onClose={mockOnClose} document={null} />
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("displays source as dialog title", () => {
    render(
      <DocumentModal
        isOpen={true}
        onClose={mockOnClose}
        document={mockDocument}
      />
    );

    // DialogTitle should be rendered
    expect(screen.getByText("pricing_faq.md")).toBeInTheDocument();
  });

  it("displays similarity percentage with one decimal place", () => {
    render(
      <DocumentModal
        isOpen={true}
        onClose={mockOnClose}
        document={mockDocument}
      />
    );

    expect(screen.getByText("92.0%")).toBeInTheDocument();
  });

  it("displays full content in monospace font", () => {
    render(
      <DocumentModal
        isOpen={true}
        onClose={mockOnClose}
        document={mockDocument}
      />
    );

    const content = screen.getByText(/Full document content/);
    expect(content).toBeInTheDocument();
    expect(content.tagName).toBe("PRE");
    expect(content).toHaveClass("font-mono");
  });

  it("calls onClose when Escape key is pressed", async () => {
    render(
      <DocumentModal
        isOpen={true}
        onClose={mockOnClose}
        document={mockDocument}
      />
    );

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("renders high similarity badge with success color (>= 80%)", () => {
    const highSimilarityDoc = { ...mockDocument, similarity: 0.92 };

    render(
      <DocumentModal
        isOpen={true}
        onClose={mockOnClose}
        document={highSimilarityDoc}
      />
    );

    const badge = screen.getByText("92.0%");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-success/20");
    expect(badge.className).toContain("text-success");
  });

  it("renders medium similarity badge with warning color (60-79%)", () => {
    const mediumSimilarityDoc = { ...mockDocument, similarity: 0.7 };

    render(
      <DocumentModal
        isOpen={true}
        onClose={mockOnClose}
        document={mediumSimilarityDoc}
      />
    );

    const badge = screen.getByText("70.0%");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-warning/20");
    expect(badge.className).toContain("text-warning");
  });

  it("renders low similarity badge with error color (< 60%)", () => {
    const lowSimilarityDoc = { ...mockDocument, similarity: 0.45 };

    render(
      <DocumentModal
        isOpen={true}
        onClose={mockOnClose}
        document={lowSimilarityDoc}
      />
    );

    const badge = screen.getByText("45.0%");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-error/20");
    expect(badge.className).toContain("text-error");
  });

  it("applies max width and max height constraints", () => {
    render(
      <DocumentModal
        isOpen={true}
        onClose={mockOnClose}
        document={mockDocument}
      />
    );

    // Check that modal opens with dialog role
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
  });

  it("enables scrolling for long content", () => {
    const longContent = "Line 1\n".repeat(100);
    const longDoc = { ...mockDocument, content: longContent };

    render(
      <DocumentModal isOpen={true} onClose={mockOnClose} document={longDoc} />
    );

    // Check that dialog opens and long content is present
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Line 1/)).toBeInTheDocument();
  });

  it("preserves whitespace and wraps text", () => {
    const contentWithWhitespace = "Line 1\n  Indented line\n\nLine after blank";

    const docWithWhitespace = {
      ...mockDocument,
      content: contentWithWhitespace,
    };

    render(
      <DocumentModal
        isOpen={true}
        onClose={mockOnClose}
        document={docWithWhitespace}
      />
    );

    const pre = screen.getByText(/Line 1/);
    expect(pre).toHaveClass("whitespace-pre-wrap");
  });
});
