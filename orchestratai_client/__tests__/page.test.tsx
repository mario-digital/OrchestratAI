import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("Home Page", () => {
  it("renders the main heading", () => {
    render(<Home />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toContain("OrchestratAI");
  });

  it("renders the description", () => {
    render(<Home />);
    expect(
      screen.getByText(/AI-powered workflow orchestration platform/i)
    ).toBeInTheDocument();
  });

  it("renders the API health check link", () => {
    render(<Home />);
    const link = screen.getByRole("link", { name: /check api health/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/api/health");
  });
});
