// @vitest-environment node

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { AgentId } from "@/lib/enums";
import { formatModelLabel, getAgentModelId, getAgentModelLabel } from "@/lib/agent-models";

const MODEL_ENV_KEYS = [
  "NEXT_PUBLIC_ORCHESTRATOR_MODEL",
  "NEXT_PUBLIC_BILLING_MODEL",
  "NEXT_PUBLIC_TECHNICAL_MODEL",
  "NEXT_PUBLIC_POLICY_MODEL",
];

const originalEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of MODEL_ENV_KEYS) {
    originalEnv[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of MODEL_ENV_KEYS) {
    const value = originalEnv[key];
    if (typeof value === "undefined") {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

describe("formatModelLabel", () => {
  it("returns placeholder for empty input", () => {
    expect(formatModelLabel("")).toBe("Model Not Configured");
  });

  it("normalizes OpenAI identifiers", () => {
    expect(formatModelLabel("openai.gpt-4o")).toBe("OpenAI GPT-4o");
  });

  it("normalizes Anthropic identifiers", () => {
    expect(formatModelLabel("anthropic.claude-3-haiku")).toBe("Anthropic Claude-3-haiku");
  });

  it("normalizes AWS Bedrock ARNs", () => {
    const arn = "arn:aws:bedrock:us-east-1:000000:model/nova-pro";
    expect(formatModelLabel(arn)).toBe("AWS Bedrock Nova-pro");
  });

  it("detects Mistral provider", () => {
    expect(formatModelLabel("mistral-large")).toBe("Mistral mistral-large");
  });

  it("falls back to model name for unknown providers", () => {
    expect(formatModelLabel("custom-model")).toBe("custom-model");
  });
});

describe("getAgentModelId", () => {
  it("returns configured env value when present", () => {
    process.env["NEXT_PUBLIC_BILLING_MODEL"] = "claude-3-sonnet";
    expect(getAgentModelId(AgentId.BILLING)).toBe("claude-3-sonnet");
  });

  it("falls back to default when env missing or blank", () => {
    process.env["NEXT_PUBLIC_POLICY_MODEL"] = "   ";
    expect(getAgentModelId(AgentId.POLICY)).toBe("gpt-4o-mini");
  });
});

describe("getAgentModelLabel", () => {
  it("returns formatted label using env value", () => {
    process.env["NEXT_PUBLIC_ORCHESTRATOR_MODEL"] = "openai.gpt-4.1";
    expect(getAgentModelLabel(AgentId.ORCHESTRATOR)).toBe("OpenAI GPT-4.1");
  });

  it("returns formatted label using fallback", () => {
    delete process.env["NEXT_PUBLIC_TECHNICAL_MODEL"];
    expect(getAgentModelLabel(AgentId.TECHNICAL)).toBe("OpenAI GPT-4o");
  });
});
