"use client";

import {
  ReactNode,
  ReactElement,
  useState,
  createContext,
  useContext,
  useMemo,
  useCallback,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { staggerContainer, fadeSlideUp } from "@/lib/animations";

interface ThreePanelLayoutProps {
  children?: ReactNode;
  leftPanel?: ReactNode;
  rightPanel?: ReactNode;
}

interface PanelCollapseContextType {
  isRightPanelCollapsed: boolean;
  toggleRightPanel: () => void;
  isLeftPanelCollapsed: boolean;
  toggleLeftPanel: () => void;
}

const noop = (): void => {};

const PanelCollapseContext = createContext<PanelCollapseContextType | null>(
  null
);

const defaultPanelContext: PanelCollapseContextType = {
  isLeftPanelCollapsed: false,
  toggleLeftPanel: noop,
  isRightPanelCollapsed: false,
  toggleRightPanel: noop,
};

export function usePanelCollapse(): PanelCollapseContextType {
  const context = useContext(PanelCollapseContext);
  if (!context) {
    return defaultPanelContext;
  }
  return context;
}

export function ThreePanelLayout({
  children,
  leftPanel,
  rightPanel,
}: ThreePanelLayoutProps): ReactElement {
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);

  const toggleRightPanel = useCallback((): void => {
    setIsRightPanelCollapsed((prev) => !prev);
  }, []);

  const toggleLeftPanel = useCallback((): void => {
    setIsLeftPanelCollapsed((prev) => !prev);
  }, []);

  const contextValue = useMemo(
    () => ({
      isRightPanelCollapsed,
      toggleRightPanel,
      isLeftPanelCollapsed,
      toggleLeftPanel,
    }),
    [
      isRightPanelCollapsed,
      isLeftPanelCollapsed,
      toggleRightPanel,
      toggleLeftPanel,
    ]
  );

  return (
    <PanelCollapseContext.Provider value={contextValue}>
      <div className="relative flex-1 overflow-hidden">
        <motion.div
          className="h-full grid grid-cols-three-panel-chat grid-rows-1"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Left Panel - Agent Pipeline (collapsible) */}
          <div className="relative h-full">
            <AnimatePresence initial={false}>
              {!isLeftPanelCollapsed && (
                <motion.aside
                  key="left-panel"
                  variants={fadeSlideUp}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  aria-label="Agent Pipeline"
                  className="flex h-full flex-col bg-bg-secondary border-r border-border-default overflow-hidden"
                  tabIndex={0}
                >
                  {leftPanel || (
                    <p className="text-text-secondary">
                      Agent Pipeline (Epic 3)
                    </p>
                  )}
                </motion.aside>
              )}
            </AnimatePresence>
          </div>

          {/* Center Panel - Chat Interface */}
          <motion.main
            variants={fadeSlideUp}
            aria-label="Chat Interface"
            className="bg-bg-primary h-full flex flex-col overflow-hidden"
            tabIndex={0}
          >
            {children || (
              <p className="text-text-secondary">Chat Interface (Epic 2)</p>
            )}
          </motion.main>

          {/* Right Panel - Retrieval Log (collapsible) */}
          <div className="relative h-full">
            <AnimatePresence initial={false}>
              {!isRightPanelCollapsed && (
                <motion.aside
                  key="right-panel"
                  variants={fadeSlideUp}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  aria-label="Retrieval Log"
                  className="flex h-full flex-col bg-bg-secondary border-l border-border-default overflow-hidden"
                  tabIndex={0}
                >
                  {rightPanel || (
                    <p className="text-text-secondary">
                      Retrieval Log (Epic 3)
                    </p>
                  )}
                </motion.aside>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Left Expand Button - Shows when left panel is collapsed */}
        {isLeftPanelCollapsed && (
          <button
            onClick={toggleLeftPanel}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-bg-secondary border-r border-t border-b border-border-default rounded-r-md p-2 hover:bg-bg-tertiary transition-colors shadow-lg z-50"
            aria-label="Expand agent pipeline"
          >
            <div className="flex flex-col items-center gap-1">
              <svg
                className="w-4 h-4 text-agent-card-text-cyan"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <svg
                className="w-4 h-4 text-text-tertiary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        )}

        {/* Right Expand Button - Shows when right panel is collapsed */}
        {isRightPanelCollapsed && (
          <button
            onClick={toggleRightPanel}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-bg-secondary border-l border-t border-b border-border-default rounded-l-md p-2 hover:bg-bg-tertiary transition-colors shadow-lg z-50"
            aria-label="Expand retrieval log"
          >
            <div className="flex flex-col items-center gap-1">
              <svg
                className="w-4 h-4 text-log-header-query"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <svg
                className="w-4 h-4 text-text-tertiary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </div>
          </button>
        )}
      </div>
    </PanelCollapseContext.Provider>
  );
}
