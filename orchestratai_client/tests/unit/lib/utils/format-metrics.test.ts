import { describe, it, expect } from "vitest";
import {
  formatTokens,
  formatCost,
  formatLatency,
} from "@/lib/utils/format-metrics";

describe("formatMetrics", () => {
  describe("formatTokens", () => {
    it("formats zero tokens", () => {
      expect(formatTokens(0)).toBe("0 tokens");
    });

    it("formats small token count without comma", () => {
      expect(formatTokens(100)).toBe("100 tokens");
    });

    it("formats token count with comma separator", () => {
      expect(formatTokens(1000)).toBe("1,000 tokens");
    });

    it("formats large token count with multiple commas", () => {
      expect(formatTokens(10000)).toBe("10,000 tokens");
    });

    it("formats very large token count", () => {
      expect(formatTokens(1234567)).toBe("1,234,567 tokens");
    });
  });

  describe("formatCost", () => {
    it("formats zero cost", () => {
      expect(formatCost(0)).toBe("$0.0000");
    });

    it("formats very small cost", () => {
      expect(formatCost(0.0001)).toBe("$0.0001");
    });

    it("formats typical cost with 4 decimal places", () => {
      expect(formatCost(0.0023)).toBe("$0.0023");
    });

    it("formats cost rounding to 4 decimal places", () => {
      expect(formatCost(0.00234)).toBe("$0.0023");
    });

    it("formats larger cost", () => {
      expect(formatCost(1.2345)).toBe("$1.2345");
    });

    it("formats cost with trailing zeros", () => {
      expect(formatCost(0.5)).toBe("$0.5000");
    });
  });

  describe("formatLatency", () => {
    it("formats zero latency", () => {
      expect(formatLatency(0)).toBe("0ms");
    });

    it("formats small latency without comma", () => {
      expect(formatLatency(50)).toBe("50ms");
    });

    it("formats latency with comma separator", () => {
      expect(formatLatency(1234)).toBe("1,234ms");
    });

    it("formats large latency", () => {
      expect(formatLatency(10000)).toBe("10,000ms");
    });

    it("formats very large latency with multiple commas", () => {
      expect(formatLatency(1234567)).toBe("1,234,567ms");
    });
  });
});
