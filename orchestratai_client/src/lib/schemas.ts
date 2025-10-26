/**
 * Zod Validation Schemas for OrchestratAI
 *
 * This file contains all Zod schemas for runtime validation and type inference.
 * All schemas use .strict() to prevent unknown properties from being accepted.
 *
 * @module schemas
 */

import { z } from "zod";
import {
  AgentStatus,
  AgentId,
  MessageRole,
  LogType,
  LogStatus,
  RetrievalStrategy,
  AgentColor,
} from "./enums";

/**
 * ChatRequestSchema - Validates incoming chat request payloads
 *
 * Ensures message content is within acceptable length and session_id is a valid UUID.
 */
export const ChatRequestSchema = z
  .object({
    message: z
      .string()
      .min(1, "Message cannot be empty")
      .max(2000, "Message cannot exceed 2000 characters")
      .describe("User message content"),
    session_id: z
      .string()
      .uuid("Session ID must be a valid UUID v4")
      .describe("Chat session UUID"),
  })
  .strict();

/**
 * ChatMetricsSchema - Validates performance metrics for chat operations
 *
 * Tracks token usage, cost, and latency for monitoring and billing purposes.
 */
export const ChatMetricsSchema = z
  .object({
    tokensUsed: z
      .number()
      .int()
      .nonnegative("Tokens used cannot be negative")
      .describe("Total tokens consumed in the operation"),
    cost: z
      .number()
      .nonnegative("Cost cannot be negative")
      .describe("Operation cost in USD"),
    latency: z
      .number()
      .nonnegative("Latency cannot be negative")
      .describe("Operation latency in milliseconds"),
  })
  .strict();

/**
 * DocumentChunkSchema - Validates retrieved document chunks
 *
 * Represents a single chunk of text retrieved from the vector database with similarity score.
 */
export const DocumentChunkSchema = z
  .object({
    id: z.number().int().describe("Unique chunk identifier"),
    content: z.string().describe("Text content of the document chunk"),
    similarity: z
      .number()
      .min(0, "Similarity must be between 0 and 1")
      .max(1, "Similarity must be between 0 and 1")
      .describe("Cosine similarity score (0.0 to 1.0)"),
    source: z.string().describe("Source document or file path"),
    metadata: z
      .record(z.string(), z.unknown())
      .optional()
      .describe("Optional metadata key-value pairs"),
  })
  .strict();

/**
 * RetrievalLogSchema - Validates retrieval operation logs
 *
 * Records details of RAG/CAG operations including routing, vector search, and caching.
 */
export const RetrievalLogSchema = z
  .object({
    id: z
      .string()
      .uuid("Log ID must be a valid UUID")
      .describe("Unique log entry identifier"),
    type: z.nativeEnum(LogType).describe("Category of retrieval operation"),
    title: z.string().describe("Human-readable log entry title"),
    data: z
      .record(z.string(), z.unknown())
      .describe("Arbitrary key-value data for the log entry"),
    timestamp: z.string().describe("ISO 8601 timestamp of the operation"),
    status: z
      .nativeEnum(LogStatus)
      .describe("Status indicator for the operation"),
    chunks: z
      .array(DocumentChunkSchema)
      .nullable()
      .optional()
      .describe("Optional array of retrieved document chunks"),
  })
  .strict();

/**
 * MessageSchema - Validates chat message data model
 *
 * Represents a single message in a conversation, sent by either user or assistant.
 */
export const MessageSchema = z
  .object({
    id: z
      .string()
      .uuid("Message ID must be a valid UUID")
      .describe("Unique message identifier"),
    role: z.nativeEnum(MessageRole).describe("Sender type (user or assistant)"),
    content: z.string().describe("Message text content"),
    agent: z
      .nativeEnum(AgentId)
      .optional()
      .describe("Agent that generated the message (assistant messages only)"),
    confidence: z
      .number()
      .min(0, "Confidence must be between 0 and 1")
      .max(1, "Confidence must be between 0 and 1")
      .optional()
      .describe("Optional confidence score for agent responses (0.0 to 1.0)"),
    timestamp: z.date().describe("Message creation timestamp"),
    sessionId: z
      .string()
      .uuid("Session ID must be a valid UUID")
      .describe("Chat session UUID this message belongs to"),
  })
  .strict();

/**
 * AgentSchema - Validates agent data model
 *
 * Represents an AI agent with its current state, configuration, and performance metrics.
 */
export const AgentSchema = z
  .object({
    id: z.nativeEnum(AgentId).describe("Unique agent type identifier"),
    name: z.string().describe("Human-readable agent name"),
    status: z
      .nativeEnum(AgentStatus)
      .describe("Current operational state of the agent"),
    model: z.string().describe('LLM model identifier (e.g., "OpenAI GPT-4o")'),
    strategy: z
      .nativeEnum(RetrievalStrategy)
      .optional()
      .describe("Optional RAG/CAG retrieval strategy"),
    color: z
      .nativeEnum(AgentColor)
      .describe("UI color code for visual identification"),
    tokensUsed: z
      .number()
      .int()
      .nonnegative("Tokens used cannot be negative")
      .describe("Total tokens consumed by this agent"),
    cost: z
      .number()
      .nonnegative("Cost cannot be negative")
      .describe("Total cost incurred by this agent in USD"),
    cached: z
      .boolean()
      .optional()
      .describe("Optional flag indicating if response was cached"),
  })
  .strict();

/**
 * ChatResponseSchema - Validates complete API response structure
 *
 * Represents the full response from the chat API including message, agent info, and telemetry.
 */
export const ChatResponseSchema = z
  .object({
    message: z.string().describe("AI-generated response text"),
    agent: z.nativeEnum(AgentId).describe("Agent that handled the query"),
    confidence: z
      .number()
      .min(0, "Confidence must be between 0 and 1")
      .max(1, "Confidence must be between 0 and 1")
      .describe("Confidence score for the response (0.0 to 1.0)"),
    logs: z
      .array(RetrievalLogSchema)
      .describe("Array of retrieval operation logs for transparency"),
    metrics: ChatMetricsSchema.describe("Performance and cost metrics"),
  })
  .strict();

// =============================================================================
// Type Inference - Single Source of Truth
// =============================================================================
// All types are inferred from Zod schemas to ensure runtime and compile-time
// type safety are always in sync.

/**
 * ChatRequest - Type-safe chat request payload
 * @see ChatRequestSchema
 */
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

/**
 * ChatMetrics - Type-safe performance metrics
 * @see ChatMetricsSchema
 */
export type ChatMetrics = z.infer<typeof ChatMetricsSchema>;

/**
 * DocumentChunk - Type-safe document chunk data
 * @see DocumentChunkSchema
 */
export type DocumentChunk = z.infer<typeof DocumentChunkSchema>;

/**
 * RetrievalLog - Type-safe retrieval operation log
 * @see RetrievalLogSchema
 */
export type RetrievalLog = z.infer<typeof RetrievalLogSchema>;

/**
 * Message - Type-safe chat message
 * @see MessageSchema
 */
export type Message = z.infer<typeof MessageSchema>;

/**
 * Agent - Type-safe agent data model
 * @see AgentSchema
 */
export type Agent = z.infer<typeof AgentSchema>;

/**
 * ChatResponse - Type-safe complete API response
 * @see ChatResponseSchema
 */
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
