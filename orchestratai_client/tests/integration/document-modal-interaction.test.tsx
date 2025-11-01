/**
 * Document Modal Integration Test
 * Tests for Story 3.7 - Modal interaction with DocumentPreview
 */

import { describe, it, expect } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { DocumentPreview } from "@/components/panels/document-preview";

describe("DocumentModal Integration", () => {
  it("opens modal when View Full button is clicked", async () => {
    const longContent = "a".repeat(300);

    render(
      <DocumentPreview
        source="test.md"
        content={longContent}
        similarity={0.9}
      />
    );

    // Modal should not be visible initially
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Click View Full button
    const viewButton = screen.getByRole("button", { name: /view full/i });
    fireEvent.click(viewButton);

    // Modal should now be visible with full content
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Check dialog is open and has content (test.md appears in both preview and modal)
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/a{300}/)).toBeInTheDocument();
  });

  it("closes modal when Escape key is pressed", async () => {
    render(
      <DocumentPreview
        source="test.md"
        content="Test content"
        similarity={0.9}
      />
    );

    // Open modal
    const viewButton = screen.getByRole("button", { name: /view full/i });
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Press Escape
    fireEvent.keyDown(document, { key: "Escape" });

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("displays full content that was truncated in preview", async () => {
    const longContent = "This is a very long document content that exceeds the 200 character limit and should be truncated in the preview but shown in full in the modal. ".repeat(5);

    render(
      <DocumentPreview
        source="docs/architecture.md"
        content={longContent}
        similarity={0.92}
      />
    );

    // Preview should show truncated content
    const preview = screen.getByText(/\.\.\./);
    expect(preview.textContent?.length).toBeLessThan(longContent.length);

    // Open modal
    const viewButton = screen.getByRole("button", { name: /view full/i });
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Modal should be open
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows correct similarity percentage in modal", async () => {
    render(
      <DocumentPreview
        source="test.md"
        content="Test content"
        similarity={0.847}
      />
    );

    // Open modal
    const viewButton = screen.getByRole("button", { name: /view full/i });
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Check similarity percentage with one decimal place
    expect(screen.getByText("84.7%")).toBeInTheDocument();
  });

  it("allows multiple DocumentPreview components to have independent modals", async () => {
    render(
      <div>
        <DocumentPreview
          source="doc1.md"
          content="Content 1"
          similarity={0.9}
        />
        <DocumentPreview
          source="doc2.md"
          content="Content 2"
          similarity={0.8}
        />
      </div>
    );

    // Get all View Full buttons
    const viewButtons = screen.getAllByRole("button", { name: /view full/i });
    expect(viewButtons).toHaveLength(2);

    // Click first button
    fireEvent.click(viewButtons[0]!);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // First document modal should be shown
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    // Content 1 should be in modal (pre tag)
    expect(screen.getAllByText("Content 1").length).toBeGreaterThan(0);

    // Close modal
    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // Click second button
    fireEvent.click(viewButtons[1]!);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Second document modal should be shown
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getAllByText("Content 2").length).toBeGreaterThan(0);
  });

  it("preserves document formatting in modal", async () => {
    const formattedContent = `Line 1
  Indented line
    Double indented

New paragraph`;

    render(
      <DocumentPreview
        source="formatted.md"
        content={formattedContent}
        similarity={0.95}
      />
    );

    // Open modal
    const viewButton = screen.getByRole("button", { name: /view full/i });
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Modal should be open
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    // Check for content that appears in full but not truncated (New paragraph)
    expect(screen.getAllByText(/New paragraph/).length).toBeGreaterThan(0);
  });
});
