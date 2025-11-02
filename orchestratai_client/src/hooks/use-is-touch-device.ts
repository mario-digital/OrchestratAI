"use client";

import { useState, useEffect } from "react";

/**
 * Detects if device supports hover (not a touch-only device)
 *
 * Uses media query `(hover: hover) and (pointer: fine)` to detect devices
 * with precise pointing devices (mouse/trackpad).
 *
 * Returns:
 * - `false` for devices with mouse/trackpad (hover supported)
 * - `true` for touch-only devices (hover not supported)
 *
 * @returns {boolean} true if touch device, false if hover-capable device
 *
 * @example
 * ```tsx
 * const isTouch = useIsTouchDevice();
 * <motion.div whileHover={!isTouch ? hoverVariant : undefined}>
 * ```
 */
export function useIsTouchDevice(): boolean {
  // Initialize with matchMedia check (runs before first render)
  const [isTouch, setIsTouch] = useState(() => {
    if (typeof window === "undefined") return false;
    return !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  });

  useEffect(() => {
    // Check if device supports hover and has fine pointer (mouse/trackpad)
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");

    const handleChange = (): void => setIsTouch(!query.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return isTouch;
}
