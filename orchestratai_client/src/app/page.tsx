import { ReactElement } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ThreePanelLayout } from "@/components/layout/three-panel-layout";
import { MobileLayout } from "@/components/layout/mobile-layout";
import { CollapsiblePanel } from "@/components/panels/collapsible-panel";

export default function Home(): ReactElement {
  // Placeholder panels (to be replaced with real components in Epic 2+)
  const chatPanel = (
    <p className="text-text-secondary">Chat Interface (Epic 2)</p>
  );
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
    <div className="flex flex-col min-h-screen max-w-screen-2xl mx-auto">
      <Header />

      {/* Desktop Layout (>=768px) */}
      <div className="hidden md:flex md:flex-1">
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
