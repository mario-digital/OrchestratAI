import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import os from "os";

const isCI = Boolean(process.env['CI'] || process.env['GITHUB_ACTIONS']);
const cpu = os.cpus().length;
const envMax = Number(process.env['VITEST_MAX_THREADS']);

const maxThreads =
  Number.isFinite(envMax) && envMax > 0
    ? envMax
    : isCI
      ? Math.max(2, cpu - 1)           // ✅ CI: (cores − 1)
      : Math.max(2, Math.floor(cpu / 4)); // ✅ Local: ~25%


export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    watch: false,
    pool: "threads",
    poolOptions: {
      threads: {
        maxThreads,
        minThreads: 1,
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      exclude: [
        "node_modules/",
        ".next/",
        "src/test-setup.ts",
        "**/*.config.*",
        "**/*.d.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
