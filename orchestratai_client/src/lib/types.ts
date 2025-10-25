/**
 * TypeScript Types for OrchestratAI
 *
 * This file exports TypeScript types inferred from Zod schemas, providing
 * a single source of truth for type definitions throughout the application.
 *
 * Types are automatically inferred from their corresponding Zod schemas,
 * ensuring runtime validation and compile-time types are always in sync.
 *
 * @module types
 */

import { z } from "zod";
import {
  ChatRequestSchema,
  ChatResponseSchema,
  AgentSchema,
  MessageSchema,
  RetrievalLogSchema,
  ChatMetricsSchema,
  DocumentChunkSchema,
} from "./schemas";

// Re-export all enums for convenience
export {
  AgentStatus,
  AgentId,
  MessageRole,
  LogType,
  LogStatus,
  RetrievalStrategy,
  AgentColor,
} from "./enums";

/**
 * ChatRequest - User chat request payload
 *
 * Contains the user's message and session identifier.
 */
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

/**
 * ChatResponse - API response structure
 *
 * Complete response including AI message, agent info, logs, and metrics.
 */
export type ChatResponse = z.infer<typeof ChatResponseSchema>;

/**
 * Agent - AI agent data model
 *
 * Represents an agent with its state, configuration, and performance data.
 */
export type Agent = z.infer<typeof AgentSchema>;

/**
 * Message - Chat message data model
 *
 * Represents a single message in a conversation.
 */
export type Message = z.infer<typeof MessageSchema>;

/**
 * RetrievalLog - Retrieval operation log entry
 *
 * Records details of RAG/CAG operations for transparency.
 */
export type RetrievalLog = z.infer<typeof RetrievalLogSchema>;

/**
 * ChatMetrics - Performance and cost metrics
 *
 * Tracks token usage, cost, and latency for monitoring.
 */
export type ChatMetrics = z.infer<typeof ChatMetricsSchema>;

/**
 * DocumentChunk - Retrieved document chunk
 *
 * Represents a text chunk from vector database search.
 */
export type DocumentChunk = z.infer<typeof DocumentChunkSchema>;
