import { ReactElement } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ThreePanelLayout } from "@/components/layout/three-panel-layout";
import { MobileLayout } from "@/components/layout/mobile-layout";
import { CollapsiblePanel } from "@/components/panels/collapsible-panel";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ChatErrorBoundary } from "@/components/chat/chat-error-boundary";

export default function Home(): ReactElement {
  // Chat interface with full state management wrapped in error boundary
  const chatPanel = (
    <ChatErrorBoundary>
      <ChatInterface />
    </ChatErrorBoundary>
  );

  // Placeholder panels (to be replaced with real components in Epic 3+)
  const agentsPanel = (
    <CollapsiblePanel side="left">
      <p className="text-text-secondary">Agent Pipeline (Epic 3)</p>
    </CollapsiblePanel>
  );
  const logsPanel = (
    <CollapsiblePanel side="right">
      <p className="text-text-secondary">Retrieval Log (Epic 3)</p>
    </CollapsiblePanel>
  );

  return (
    <div className="flex flex-col h-screen max-w-screen-2xl mx-auto overflow-hidden">
      <Header />

      {/* Desktop Layout (>=768px) */}
      <div className="hidden md:flex md:flex-1 overflow-hidden">
        <ThreePanelLayout>{chatPanel}</ThreePanelLayout>
      </div>

      {/* Mobile Layout (<768px) */}
      <MobileLayout
        chatPanel={chatPanel}
        agentsPanel={agentsPanel}
        logsPanel={logsPanel}
      />

      <Footer />
    </div>
  );
}
