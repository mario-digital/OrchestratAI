"use client";

import type { JSX } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

/**
 * CacheOperationCard Props
 * Displays cache operation results
 */
interface CacheOperationCardProps {
  /** Whether the cache operation was a hit (true) or miss (false) */
  _isHit: boolean;
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
  _isHit: isHit,
  hitRate,
  cacheSize,
  cacheKey,
}: CacheOperationCardProps): JSX.Element {
  const hitRatePercent = Math.round(hitRate * 100);

  return (
    <div className="space-y-2 text-sm">
      {/* Hit/Miss Status Badge */}
      <div className="flex items-center gap-2">
        {isHit ? (
          <Badge
            variant="outline"
            className="bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            HIT
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
          >
            <XCircle className="w-3 h-3 mr-1" />
            MISS
          </Badge>
        )}
      </div>

      {/* Message/Description */}
      <div>
        <p className="text-text-primary">
          {cacheKey || "Session cache updated with pricing policy data"}
        </p>
      </div>

      {/* Size & Hit Rate */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-xs text-text-tertiary">Size:</span>
          <p className="text-text-primary">
            {cacheSize >= 1024
              ? `${(cacheSize / 1024).toFixed(1)} KB`
              : `${cacheSize} B`}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-text-tertiary">HitRate:</span>
          <p className="text-text-primary">{hitRatePercent}%</p>
        </div>
      </div>
    </div>
  );
}
