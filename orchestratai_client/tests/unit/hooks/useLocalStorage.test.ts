// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// Mock localStorage
class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = value;
  }

  removeItem(key: string) {
    delete this.store[key];
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index: number) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

const localStorageMock = new LocalStorageMock();
Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  it("returns default value when no stored value exists", () => {
    const { result } = renderHook(() =>
      useLocalStorage("test-key", "default-value")
    );

    expect(result.current[0]).toBe("default-value");
  });

  it("returns stored value when it exists", () => {
    localStorage.setItem("test-key", JSON.stringify("stored-value"));

    const { result } = renderHook(() =>
      useLocalStorage("test-key", "default-value")
    );

    expect(result.current[0]).toBe("stored-value");
  });

  it("persists value to localStorage when updated", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    act(() => {
      result.current[1]("updated");
    });

    expect(localStorage.getItem("test-key")).toBe(JSON.stringify("updated"));
    expect(result.current[0]).toBe("updated");
  });

  it("handles boolean values correctly", () => {
    const { result } = renderHook(() => useLocalStorage("bool-key", false));

    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
    expect(localStorage.getItem("bool-key")).toBe("true");
  });

  it("handles number values correctly", () => {
    const { result } = renderHook(() => useLocalStorage("number-key", 0));

    expect(result.current[0]).toBe(0);

    act(() => {
      result.current[1](42);
    });

    expect(result.current[0]).toBe(42);
    expect(localStorage.getItem("number-key")).toBe("42");
  });

  it("handles object values correctly", () => {
    type TestObject = { name: string; count: number };
    const defaultObj: TestObject = { name: "test", count: 0 };
    const updatedObj: TestObject = { name: "updated", count: 10 };

    const { result } = renderHook(() =>
      useLocalStorage<TestObject>("object-key", defaultObj)
    );

    expect(result.current[0]).toEqual(defaultObj);

    act(() => {
      result.current[1](updatedObj);
    });

    expect(result.current[0]).toEqual(updatedObj);
    expect(localStorage.getItem("object-key")).toBe(JSON.stringify(updatedObj));
  });

  it("handles array values correctly", () => {
    const defaultArray = [1, 2, 3];
    const updatedArray = [4, 5, 6];

    const { result } = renderHook(() =>
      useLocalStorage<number[]>("array-key", defaultArray)
    );

    expect(result.current[0]).toEqual(defaultArray);

    act(() => {
      result.current[1](updatedArray);
    });

    expect(result.current[0]).toEqual(updatedArray);
    expect(localStorage.getItem("array-key")).toBe(
      JSON.stringify(updatedArray)
    );
  });

  it("returns default value when localStorage contains invalid JSON", () => {
    localStorage.setItem("invalid-key", "not-valid-json{");
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { result } = renderHook(() =>
      useLocalStorage("invalid-key", "default")
    );

    expect(result.current[0]).toBe("default");
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load value for key "invalid-key"'),
      expect.any(Error)
    );

    consoleWarnSpy.mockRestore();
  });

  it("handles localStorage getItem errors gracefully", () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const originalGetItem = localStorageMock.getItem.bind(localStorageMock);

    // Mock getItem to throw
    localStorageMock.getItem = () => {
      throw new Error("Storage unavailable");
    };

    const { result } = renderHook(() => useLocalStorage("error-key", "default"));

    expect(result.current[0]).toBe("default");
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load value for key "error-key"'),
      expect.any(Error)
    );

    // Restore
    localStorageMock.getItem = originalGetItem;
    consoleWarnSpy.mockRestore();
  });

  it("handles localStorage setItem errors gracefully", () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const originalSetItem = localStorageMock.setItem.bind(localStorageMock);

    // Mock setItem to throw
    localStorageMock.setItem = () => {
      throw new Error("QuotaExceededError");
    };

    const { result } = renderHook(() => useLocalStorage("quota-key", "value"));

    act(() => {
      result.current[1]("new-value");
    });

    // Value should still update in state even if localStorage fails
    expect(result.current[0]).toBe("new-value");
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to persist value for key "quota-key"'),
      expect.any(Error)
    );

    // Restore
    localStorageMock.setItem = originalSetItem;
    consoleWarnSpy.mockRestore();
  });

  it("updates localStorage when key changes", () => {
    const { result, rerender } = renderHook(
      ({ key, defaultValue }) => useLocalStorage(key, defaultValue),
      {
        initialProps: { key: "key1", defaultValue: "value1" },
      }
    );

    act(() => {
      result.current[1]("updated-value1");
    });

    expect(localStorage.getItem("key1")).toBe(JSON.stringify("updated-value1"));

    // Change the key
    rerender({ key: "key2", defaultValue: "value2" });

    expect(localStorage.getItem("key2")).toBe(JSON.stringify("updated-value1"));
  });

  it("maintains separate state for different keys", () => {
    const { result: result1 } = renderHook(() =>
      useLocalStorage("key1", "value1")
    );
    const { result: result2 } = renderHook(() =>
      useLocalStorage("key2", "value2")
    );

    expect(result1.current[0]).toBe("value1");
    expect(result2.current[0]).toBe("value2");

    act(() => {
      result1.current[1]("updated1");
    });

    expect(result1.current[0]).toBe("updated1");
    expect(result2.current[0]).toBe("value2"); // Should not change
  });

  it("provides type safety with generic type parameter", () => {
    // This test primarily validates TypeScript compilation
    type Theme = "light" | "dark";
    const { result } = renderHook(() =>
      useLocalStorage<Theme>("theme", "light")
    );

    expect(result.current[0]).toBe("light");

    act(() => {
      result.current[1]("dark");
    });

    expect(result.current[0]).toBe("dark");

    // TypeScript should prevent this (compile-time check):
    // result.current[1]("invalid"); // Type error
  });
});
