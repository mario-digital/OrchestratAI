import { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";

interface ThreePanelLayoutProps {
  children?: ReactNode;
}

export function ThreePanelLayout({
  children,
}: ThreePanelLayoutProps): React.ReactElement {
  return (
    <div className="hidden md:grid grid-cols-three-panel-chat min-h-screen">
      {/* Left Panel - Agent Pipeline */}
      <aside
        aria-label="Agent Pipeline"
        className="bg-bg-secondary p-4 border-r border-border-default"
        tabIndex={0}
      >
        <p className="text-text-secondary">Agent Pipeline (Epic 3)</p>
      </aside>

      <Separator orientation="vertical" className="h-full" />

      {/* Center Panel - Chat Interface */}
      <main
        aria-label="Chat Interface"
        className="bg-bg-primary p-4"
        tabIndex={0}
      >
        {children || (
          <p className="text-text-secondary">Chat Interface (Epic 2)</p>
        )}
      </main>

      <Separator orientation="vertical" className="h-full" />

      {/* Right Panel - Retrieval Log */}
      <aside
        aria-label="Retrieval Log"
        className="bg-bg-secondary p-4 border-l border-border-default"
        tabIndex={0}
      >
        <p className="text-text-secondary">Retrieval Log (Epic 3)</p>
      </aside>
    </div>
  );
}
