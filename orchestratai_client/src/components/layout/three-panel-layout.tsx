import { ReactNode, ReactElement } from "react";
import { CollapsiblePanel } from "@/components/panels/collapsible-panel";

interface ThreePanelLayoutProps {
  children?: ReactNode;
}

export function ThreePanelLayout({
  children,
}: ThreePanelLayoutProps): ReactElement {
  return (
    <div className="flex-1 overflow-hidden grid grid-cols-three-panel-chat">
      {/* Left Panel - Agent Pipeline */}
      <aside
        aria-label="Agent Pipeline"
        className="bg-bg-secondary p-4 border-r border-border-default overflow-y-auto"
        tabIndex={0}
      >
        <CollapsiblePanel side="left">
          <p className="text-text-secondary">Agent Pipeline (Epic 3)</p>
        </CollapsiblePanel>
      </aside>

      {/* Center Panel - Chat Interface */}
      <main
        aria-label="Chat Interface"
        className="bg-bg-primary overflow-hidden"
        tabIndex={0}
      >
        {children || (
          <p className="text-text-secondary">Chat Interface (Epic 2)</p>
        )}
      </main>

      {/* Right Panel - Retrieval Log */}
      <aside
        aria-label="Retrieval Log"
        className="bg-bg-secondary p-4 border-l border-border-default overflow-y-auto"
        tabIndex={0}
      >
        <CollapsiblePanel side="right">
          <p className="text-text-secondary">Retrieval Log (Epic 3)</p>
        </CollapsiblePanel>
      </aside>
    </div>
  );
}
