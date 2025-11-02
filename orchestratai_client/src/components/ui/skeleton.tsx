import { type JSX } from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  /**
   * Additional CSS classes for custom dimensions
   * @example "h-4 w-32" for a small text skeleton
   */
  className?: string;
}

/**
 * Skeleton loading component with shimmer effect
 *
 * Used as placeholder while content loads. Provides visual feedback
 * with animated shimmer effect that moves left-to-right.
 *
 * Features:
 * - 1.5s shimmer animation loop
 * - GPU-accelerated transform animations
 * - Accessible with implicit aria-busy state
 * - Customizable dimensions via className prop
 *
 * @example
 * ```tsx
 * // Text skeleton
 * <Skeleton className="h-4 w-32" />
 *
 * // Avatar skeleton
 * <Skeleton className="size-10 rounded-full" />
 *
 * // Card skeleton
 * <Skeleton className="h-24 w-full" />
 * ```
 */
export function Skeleton({ className }: SkeletonProps): JSX.Element {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-bg-tertiary",
        "before:absolute before:inset-0",
        "before:-translate-x-full before:animate-shimmer",
        "before:bg-gradient-to-r before:from-transparent",
        "before:via-white/10 before:to-transparent",
        className
      )}
      aria-busy="true"
      aria-live="polite"
    />
  );
}
