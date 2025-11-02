import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton } from "../skeleton";

describe("Skeleton", () => {
  it("should render with default styles", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass("bg-bg-tertiary");
    expect(skeleton).toHaveClass("rounded-md");
  });

  it("should apply custom className", () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).toHaveClass("h-4");
    expect(skeleton).toHaveClass("w-32");
  });

  it("should have shimmer animation classes", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;

    // Check for shimmer-related classes
    expect(skeleton).toHaveClass("before:animate-shimmer");
    expect(skeleton).toHaveClass("overflow-hidden");
  });

  it("should have accessibility attributes", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).toHaveAttribute("aria-busy", "true");
    expect(skeleton).toHaveAttribute("aria-live", "polite");
  });

  it("should accept multiple custom classes", () => {
    const { container } = render(
      <Skeleton className="h-10 w-full rounded-full bg-gray-300" />
    );
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).toHaveClass("h-10");
    expect(skeleton).toHaveClass("w-full");
    expect(skeleton).toHaveClass("rounded-full");
    expect(skeleton).toHaveClass("bg-gray-300");
  });

  it("should merge custom classes with default classes", () => {
    const { container } = render(<Skeleton className="custom-class" />);
    const skeleton = container.firstChild as HTMLElement;

    // Should have both default and custom classes
    expect(skeleton).toHaveClass("custom-class");
    expect(skeleton).toHaveClass("bg-bg-tertiary");
    expect(skeleton).toHaveClass("rounded-md");
  });
});
