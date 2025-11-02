/**
 * Next.js API Route: Stream Initiation Proxy
 *
 * Step 1 of two-step secure streaming:
 * - Accepts POST from client with message in body (secure!)
 * - Forwards POST to backend
 * - Returns stream_id for EventSource connection
 *
 * Security Benefits:
 * - Message never appears in URLs or browser history
 * - Message never appears in server logs (POST body)
 * - stream_id contains no sensitive information
 *
 * @module api/chat/stream/initiate
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/chat/stream/initiate
 *
 * Initiate a secure streaming session.
 *
 * @param request - Next.js request with { message, session_id } in body
 * @returns JSON with { stream_id } for use in EventSource connection
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/chat/stream/initiate', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     message: 'Hello',
 *     session_id: 'abc-123'
 *   })
 * });
 *
 * const { stream_id } = await response.json();
 * // Use stream_id with EventSource:
 * const eventSource = new EventSource(`/api/chat/stream/${stream_id}`);
 * ```
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body (secure - not in URL!)
    const body = (await request.json()) as {
      message?: string;
      session_id?: string;
    };
    const { message, session_id } = body;

    // Validate required fields
    if (!message || !session_id) {
      return NextResponse.json(
        { error: "Missing required fields: message, session_id" },
        { status: 400 }
      );
    }

    // Get backend API URL from environment
    const backendUrl =
      process.env["BACKEND_API_URL"] || "http://localhost:8000";

    // Forward POST to backend (secure - message in body!)
    const backendResponse = await fetch(
      `${backendUrl}/api/chat/stream/initiate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, session_id }),
      }
    );

    // Check for backend errors
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`Backend error: ${backendResponse.status} - ${errorText}`);
      return NextResponse.json(
        {
          error: "Backend initiation error",
          details: errorText,
        },
        { status: backendResponse.status }
      );
    }

    // Get stream_id from backend
    const data = (await backendResponse.json()) as { stream_id?: string };
    const { stream_id } = data;

    if (!stream_id) {
      return NextResponse.json(
        { error: "Backend did not return stream_id" },
        { status: 500 }
      );
    }

    // Return stream_id to client
    return NextResponse.json({ stream_id });
  } catch (error) {
    console.error("Initiation proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
