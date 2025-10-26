import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";
import { ChatProvider } from "@/components/providers/chat-provider";

const renderHome = (): void => {
  render(
    <ChatProvider>
      <Home />
    </ChatProvider>
  );
};

describe("Home Page", () => {
  beforeEach(() => {
    // Mock scrollIntoView for MessageList component
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });
  it("renders the header with OrchestratAI branding", () => {
    renderHome();
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toContain("OrchestratAI");
  });

  it("renders the header subtitle", () => {
    renderHome();
    expect(
      screen.getByText(/LangGraph Orchestrator \+ RAG\/CAG Hybrid/i)
    ).toBeInTheDocument();
  });

  it("renders the ACTIVE status badge", () => {
    renderHome();
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
  });

  it("renders the three panel layout", () => {
    renderHome();
    // Both desktop and mobile layouts render these panels
    expect(screen.getAllByLabelText("Agent Pipeline").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("Chat Interface").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("Retrieval Log").length).toBeGreaterThan(0);
  });

  it("renders footer metrics", () => {
    renderHome();
    expect(screen.getByText(/Latency:/)).toBeInTheDocument();
    expect(screen.getByText(/Tokens:/)).toBeInTheDocument();
    expect(screen.getByText(/Cost:/)).toBeInTheDocument();
    expect(screen.getByText(/ChromaDB:/)).toBeInTheDocument();
  });
});
