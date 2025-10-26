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
  // Initialize with URL hash if available, otherwise default to "chat"
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash === "agents" || hash === "logs" || hash === "chat") {
        return hash;
      }
    }
    return "chat";
  });

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
        <TabsList className="w-full justify-start border-b border-border-default bg-transparent rounded-none h-auto p-0">
          <TabsTrigger value="chat" className="flex-1 rounded-none">
            Chat
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex-1 rounded-none">
            Agents
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex-1 rounded-none">
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
