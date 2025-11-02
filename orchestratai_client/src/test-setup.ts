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

// Mock scrollIntoView for auto-scroll functionality
if (typeof window !== "undefined") {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
}

// Mock framer-motion to avoid animation issues in tests

vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, prop: string) => {
        return ({
          children,
          ...props
        }: {
          children?: ReactNode;
          [key: string]: unknown;
        }) => createElement(prop, props, children);
      },
    }
  ),
  AnimatePresence: ({ children }: { children?: ReactNode }) =>
    createElement(Fragment, null, children),
}));
