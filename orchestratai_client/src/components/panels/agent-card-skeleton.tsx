import { type JSX } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * AgentCardSkeleton - Loading placeholder for AgentCard component
 *
 * Matches the exact dimensions and layout of AgentCard to prevent
 * layout shift when transitioning from skeleton to real content.
 *
 * Features:
 * - Same card structure as AgentCard
 * - Shimmer effect on all placeholder elements
 * - No layout shift on content load
 * - Accessible with aria-busy state
 *
 * Layout matches AgentCard:
 * - Header: Icon (16px) + Agent name + Status badge
 * - Model name below header
 * - Strategy row (always visible)
 *
 * @example
 * ```tsx
 * // Show skeleton while loading
 * {isLoading ? (
 *   <AgentCardSkeleton />
 * ) : (
 *   <AgentCard {...agentData} />
 * )}
 * ```
 */
export function AgentCardSkeleton(): JSX.Element {
  return (
    <Card
      className="transition-all duration-200 bg-bg-primary border-border-default"
      aria-busy="true"
      aria-label="Loading agent card"
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        {/* Left side: Icon + Agent name */}
        <div className="flex items-center gap-2">
          {/* Icon skeleton (16px square) */}
          <Skeleton className="size-4 rounded-sm" />
          {/* Agent name skeleton */}
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Right side: Status badge */}
        <Skeleton className="h-5 w-16 rounded-full" />
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Model name skeleton */}
        <Skeleton className="h-4 w-32" />

        {/* Strategy row skeleton (always visible like IDLE state) */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" /> {/* "Strategy:" label */}
          <Skeleton className="h-4 w-12" /> {/* Strategy value */}
        </div>
      </CardContent>
    </Card>
  );
}
