/**
 * Unit tests for API client
 * Tests error handling, retry logic, and request/response handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { APIClient } from "../api-client";
import { APIError, NetworkError, TimeoutError } from "../errors";

describe("APIClient", () => {
  let apiClient: APIClient;
  let originalFetch: typeof global.fetch;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Create new client instance for each test
    apiClient = new APIClient("http://test-api.com");

    // Store original fetch
    originalFetch = global.fetch;

    // Spy on console.log to test logging
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;

    // Restore console.log
    consoleLogSpy.mockRestore();
  });

  describe("Successful Requests", () => {
    it("should make successful GET request and return typed data", async () => {
      const mockData = { id: 1, name: "Test" };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await apiClient.get<typeof mockData>("/test");

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://test-api.com/test",
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should make successful POST request with data", async () => {
      const requestData = { message: "Hello" };
      const responseData = { success: true };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => responseData,
      });

      const result = await apiClient.post<typeof responseData>(
        "/test",
        requestData
      );

      expect(result).toEqual(responseData);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://test-api.com/test",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        })
      );
    });

    it("should make successful PUT request with data", async () => {
      const requestData = { id: 1, name: "Updated" };
      const responseData = { success: true };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => responseData,
      });

      const result = await apiClient.put<typeof responseData>(
        "/test/1",
        requestData
      );

      expect(result).toEqual(responseData);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://test-api.com/test/1",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        })
      );
    });

    it("should make successful DELETE request", async () => {
      const responseData = { success: true };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => responseData,
      });

      const result = await apiClient.delete<typeof responseData>("/test/1");

      expect(result).toEqual(responseData);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://test-api.com/test/1",
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  describe("Error Handling", () => {
    it("should throw APIError on 400 response", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => "Bad Request",
      });

      await expect(apiClient.get("/test")).rejects.toThrow(APIError);
      await expect(apiClient.get("/test")).rejects.toThrow("Bad Request");

      try {
        await apiClient.get("/test");
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).statusCode).toBe(400);
      }
    });

    it("should throw APIError on 404 response", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => "Not Found",
      });

      await expect(apiClient.get("/test")).rejects.toThrow(APIError);

      try {
        await apiClient.get("/test");
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).statusCode).toBe(404);
      }
    });

    it("should throw APIError on 500 response", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      });

      await expect(apiClient.get("/test")).rejects.toThrow(APIError);

      try {
        await apiClient.get("/test");
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).statusCode).toBe(500);
      }
    });

    it("should throw NetworkError on fetch failure", async () => {
      global.fetch = vi
        .fn()
        .mockRejectedValue(new TypeError("Failed to fetch"));

      await expect(apiClient.get("/test")).rejects.toThrow(NetworkError);
    });

    it("should throw TimeoutError on request timeout", async () => {
      // Create client with very short timeout
      const shortTimeoutClient = new APIClient("http://test-api.com", 100);

      global.fetch = vi.fn().mockImplementation((_, options) => {
        return new Promise((resolve, reject) => {
          // Listen to abort signal
          if (options?.signal) {
            options.signal.addEventListener("abort", () => {
              reject(
                new DOMException("The operation was aborted.", "AbortError")
              );
            });
          }

          // Simulate slow response
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ data: "test" }),
            });
          }, 200); // Longer than timeout
        });
      });

      await expect(shortTimeoutClient.get("/test")).rejects.toThrow(
        TimeoutError
      );
      await expect(shortTimeoutClient.get("/test")).rejects.toThrow(
        "timed out after"
      );
    }, 10000); // Increase test timeout
  });

  describe("Retry Logic", () => {
    it("should retry on network error and succeed on 3rd attempt", async () => {
      const mockData = { data: "success" };

      global.fetch = vi
        .fn()
        .mockRejectedValueOnce(new TypeError("Failed to fetch"))
        .mockRejectedValueOnce(new TypeError("Failed to fetch"))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockData,
        });

      const result = await apiClient.get("/test");

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    }, 10000); // Increase test timeout for retries

    it("should NOT retry on 4xx errors", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => "Bad Request",
      });

      await expect(apiClient.get("/test")).rejects.toThrow(APIError);

      // Should only call once (no retries)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("should NOT retry on 5xx errors", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      });

      await expect(apiClient.get("/test")).rejects.toThrow(APIError);

      // Should only call once (no retries)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("should fail after max retries on persistent network errors", async () => {
      global.fetch = vi
        .fn()
        .mockRejectedValue(new TypeError("Failed to fetch"));

      await expect(apiClient.get("/test")).rejects.toThrow(NetworkError);

      // Should retry 3 times
      expect(global.fetch).toHaveBeenCalledTimes(3);
    }, 10000); // Increase test timeout for retries
  });

  describe("Configuration", () => {
    it("should use default baseUrl when not provided", () => {
      const defaultClient = new APIClient();

      // Access private baseUrl through type assertion for testing
      expect(
        (defaultClient as unknown as Record<string, string>)["baseUrl"]
      ).toBe("http://localhost:8000");
    });

    it("should use custom baseUrl when provided", () => {
      const customClient = new APIClient("https://api.example.com");

      expect(
        (customClient as unknown as Record<string, string>)["baseUrl"]
      ).toBe("https://api.example.com");
    });

    it("should use NEXT_PUBLIC_API_URL from environment when available", () => {
      const originalEnv = process.env["NEXT_PUBLIC_API_URL"];
      process.env["NEXT_PUBLIC_API_URL"] = "https://env-api.com";

      const envClient = new APIClient();

      expect((envClient as unknown as Record<string, string>)["baseUrl"]).toBe(
        "https://env-api.com"
      );

      // Restore original env
      if (originalEnv) {
        process.env["NEXT_PUBLIC_API_URL"] = originalEnv;
      } else {
        delete process.env["NEXT_PUBLIC_API_URL"];
      }
    });

    it("should use custom timeout when provided", () => {
      const customTimeoutClient = new APIClient("http://test-api.com", 60000);

      expect(
        (customTimeoutClient as unknown as Record<string, number>)[
          "defaultTimeout"
        ]
      ).toBe(60000);
    });
  });

  describe("Logging (Development Mode)", () => {
    it("should log requests in development mode", async () => {
      vi.stubEnv("NODE_ENV", "development");

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: "test" }),
      });

      await apiClient.get("/test");

      // Should log request and response
      expect(consoleLogSpy).toHaveBeenCalled();

      vi.unstubAllEnvs();
    });

    it("should NOT log in production mode", async () => {
      vi.stubEnv("NODE_ENV", "production");

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: "test" }),
      });

      await apiClient.get("/test");

      // Should NOT log in production
      expect(consoleLogSpy).not.toHaveBeenCalled();

      vi.unstubAllEnvs();
    });
  });
});
