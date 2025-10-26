/**
 * Custom error classes for API client
 * Provides specific error types for different failure scenarios
 */

import type { ZodIssue } from "zod";

/**
 * Error details type for additional error information
 */
export type ErrorDetails =
  | Record<string, unknown>
  | ZodIssue[]
  | string
  | undefined;

/**
 * Base API error class for all HTTP-related errors
 * Includes status code, message, and optional details
 */
export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: ErrorDetails
  ) {
    super(message);
    this.name = "APIError";
    // Maintains proper stack trace for where error was thrown (V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }
}

/**
 * Validation error for schema validation failures
 * Used when request or response data doesn't match expected schema
 *
 * This error specifically handles Zod validation failures and provides
 * type-safe access to validation issues.
 */
export class ValidationError extends APIError {
  /**
   * Creates a new ValidationError with Zod validation issues
   *
   * @param message - Human-readable error message
   * @param errors - Array of Zod validation issues with field paths and error details
   */
  constructor(
    message: string,
    public errors: ZodIssue[]
  ) {
    super(422, message, errors as ErrorDetails);
    this.name = "ValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

/**
 * Network error for fetch failures
 * Thrown when network request fails (no response received)
 */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NetworkError);
    }
  }
}

/**
 * Timeout error for request timeouts
 * Thrown when request exceeds configured timeout duration
 */
export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TimeoutError);
    }
  }
}
