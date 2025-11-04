"use client";

import { ReactElement } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ThreePanelLayout } from "@/components/layout/three-panel-layout";
import { MobileLayout } from "@/components/layout/mobile-layout";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ChatErrorBoundary } from "@/components/chat/chat-error-boundary";
import { RetrievalPanel } from "@/components/panels/retrieval-panel";
import { AgentPanel } from "@/components/panels/agent-panel";
import { useChatContext } from "@/components/providers/chat-provider";

export default function Home(): ReactElement {
  const { latestMetrics, dbStatus } = useChatContext();
  // Chat interface with full state management wrapped in error boundary
  const chatPanel = (
    <ChatErrorBoundary>
      <ChatInterface />
    </ChatErrorBoundary>
  );

  // Left panel: Agent Pipeline (Story 3.5)
  // Note: AgentPanel handles its own collapse via ThreePanelLayout context
  const agentsPanel = <AgentPanel />;

  // Right panel: Retrieval Logs (Story 3.6)
  // Note: RetrievalPanel handles its own collapse via ThreePanelLayout context
  const logsPanel = <RetrievalPanel />;

  return (
    <div className="flex flex-col h-screen max-w-screen-2xl mx-auto">
      {/* Header - Hidden on mobile, visible on desktop */}
      <Header className="hidden md:block shrink-0" />

      {/* Desktop Layout (>=768px) */}
      <div className="hidden md:flex md:flex-1 overflow-hidden">
        <ThreePanelLayout leftPanel={agentsPanel} rightPanel={logsPanel}>
          {chatPanel}
        </ThreePanelLayout>
      </div>

      {/* Mobile Layout (<768px) */}
      <MobileLayout
        chatPanel={chatPanel}
        agentsPanel={agentsPanel}
        logsPanel={logsPanel}
      />

      {/* Footer - Hidden on mobile, visible on desktop */}
      <Footer
        className="hidden md:block shrink-0"
        latency={latestMetrics?.latency}
        tokens={latestMetrics?.tokens}
        cost={latestMetrics?.cost}
        dbStatus={dbStatus}
      />
    </div>
  );
}
