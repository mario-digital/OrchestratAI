import { useState, useEffect } from "react";

/**
 * Custom hook for persisting state to localStorage with SSR safety and error handling.
 *
 * Features:
 * - SSR-safe: Handles `window` being undefined during server-side rendering
 * - Hydration-safe: Always starts with defaultValue, syncs with localStorage after mount
 * - Error handling: Gracefully handles QuotaExceededError, SecurityError, and other localStorage failures
 * - Type-safe: Generic type parameter ensures type safety
 * - Automatic persistence: Saves to localStorage whenever value changes
 *
 * @template T - The type of value to store
 * @param key - The localStorage key to use for persistence
 * @param defaultValue - The default value if no stored value exists
 * @returns A tuple of [value, setValue] similar to useState
 *
 * @example
 * ```tsx
 * const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
 * const [isCollapsed, setIsCollapsed] = useLocalStorage('panel-collapsed', false);
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  // Always start with defaultValue to match SSR
  const [storedValue, setStoredValue] = useState<T>(defaultValue);

  // Load from localStorage after mount (client-side only)
  useEffect(() => {
    // SSR safety: Skip if window is undefined
    if (typeof window === "undefined") {
      return;
    }

    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        // Using queueMicrotask to avoid cascading renders
        queueMicrotask(() => {
          setStoredValue(JSON.parse(item) as T);
        });
      }
    } catch (error) {
      console.warn(
        `useLocalStorage: Failed to load value for key "${key}":`,
        error
      );
    }
  }, [key]);

  // Save to localStorage whenever storedValue changes
  useEffect(() => {
    // SSR safety: Skip if window is undefined
    if (typeof window === "undefined") {
      return;
    }

    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(
        `useLocalStorage: Failed to persist value for key "${key}":`,
        error
      );
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
