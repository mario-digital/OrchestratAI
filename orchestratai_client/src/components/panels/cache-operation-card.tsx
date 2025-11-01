"use client";

import type { JSX } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle } from "lucide-react";

/**
 * CacheOperationCard Props
 * Displays cache operation results
 */
interface CacheOperationCardProps {
  /** Whether the cache operation was a hit (true) or miss (false) */
  isHit: boolean;
  /** Cache hit rate as a percentage (0.0 to 1.0) */
  hitRate: number;
  /** Current cache size (number of entries) */
  cacheSize: number;
  /** Optional cache key that was queried */
  cacheKey?: string;
}

/**
 * CacheOperationCard Component
 *
 * Displays cache operation details including:
 * - Hit/Miss status with colored badge and icon
 * - Cache hit rate percentage with progress bar
 * - Current cache size for monitoring
 * - Optional cache key for debugging
 *
 * Usage:
 * ```tsx
 * <CacheOperationCard
 *   isHit={true}
 *   hitRate={0.78}
 *   cacheSize={156}
 *   cacheKey="query:12345"
 * />
 * ```
 */
export function CacheOperationCard({
  isHit,
  hitRate,
  cacheSize,
  cacheKey,
}: CacheOperationCardProps): JSX.Element {
  const hitRatePercent = Math.round(hitRate * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text-primary">
          Cache Operation
        </h4>
      </div>

      <div className="space-y-2">
        {/* Hit/Miss Status */}
        <div>
          <span className="text-xs font-medium text-text-secondary">
            Status:
          </span>
          <div className="mt-1 flex items-center gap-2">
            {isHit ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  HIT
                </Badge>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-yellow-500" />
                <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                  MISS
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Hit Rate */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-text-secondary">
              Hit Rate:
            </span>
            <span className="text-xs text-text-secondary">
              {hitRatePercent}%
            </span>
          </div>
          <Progress value={hitRatePercent} className="h-2" />
        </div>

        {/* Cache Size */}
        <div>
          <span className="text-xs font-medium text-text-secondary">
            Cache Size:
          </span>
          <p className="text-sm text-text-primary mt-0.5">
            {cacheSize} entr{cacheSize !== 1 ? "ies" : "y"}
          </p>
        </div>

        {/* Cache Key (optional, for debugging) */}
        {cacheKey && (
          <div>
            <span className="text-xs font-medium text-text-secondary">
              Cache Key:
            </span>
            <p className="text-xs text-text-tertiary mt-0.5 font-mono truncate">
              {cacheKey}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
