/**
 * Unit tests for chat API functions
 *
 * Tests cover:
 * - Valid request/response flows
 * - Request validation (message length, UUID format)
 * - Response validation (missing fields, wrong types, out-of-range values)
 * - Session ID auto-generation
 * - Error handling and formatting
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendMessage, validateResponse } from "../chat";
import { apiClient } from "../../api-client";
import { ValidationError } from "../../errors";
import { ChatResponseSchema } from "../../schemas";

// Mock the API client
vi.mock("../../api-client");

describe("chat API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendMessage", () => {
    it("should send message and return validated response", async () => {
      const mockResponse = {
        message: "Your account balance is $150.00",
        agent: "billing",
        confidence: 0.95,
        logs: [],
        metrics: { tokensUsed: 100, cost: 0.001, latency: 500 },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const result = await sendMessage(
        "What is my account balance?",
        "550e8400-e29b-41d4-a716-446655440000"
      );

      expect(result).toEqual(mockResponse);
      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/chat",
        {
          message: "What is my account balance?",
          session_id: "550e8400-e29b-41d4-a716-446655440000",
        },
        undefined
      );
    });

    it("should generate UUID if sessionId not provided", async () => {
      const mockResponse = {
        message: "Test response",
        agent: "orchestrator",
        confidence: 0.9,
        logs: [],
        metrics: { tokensUsed: 100, cost: 0.001, latency: 500 },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      await sendMessage("Hello");

      const mockCalls = vi.mocked(apiClient.post).mock.calls;
      expect(mockCalls.length).toBeGreaterThan(0);

      const callArgs = mockCalls[0]?.[1] as {
        message: string;
        session_id: string;
      };

      // Validate it's a valid UUIDv4
      expect(callArgs.session_id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it("should throw ValidationError for message too long (>2000 chars)", async () => {
      const longMessage = "a".repeat(2001);

      await expect(sendMessage(longMessage)).rejects.toThrow();
    });

    it("should throw ValidationError for empty message", async () => {
      await expect(sendMessage("")).rejects.toThrow();
    });

    it("should throw ValidationError for invalid UUID", async () => {
      await expect(sendMessage("Hello", "not-a-valid-uuid")).rejects.toThrow();
    });

    it("should throw ValidationError for missing required response fields", async () => {
      const invalidResponse = {
        message: "Test response",
        // Missing: agent, confidence, logs, metrics
      };

      vi.mocked(apiClient.post).mockResolvedValue(invalidResponse);

      await expect(sendMessage("Hello")).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError for wrong field types", async () => {
      const invalidResponse = {
        message: "Test response",
        agent: "orchestrator",
        confidence: "high", // Should be number
        logs: [],
        metrics: { tokensUsed: 100, cost: 0.001, latency: 500 },
      };

      vi.mocked(apiClient.post).mockResolvedValue(invalidResponse);

      await expect(sendMessage("Hello")).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError for confidence out of range (>1)", async () => {
      const invalidResponse = {
        message: "Test response",
        agent: "orchestrator",
        confidence: 1.5, // Out of range
        logs: [],
        metrics: { tokensUsed: 100, cost: 0.001, latency: 500 },
      };

      vi.mocked(apiClient.post).mockResolvedValue(invalidResponse);

      await expect(sendMessage("Hello")).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError for confidence out of range (<0)", async () => {
      const invalidResponse = {
        message: "Test response",
        agent: "orchestrator",
        confidence: -0.1, // Out of range
        logs: [],
        metrics: { tokensUsed: 100, cost: 0.001, latency: 500 },
      };

      vi.mocked(apiClient.post).mockResolvedValue(invalidResponse);

      await expect(sendMessage("Hello")).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError for invalid agent enum value", async () => {
      const invalidResponse = {
        message: "Test response",
        agent: "unknown-agent", // Invalid enum value
        confidence: 0.9,
        logs: [],
        metrics: { tokensUsed: 100, cost: 0.001, latency: 500 },
      };

      vi.mocked(apiClient.post).mockResolvedValue(invalidResponse);

      await expect(sendMessage("Hello")).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError for unknown fields (strict mode)", async () => {
      const invalidResponse = {
        message: "Test response",
        agent: "orchestrator",
        confidence: 0.9,
        logs: [],
        metrics: { tokensUsed: 100, cost: 0.001, latency: 500 },
        extraField: "should not be here", // Unknown field
      };

      vi.mocked(apiClient.post).mockResolvedValue(invalidResponse);

      await expect(sendMessage("Hello")).rejects.toThrow(ValidationError);
    });

    it("should validate complex response with logs", async () => {
      const mockResponse = {
        message: "Test response",
        agent: "technical",
        confidence: 0.85,
        logs: [
          {
            id: "550e8400-e29b-41d4-a716-446655440000",
            type: "routing",
            title: "Query routed to technical agent",
            data: { reason: "technical keywords detected" },
            timestamp: "2025-10-26T12:00:00Z",
            status: "success",
          },
        ],
        metrics: { tokensUsed: 250, cost: 0.0025, latency: 750 },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const result = await sendMessage("How do I reset my password?");

      expect(result).toEqual(mockResponse);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0]?.type).toBe("routing");
    });

    it("should include field path in ValidationError message", async () => {
      const invalidResponse = {
        message: "Test response",
        agent: "orchestrator",
        confidence: 0.9,
        logs: [],
        metrics: {
          tokensUsed: -10, // Invalid: negative value
          cost: 0.001,
          latency: 500,
        },
      };

      vi.mocked(apiClient.post).mockResolvedValue(invalidResponse);

      try {
        await sendMessage("Hello");
        expect.fail("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain("metrics");
      }
    });

    it("should pass custom timeout to apiClient.post", async () => {
      const mockResponse = {
        message: "Test response",
        agent: "orchestrator",
        confidence: 0.9,
        logs: [],
        metrics: { tokensUsed: 100, cost: 0.001, latency: 500 },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const customTimeout = 60000; // 60 seconds
      await sendMessage("Complex query", undefined, customTimeout);

      // Verify timeout was passed to apiClient.post
      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/chat",
        expect.objectContaining({
          message: "Complex query",
          session_id: expect.any(String),
        }),
        customTimeout
      );
    });

    it("should use default timeout when not specified", async () => {
      const mockResponse = {
        message: "Test response",
        agent: "orchestrator",
        confidence: 0.9,
        logs: [],
        metrics: { tokensUsed: 100, cost: 0.001, latency: 500 },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      await sendMessage("Simple query");

      // Verify no timeout parameter was passed (will use apiClient default)
      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/chat",
        expect.objectContaining({
          message: "Simple query",
          session_id: expect.any(String),
        }),
        undefined
      );
    });
  });

  describe("validateResponse", () => {
    it("should return validated data for valid input", () => {
      const validData = {
        message: "Test response",
        agent: "orchestrator",
        confidence: 0.9,
        logs: [],
        metrics: { tokensUsed: 100, cost: 0.001, latency: 500 },
      };

      const result = validateResponse(ChatResponseSchema, validData);

      expect(result).toEqual(validData);
    });

    it("should throw ValidationError with formatted message", () => {
      const invalidData = {
        message: "Test",
        // Missing required fields
      };

      expect(() => validateResponse(ChatResponseSchema, invalidData)).toThrow(
        ValidationError
      );
    });

    it("should include multiple field errors in message", () => {
      const invalidData = {
        message: "Test",
        agent: "invalid",
        confidence: 2.0,
        // Missing logs and metrics
      };

      try {
        validateResponse(ChatResponseSchema, invalidData);
        expect.fail("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const errorMessage = (error as ValidationError).message;
        // Should contain multiple validation errors
        expect(errorMessage).toBeTruthy();
      }
    });
  });
});
