/**
 * Error message mapping utility
 *
 * Converts technical error objects into user-friendly messages
 * following the error handling strategy defined in architecture docs.
 *
 * @module lib/utils/error-messages
 */

import {
  APIError,
  NetworkError,
  TimeoutError,
  ValidationError,
  StreamError,
  StreamErrorCode,
} from "../errors";

/**
 * Get user-friendly error message from error object
 *
 * Maps technical error types to friendly messages that:
 * - Are actionable (tell user what to do)
 * - Avoid technical jargon
 * - Maintain consistent tone
 * - Follow brand voice guidelines
 *
 * @param error - Error object from API call or validation
 * @returns User-friendly error message string
 *
 * @example
 * ```typescript
 * try {
 *   await sendMessage("Hello");
 * } catch (error) {
 *   const message = getUserFriendlyMessage(error as Error);
 *   toast.error(message);
 * }
 * ```
 */
export function getUserFriendlyMessage(error: Error): string {
  // Network errors - connection failed
  if (error instanceof NetworkError) {
    return "Couldn't reach the server. Check your connection and try again.";
  }

  // Timeout errors - request took too long
  if (error instanceof TimeoutError) {
    return "The request took too long. Please try again.";
  }

  // Validation errors - invalid data format
  if (error instanceof ValidationError) {
    return "Your message format is invalid. Please try again.";
  }

  // API errors - backend returned error status
  if (error instanceof APIError) {
    // Server errors (5xx)
    if (error.statusCode >= 500) {
      return "Something went wrong on our end. Please try again.";
    }

    // Client errors (4xx)
    if (error.statusCode === 400) {
      return "Your message couldn't be processed. Please try again.";
    }

    // Other API errors
    return "An error occurred. Please try again.";
  }

  // Stream errors - SSE connection issues
  if (error instanceof StreamError) {
    return getStreamErrorMessage(error.code);
  }

  // Generic fallback for unknown errors
  return "An unexpected error occurred. Please try again.";
}

/**
 * Get user-friendly error message for streaming errors
 *
 * Maps streaming error codes to user-friendly messages with retry count if provided.
 *
 * @param code - Stream error code
 * @param retryCount - Optional current retry count for display
 * @returns User-friendly error message string
 *
 * @example
 * ```typescript
 * const message = getStreamErrorMessage(StreamErrorCode.NETWORK_ERROR, 2);
 * // Returns: "Connection lost. Retrying (2/3)..."
 * ```
 */
export function getStreamErrorMessage(
  code: StreamErrorCode,
  retryCount?: number
): string {
  const messages: Record<StreamErrorCode, string> = {
    [StreamErrorCode.NETWORK_ERROR]: retryCount
      ? `Connection lost. Retrying (${retryCount}/3)...`
      : "Connection lost. Switching to standard mode.",
    [StreamErrorCode.SERVER_ERROR]:
      "Server temporarily unavailable. Using standard mode.",
    [StreamErrorCode.TIMEOUT]: "Request timed out. Using standard mode.",
    [StreamErrorCode.PARSE_ERROR]:
      "Received invalid data. Using standard mode.",
    [StreamErrorCode.CONNECTION_CLOSED]:
      "Connection closed. Using standard mode.",
  };

  return messages[code] || "Streaming unavailable. Using standard mode.";
}
