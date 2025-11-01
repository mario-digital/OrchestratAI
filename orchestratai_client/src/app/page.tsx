import { ReactElement } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ThreePanelLayout } from "@/components/layout/three-panel-layout";
import { MobileLayout } from "@/components/layout/mobile-layout";
import { CollapsiblePanel } from "@/components/panels/collapsible-panel";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ChatErrorBoundary } from "@/components/chat/chat-error-boundary";
import { RetrievalPanel } from "@/components/panels/retrieval-panel";
import { AgentPanel } from "@/components/panels/agent-panel";

export default function Home(): ReactElement {
  // Chat interface with full state management wrapped in error boundary
  const chatPanel = (
    <ChatErrorBoundary>
      <ChatInterface />
    </ChatErrorBoundary>
  );

  // Left panel: Agent Pipeline (Story 3.5)
  const agentsPanel = (
    <CollapsiblePanel side="left">
      <AgentPanel />
    </CollapsiblePanel>
  );

  // Right panel: Retrieval Logs (Story 3.6)
  const logsPanel = (
    <CollapsiblePanel side="right">
      <RetrievalPanel />
    </CollapsiblePanel>
  );

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
      <Footer className="hidden md:block shrink-0" />
    </div>
  );
}
