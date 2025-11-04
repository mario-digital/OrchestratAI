/**
 * ChatErrorBoundary Tests
 * Tests for error boundary component
 */

import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatErrorBoundary } from "../chat-error-boundary";

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
}

describe("ChatErrorBoundary", () => {
  // Suppress console.error for these tests
  const originalError = console.error;

  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it("renders children when there is no error", () => {
    render(
      <ChatErrorBoundary>
        <div>Test content</div>
      </ChatErrorBoundary>
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders error UI when child component throws", () => {
    render(
      <ChatErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ChatErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText(/The chat interface encountered an error/)
    ).toBeInTheDocument();
  });

  it("shows Try Again button in error state", () => {
    render(
      <ChatErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ChatErrorBoundary>
    );

    expect(
      screen.getByRole("button", { name: /try again/i })
    ).toBeInTheDocument();
  });

  it("Try Again button is clickable", () => {
    render(
      <ChatErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ChatErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    const button = screen.getByRole("button", { name: /try again/i });

    // Button should be present and enabled
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });
});
