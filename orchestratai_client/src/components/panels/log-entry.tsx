"use client";

import type { JSX } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * LogEntry Props
 * Base component for rendering retrieval log entries with color-coded backgrounds
 */
interface LogEntryProps {
  /**
   * Type of log entry determines the color scheme
   * - routing: Blue (query analysis and intent detection)
   * - vector_search: Purple (similarity search operations)
   * - cache: Green (cache hit/miss operations)
   * - documents: Cyan (document retrieval)
   * - error: Red (error conditions)
   */
  type: "routing" | "vector_search" | "cache" | "documents" | "error";
  /** Timestamp of the log entry */
  timestamp: Date;
  /** Child components (specific log card content) */
  children: React.ReactNode;
}

/**
 * Map log type to background and border utility classes
 * Uses 3-tier token system defined in globals.css
 */
const getLogTypeClasses = (
  type: LogEntryProps["type"]
): { bg: string; border: string; text: string } => {
  switch (type) {
    case "routing":
      return {
        bg: "bg-log-query",
        border: "border-l-log-query",
        text: "text-log-query",
      };
    case "vector_search":
      return {
        bg: "bg-log-vector",
        border: "border-l-log-vector",
        text: "text-log-vector",
      };
    case "cache":
      return {
        bg: "bg-log-cache",
        border: "border-l-log-cache",
        text: "text-log-cache",
      };
    case "documents":
      // Using cache colors as fallback (can be updated if document-specific tokens are added)
      return {
        bg: "bg-log-cache",
        border: "border-l-log-cache",
        text: "text-log-cache",
      };
    case "error":
      return {
        bg: "bg-log-error",
        border: "border-l-log-error",
        text: "text-log-error",
      };
  }
};

/**
 * LogEntry Component
 *
 * Base component that wraps specific log cards with consistent styling:
 * - Color-coded background based on log type
 * - Left border accent for visual distinction
 * - Formatted timestamp in HH:mm:ss format
 *
 * Usage:
 * ```tsx
 * <LogEntry type="routing" timestamp={new Date()}>
 *   <QueryAnalysisCard {...data} />
 * </LogEntry>
 * ```
 */
export function LogEntry({
  type,
  timestamp,
  children,
}: LogEntryProps): JSX.Element {
  const classes = getLogTypeClasses(type);
  const formattedTime = format(timestamp, "HH:mm:ss");

  return (
    <Card
      className={cn(classes.bg, classes.border, "border-l-4 transition-colors")}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <span className={cn("text-xs font-medium", classes.text)}>
            {formattedTime}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}
