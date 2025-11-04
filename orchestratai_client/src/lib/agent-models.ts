import { AgentId } from "@/lib/enums";

type AgentModelConfig = {
  envKey: string;
  fallback: string;
};

const AGENT_MODEL_ENV_MAP: Record<AgentId, AgentModelConfig> = {
  [AgentId.ORCHESTRATOR]: {
    envKey: "NEXT_PUBLIC_ORCHESTRATOR_MODEL",
    fallback: "gpt-4o",
  },
  [AgentId.BILLING]: {
    envKey: "NEXT_PUBLIC_BILLING_MODEL",
    fallback: "gpt-4o-mini",
  },
  [AgentId.TECHNICAL]: {
    envKey: "NEXT_PUBLIC_TECHNICAL_MODEL",
    fallback: "gpt-4o",
  },
  [AgentId.POLICY]: {
    envKey: "NEXT_PUBLIC_POLICY_MODEL",
    fallback: "gpt-4o-mini",
  },
};

function readEnv(envKey: string): string | undefined {
  if (typeof process === "undefined" || typeof process.env === "undefined") {
    return undefined;
  }

  const value = process.env[envKey];
  if (value && value.trim().length > 0) {
    return value.trim();
  }
  return undefined;
}

function normalizeModelName(modelId: string): string {
  let name = modelId.trim();

  name = name.replace(/^anthropic\./i, "");
  name = name.replace(/^us\.amazon\./i, "");
  name = name.replace(/^amazon\./i, "");
  name = name.replace(/^arn:aws:bedrock:[^:]+:[^:]*:model\//i, "");
  name = name.replace(/^bedrock[/:]/i, "");
  name = name.replace(/^openai\./i, "");

  if (/^gpt/i.test(name)) {
    name = name.replace(/^gpt/i, "GPT");
  }

  if (/^claude/i.test(name)) {
    name = name.replace(/^claude/i, "Claude");
  }

  if (/^nova/i.test(name)) {
    name = name.replace(/^nova/i, "Nova");
  }

  if (/^text-embedding/i.test(name)) {
    name = name.replace(/^text-embedding/i, "Text-Embedding");
  }

  return name;
}

function detectProvider(modelId: string): string {
  const lower = modelId.toLowerCase();

  if (lower.includes("gpt") || lower.includes("openai")) {
    return "OpenAI";
  }

  if (lower.includes("claude") || lower.includes("anthropic")) {
    return "Anthropic";
  }

  if (
    lower.includes("gemini") ||
    lower.includes("palm") ||
    lower.includes("google")
  ) {
    return "Google";
  }

  if (lower.includes("llama") || lower.includes("meta")) {
    return "Meta";
  }

  if (
    lower.includes("nova") ||
    lower.includes("bedrock") ||
    lower.includes("amazon")
  ) {
    return "AWS Bedrock";
  }

  if (lower.includes("mistral")) {
    return "Mistral";
  }

  return "LLM";
}

export function formatModelLabel(modelId: string): string {
  const trimmed = modelId.trim();
  if (!trimmed) {
    return "Model Not Configured";
  }

  const provider = detectProvider(trimmed);
  const modelName = normalizeModelName(trimmed);

  return provider === "LLM" ? modelName : `${provider} ${modelName}`;
}

export function getAgentModelId(agent: AgentId): string {
  const config = AGENT_MODEL_ENV_MAP[agent];
  const envValue = readEnv(config.envKey);
  return envValue ?? config.fallback;
}

export function getAgentModelLabel(agent: AgentId): string {
  return formatModelLabel(getAgentModelId(agent));
}
