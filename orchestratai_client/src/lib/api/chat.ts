/**
 * Chat API functions for sending messages and receiving agent responses
 *
 * This module provides type-safe chat operations with runtime validation
 * using Zod schemas. All requests and responses are validated to ensure
 * data integrity between frontend and backend.
 *
 * @module api/chat
 */

import { apiClient } from "../api-client";
import {
  ChatRequestSchema,
  ChatResponseSchema,
  type ChatResponse,
} from "../schemas";
import { ValidationError } from "../errors";
import type { ZodSchema, ZodError } from "zod";

/**
 * Validate response data against a Zod schema
 *
 * @template T - The expected type after successful validation
 * @param schema - Zod schema to validate against
 * @param data - Unknown data to validate
 * @returns Validated and typed data
 * @throws {ValidationError} If validation fails with detailed error information
 */
export function validateResponse<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errorMessage = formatZodError(result.error);
    throw new ValidationError(
      `Response validation failed: ${errorMessage}`,
      result.error.issues
    );
  }

  return result.data;
}

/**
 * Format Zod validation errors into a human-readable message
 *
 * @param error - Zod error object containing validation issues
 * @returns Formatted error message with field paths and descriptions
 */
function formatZodError(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "root";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}

/**
 * Send a chat message and receive agent response
 *
 * This function handles the complete chat flow:
 * 1. Generates session ID if not provided
 * 2. Validates request data against ChatRequestSchema
 * 3. Sends POST request to /api/chat endpoint
 * 4. Validates response against ChatResponseSchema
 * 5. Returns typed ChatResponse
 *
 * @param message - User message text (1-2000 characters)
 * @param sessionId - Optional session UUID (auto-generated if not provided)
 * @returns Validated ChatResponse from backend
 * @throws {ValidationError} If request or response fails schema validation
 * @throws {APIError} If backend returns error status (4xx/5xx)
 * @throws {NetworkError} If network request fails
 * @throws {TimeoutError} If request exceeds timeout duration
 *
 * @example
 * ```typescript
 * // Auto-generate session ID
 * const response = await sendMessage("What is my account balance?");
 *
 * // Provide existing session ID
 * const response = await sendMessage(
 *   "Thanks!",
 *   "550e8400-e29b-41d4-a716-446655440000"
 * );
 * ```
 */
export async function sendMessage(
  message: string,
  sessionId?: string
): Promise<ChatResponse> {
  // Generate session ID if not provided using built-in crypto API
  const session_id = sessionId || crypto.randomUUID();

  // Validate request data before sending
  // This will throw if message is too long, empty, or session_id is invalid
  const requestData = ChatRequestSchema.parse({ message, session_id });

  // Call backend API
  const response = await apiClient.post<unknown>("/api/chat", requestData);

  // Validate response structure and return typed data
  // This ensures backend contract is enforced at runtime
  return validateResponse(ChatResponseSchema, response);
}
