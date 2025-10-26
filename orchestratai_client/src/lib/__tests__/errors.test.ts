/**
 * Unit tests for custom error classes
 */

import { describe, it, expect } from "vitest";
import {
  APIError,
  ValidationError,
  NetworkError,
  TimeoutError,
} from "../errors";

describe("Custom Error Classes", () => {
  describe("APIError", () => {
    it("should create APIError with status code and message", () => {
      const error = new APIError(404, "Not Found");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(APIError);
      expect(error.name).toBe("APIError");
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Not Found");
      expect(error.details).toBeUndefined();
    });

    it("should create APIError with details", () => {
      const details = { field: "email", issue: "invalid format" };
      const error = new APIError(400, "Validation failed", details);

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Validation failed");
      expect(error.details).toEqual(details);
    });

    it("should create APIError with string details", () => {
      const error = new APIError(
        500,
        "Server error",
        "Database connection failed"
      );

      expect(error.statusCode).toBe(500);
      expect(error.details).toBe("Database connection failed");
    });

    it("should have stack trace", () => {
      const error = new APIError(500, "Error");

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("APIError");
    });
  });

  describe("ValidationError", () => {
    it("should create ValidationError extending APIError", () => {
      const validationErrors = [
        { field: "email", message: "Invalid email" },
        { field: "password", message: "Too short" },
      ];
      const error = new ValidationError("Validation failed", validationErrors);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(APIError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.name).toBe("ValidationError");
      expect(error.statusCode).toBe(422); // Unprocessable Entity
      expect(error.message).toBe("Validation failed");
      expect(error.errors).toEqual(validationErrors);
    });

    it("should have stack trace", () => {
      const error = new ValidationError("Invalid data", {});

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("ValidationError");
    });
  });

  describe("NetworkError", () => {
    it("should create NetworkError", () => {
      const error = new NetworkError("Failed to fetch");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(NetworkError);
      expect(error.name).toBe("NetworkError");
      expect(error.message).toBe("Failed to fetch");
    });

    it("should NOT be instance of APIError", () => {
      const error = new NetworkError("Network failure");

      expect(error).not.toBeInstanceOf(APIError);
    });

    it("should have stack trace", () => {
      const error = new NetworkError("Connection refused");

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("NetworkError");
    });
  });

  describe("TimeoutError", () => {
    it("should create TimeoutError", () => {
      const error = new TimeoutError("Request timed out after 30 seconds");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(TimeoutError);
      expect(error.name).toBe("TimeoutError");
      expect(error.message).toBe("Request timed out after 30 seconds");
    });

    it("should NOT be instance of APIError", () => {
      const error = new TimeoutError("Timeout");

      expect(error).not.toBeInstanceOf(APIError);
    });

    it("should have stack trace", () => {
      const error = new TimeoutError("Timeout occurred");

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("TimeoutError");
    });
  });

  describe("Error instanceof checks", () => {
    it("should allow proper error type discrimination", () => {
      const apiError = new APIError(500, "Server error");
      const validationError = new ValidationError("Invalid", {});
      const networkError = new NetworkError("Connection failed");
      const timeoutError = new TimeoutError("Timeout");

      // Type guards work correctly
      if (apiError instanceof APIError) {
        expect(apiError.statusCode).toBe(500);
      }

      if (validationError instanceof ValidationError) {
        expect(validationError.errors).toBeDefined();
      }

      if (networkError instanceof NetworkError) {
        expect(networkError.name).toBe("NetworkError");
      }

      if (timeoutError instanceof TimeoutError) {
        expect(timeoutError.name).toBe("TimeoutError");
      }
    });

    it("should support error catching with type checking", () => {
      const errors = [
        new APIError(404, "Not found"),
        new ValidationError("Invalid", {}),
        new NetworkError("Failed"),
        new TimeoutError("Timeout"),
      ];

      errors.forEach((error) => {
        expect(error).toBeInstanceOf(Error);

        if (error instanceof ValidationError) {
          expect(error.statusCode).toBe(422);
        } else if (error instanceof APIError) {
          expect(error.statusCode).toBeDefined();
        } else if (error instanceof NetworkError) {
          expect(error.name).toBe("NetworkError");
        } else if (error instanceof TimeoutError) {
          expect(error.name).toBe("TimeoutError");
        }
      });
    });
  });
});
