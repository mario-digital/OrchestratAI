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
    <div className="md:hidden flex flex-col flex-1">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex-1 flex flex-col"
      >
        <TabsList className="sticky top-0 z-10 w-full justify-start border-b border-border-default rounded-none h-auto p-0 shrink-0 pt-safe">
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
          className="flex-1 overflow-hidden p-0 mobile-tabs-chat-content"
          aria-label="Chat Interface"
        >
          <div className="h-full">{chatPanel}</div>
        </TabsContent>

        <TabsContent
          value="agents"
          className="flex-1 overflow-hidden p-0 mobile-tabs-secondary-content"
          aria-label="Agent Pipeline"
        >
          <div className="h-full">{agentsPanel}</div>
        </TabsContent>

        <TabsContent
          value="logs"
          className="flex-1 overflow-hidden p-0 mobile-tabs-secondary-content"
          aria-label="Retrieval Log"
        >
          <div className="h-full">{logsPanel}</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
