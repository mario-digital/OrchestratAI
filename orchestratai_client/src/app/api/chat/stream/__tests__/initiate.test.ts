/**
 * Tests for Stream Initiation API Route
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "../initiate/route";
import { NextRequest } from "next/server";

describe("POST /api/chat/stream/initiate", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
    process.env["BACKEND_API_URL"] = "http://localhost:8000";
  });

  it("should forward POST request to backend", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ stream_id: "test-stream-123" }),
    });

    const request = new NextRequest(
      "http://localhost:3000/api/chat/stream/initiate",
      {
        method: "POST",
        body: JSON.stringify({ message: "Hello", session_id: "session-123" }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/api/chat/stream/initiate",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Hello", session_id: "session-123" }),
      })
    );

    expect(data).toEqual({ stream_id: "test-stream-123" });
  });

  it("should return 400 for missing message", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/chat/stream/initiate",
      {
        method: "POST",
        body: JSON.stringify({ session_id: "session-123" }),
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("Missing required fields");
  });

  it("should return 400 for missing session_id", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/chat/stream/initiate",
      {
        method: "POST",
        body: JSON.stringify({ message: "Hello" }),
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("Missing required fields");
  });

  it("should handle backend errors", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "Internal server error",
    });

    const request = new NextRequest(
      "http://localhost:3000/api/chat/stream/initiate",
      {
        method: "POST",
        body: JSON.stringify({ message: "Hello", session_id: "session-123" }),
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Backend initiation error");
  });

  it("should handle missing stream_id from backend", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const request = new NextRequest(
      "http://localhost:3000/api/chat/stream/initiate",
      {
        method: "POST",
        body: JSON.stringify({ message: "Hello", session_id: "session-123" }),
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toContain("did not return stream_id");
  });

  it("should handle fetch errors", async () => {
    fetchMock.mockRejectedValue(new Error("Network error"));

    const request = new NextRequest(
      "http://localhost:3000/api/chat/stream/initiate",
      {
        method: "POST",
        body: JSON.stringify({ message: "Hello", session_id: "session-123" }),
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Internal server error");
  });
});
