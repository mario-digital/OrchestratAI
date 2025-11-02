/**
 * Tests for Stream-by-ID API Route
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { GET } from "../[stream_id]/route";
import { NextRequest } from "next/server";

describe("GET /api/chat/stream/[stream_id]", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
    process.env["BACKEND_API_URL"] = "http://localhost:8000";
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("should forward GET request to backend with stream_id", async () => {
    const mockBody = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode("event: test\ndata: {}\n\n")
        );
        controller.close();
      },
    });

    fetchMock.mockResolvedValue({
      ok: true,
      body: mockBody,
    });

    const request = new NextRequest(
      "http://localhost:3000/api/chat/stream/test-stream-123"
    );
    const params = Promise.resolve({ stream_id: "test-stream-123" });

    const response = await GET(request, { params });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/api/chat/stream/test-stream-123",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Accept: "text/event-stream",
        }),
      })
    );

    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
  });

  it("should return 400 for invalid stream_id", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/chat/stream/abc"
    );
    const params = Promise.resolve({ stream_id: "abc" });

    const response = await GET(request, { params });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("Invalid stream_id");
  });

  it("should handle backend errors", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => "Stream not found",
    });

    const request = new NextRequest(
      "http://localhost:3000/api/chat/stream/test-stream-123"
    );
    const params = Promise.resolve({ stream_id: "test-stream-123" });

    const response = await GET(request, { params });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe("Backend streaming error");
  });

  it("should forward Last-Event-ID header if present", async () => {
    const mockBody = new ReadableStream({
      start(controller) {
        controller.close();
      },
    });

    fetchMock.mockResolvedValue({
      ok: true,
      body: mockBody,
    });

    const request = new NextRequest(
      "http://localhost:3000/api/chat/stream/test-stream-123",
      {
        headers: {
          "Last-Event-ID": "event-123",
        },
      }
    );
    const params = Promise.resolve({ stream_id: "test-stream-123" });

    await GET(request, { params });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/api/chat/stream/test-stream-123",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Last-Event-ID": "event-123",
        }),
      })
    );
  });

  it("should handle fetch errors", async () => {
    fetchMock.mockRejectedValue(new Error("Network error"));

    const request = new NextRequest(
      "http://localhost:3000/api/chat/stream/test-stream-123"
    );
    const params = Promise.resolve({ stream_id: "test-stream-123" });

    const response = await GET(request, { params });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Internal server error");
  });
});
