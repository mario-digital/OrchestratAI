import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { createElement, Fragment } from "react";
import type { ReactNode } from "react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock ResizeObserver for Radix UI components
global.ResizeObserver = class ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
};

// Mock scrollIntoView and scrollTo for auto-scroll functionality
if (typeof window !== "undefined") {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.scrollTo = vi.fn();

  // Mock matchMedia for touch device detection
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === "(hover: hover) and (pointer: fine)", // Default: non-touch device
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Mock framer-motion to avoid animation issues in tests

vi.mock("framer-motion", () => {
  const passthrough = new Proxy(
    {},
    {
      get: (_target, prop: string) => {
        return ({
          children,
          ...props
        }: {
          children?: ReactNode;
          [key: string]: unknown;
        }) => {
          const {
            initial: _initial,
            animate: _animate,
            exit: _exit,
            variants: _variants,
            transition: _transition,
            whileHover: _whileHover,
            whileTap: _whileTap,
            layout: _layout,
            ...rest
          } = props;
          return createElement(prop, rest, children);
        };
      },
    }
  );

  return {
    motion: passthrough,
    AnimatePresence: ({ children }: { children?: ReactNode }) =>
      createElement(Fragment, null, children),
  };
});
