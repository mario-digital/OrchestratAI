"use client";

import { useState, ReactNode, ReactElement } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface MobileLayoutProps {
  chatPanel: ReactNode;
  agentsPanel: ReactNode;
  logsPanel: ReactNode;
}

export function MobileLayout({
  chatPanel,
  agentsPanel,
  logsPanel,
}: MobileLayoutProps): ReactElement {
  // Initialize state from URL hash
  const getInitialTab = (): string => {
    if (typeof window === "undefined") return "chat";
    const hash = window.location.hash.replace("#", "");
    return hash === "agents" || hash === "logs" || hash === "chat"
      ? hash
      : "chat";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Update URL hash when tab changes
  const handleTabChange = (value: string): void => {
    setActiveTab(value);
    window.location.hash = `#${value}`;
  };

  return (
    <div className="md:hidden min-h-screen flex flex-col">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex-1 flex flex-col"
      >
        <TabsList className="w-full justify-start border-b border-border-default bg-bg-secondary rounded-none">
          <TabsTrigger value="chat" className="flex-1">
            Chat
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex-1">
            Agents
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex-1">
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="chat"
          className="flex-1 m-0 p-4"
          aria-label="Chat Interface"
        >
          {chatPanel}
        </TabsContent>

        <TabsContent
          value="agents"
          className="flex-1 m-0 p-4"
          aria-label="Agent Pipeline"
        >
          {agentsPanel}
        </TabsContent>

        <TabsContent
          value="logs"
          className="flex-1 m-0 p-4"
          aria-label="Retrieval Log"
        >
          {logsPanel}
        </TabsContent>
      </Tabs>
    </div>
  );
}
