"use client";

import { ReactNode, ReactElement, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { springPhysics } from "@/lib/animations";

interface CollapsiblePanelProps {
  children: ReactNode;
  side: "left" | "right";
  defaultOpen?: boolean;
}

/**
 * Determines the appropriate chevron icon based on panel state and side.
 * - Open left panel: ChevronLeft (points inward to collapse)
 * - Closed left panel: ChevronRight (points outward to expand)
 * - Open right panel: ChevronRight (points inward to collapse)
 * - Closed right panel: ChevronLeft (points outward to expand)
 */
function getChevronIcon(isOpen: boolean, side: "left" | "right"): LucideIcon {
  if (isOpen) {
    return side === "left" ? ChevronLeft : ChevronRight;
  }
  return side === "left" ? ChevronRight : ChevronLeft;
}

export function CollapsiblePanel({
  children,
  side,
  defaultOpen = true,
}: CollapsiblePanelProps): ReactElement {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Render the appropriate icon inline to satisfy ESLint rules
  const renderIcon = (): ReactElement => {
    const IconComponent = getChevronIcon(isOpen, side);
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex flex-col h-full">
        {/* Hide collapse trigger on mobile (<768px), show only on desktop */}
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "mb-2 hidden md:flex",
              side === "left" ? "self-start" : "self-end"
            )}
          >
            {renderIcon()}
            {isOpen && <span className="ml-2">Collapse</span>}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="overflow-hidden">
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={springPhysics.natural}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
