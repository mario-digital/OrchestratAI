"use client";

import { useState, useEffect, ReactNode, ReactElement } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsiblePanelProps {
  children: ReactNode;
  side: "left" | "right";
  storageKey: string;
  defaultOpen?: boolean;
}

export function CollapsiblePanel({
  children,
  side,
  storageKey,
  defaultOpen = true,
}: CollapsiblePanelProps): ReactElement {
  // Initialize state from localStorage or defaultOpen
  const [isOpen, setIsOpen] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored !== null) {
      return JSON.parse(stored) as boolean;
    }
    return defaultOpen;
  });

  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(isOpen));
  }, [isOpen, storageKey]);

  const Icon = isOpen
    ? side === "left"
      ? ChevronLeft
      : ChevronRight
    : side === "left"
      ? ChevronRight
      : ChevronLeft;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex flex-col h-full">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn("mb-2", side === "left" ? "self-start" : "self-end")}
          >
            <Icon className="h-4 w-4" />
            {isOpen && <span className="ml-2">Collapse</span>}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="transition-all duration-300 ease-in-out">
          {children}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
