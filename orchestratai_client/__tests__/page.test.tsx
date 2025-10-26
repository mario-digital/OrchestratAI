import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("Home Page", () => {
  it("renders the header with OrchestratAI branding", () => {
    render(<Home />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toContain("OrchestratAI");
  });

  it("renders the header subtitle", () => {
    render(<Home />);
    expect(
      screen.getByText(/LangGraph Orchestrator \+ RAG\/CAG Hybrid/i)
    ).toBeInTheDocument();
  });

  it("renders the ACTIVE status badge", () => {
    render(<Home />);
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
  });

  it("renders the three panel layout", () => {
    render(<Home />);
    expect(screen.getByLabelText("Agent Pipeline")).toBeInTheDocument();
    expect(screen.getByLabelText("Chat Interface")).toBeInTheDocument();
    expect(screen.getByLabelText("Retrieval Log")).toBeInTheDocument();
  });

  it("renders footer metrics", () => {
    render(<Home />);
    expect(screen.getByText(/Latency:/)).toBeInTheDocument();
    expect(screen.getByText(/Tokens:/)).toBeInTheDocument();
    expect(screen.getByText(/Cost:/)).toBeInTheDocument();
    expect(screen.getByText(/ChromaDB:/)).toBeInTheDocument();
  });
});
