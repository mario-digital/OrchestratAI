/**
 * Base API client with retry logic and error handling
 * Provides type-safe HTTP methods with automatic timeout and retry
 */

import { APIError, NetworkError, TimeoutError } from "./errors";

/**
 * Request logging helper (development mode only)
 */
function logRequest(method: string, endpoint: string): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[API] ${method} ${endpoint}`);
  }
}

/**
 * Response logging helper (development mode only)
 */
function logResponse(
  method: string,
  endpoint: string,
  status: number,
  duration: number
): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[API] ${method} ${endpoint} - ${status} (${duration}ms)`);
  }
}

/**
 * Retry helper with exponential backoff
 * Only retries on network errors, not API errors (4xx/5xx)
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Only retry on network errors, not API errors (4xx/5xx)
      if (error instanceof APIError) {
        throw error;
      }

      // Only retry on TimeoutError or NetworkError
      if (
        !(error instanceof TimeoutError) &&
        !(error instanceof NetworkError)
      ) {
        throw error;
      }

      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[API] Retrying after ${delay}ms (attempt ${attempt + 1}/${maxRetries - 1})`
          );
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

/**
 * Base API client class
 * Handles all HTTP requests with timeout, retry, and error handling
 */
export class APIClient {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor(
    baseUrl?: string,
    timeout = 30000 // 30 seconds default
  ) {
    this.baseUrl =
      baseUrl || process.env["NEXT_PUBLIC_API_URL"] || "http://localhost:8000";
    this.defaultTimeout = timeout;
  }

  /**
   * Generic request method with timeout support
   * Throws APIError for non-2xx responses
   * Throws TimeoutError for timeout
   * Throws NetworkError for fetch failures
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeout?: number
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutMs = timeout || this.defaultTimeout;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const startTime = Date.now();

    logRequest(options.method || "GET", endpoint);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        logResponse(
          options.method || "GET",
          endpoint,
          response.status,
          duration
        );
        throw new APIError(response.status, errorText);
      }

      logResponse(options.method || "GET", endpoint, response.status, duration);
      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle timeout
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new TimeoutError(
          `Request timed out after ${timeoutMs / 1000} seconds`
        );
      }

      // Handle network errors (fetch failures)
      if (
        error instanceof TypeError &&
        (error.message.includes("fetch") ||
          error.message.includes("network") ||
          error.message.includes("Failed to fetch"))
      ) {
        throw new NetworkError(error.message);
      }

      // Re-throw API errors and other known errors
      throw error;
    }
  }

  /**
   * Perform GET request
   */
  async get<T>(endpoint: string, timeout?: number): Promise<T> {
    return retryWithBackoff(() =>
      this.request<T>(endpoint, { method: "GET" }, timeout)
    );
  }

  /**
   * Perform POST request
   */
  async post<T>(endpoint: string, data: unknown, timeout?: number): Promise<T> {
    return retryWithBackoff(() =>
      this.request<T>(
        endpoint,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
        timeout
      )
    );
  }

  /**
   * Perform PUT request
   */
  async put<T>(endpoint: string, data: unknown, timeout?: number): Promise<T> {
    return retryWithBackoff(() =>
      this.request<T>(
        endpoint,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
        timeout
      )
    );
  }

  /**
   * Perform DELETE request
   */
  async delete<T>(endpoint: string, timeout?: number): Promise<T> {
    return retryWithBackoff(() =>
      this.request<T>(endpoint, { method: "DELETE" }, timeout)
    );
  }
}

/**
 * Singleton API client instance
 * Use this for all API calls in the application
 */
export const apiClient = new APIClient();
