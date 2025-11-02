/**
 * Next.js API Route: Stream-by-ID Proxy
 *
 * Step 2 of two-step secure streaming:
 * - Accepts GET from EventSource with stream_id (no message in URL!)
 * - Forwards to backend GET /api/chat/stream/{stream_id}
 * - Streams SSE events back to client
 *
 * Security Benefits:
 * - Message stored server-side (not in URL)
 * - stream_id contains no sensitive information
 * - Supports EventSource native reconnection
 *
 * @module api/chat/stream/[stream_id]
 */

import { NextRequest } from "next/server";

/**
 * GET /api/chat/stream/{stream_id}
 *
 * Stream SSE events for a previously-initiated session.
 *
 * This endpoint is called by EventSource, which automatically:
 * - Reconnects on network errors
 * - Retries with exponential backoff
 * - Sends Last-Event-ID header for resume capability
 *
 * @param request - Next.js request
 * @param params - Route parameters with stream_id
 * @returns StreamingResponse with SSE events
 *
 * @example
 * ```typescript
 * // After getting stream_id from /api/chat/stream/initiate:
 * const eventSource = new EventSource(`/api/chat/stream/${stream_id}`);
 *
 * eventSource.addEventListener('message_chunk', (e) => {
 *   const data = JSON.parse(e.data);
 *   console.log(data.content);
 * });
 *
 * // EventSource handles reconnection automatically!
 * ```
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ stream_id: string }> }
): Promise<Response> {
  try {
    const { stream_id } = await params;

    // Validate stream_id format (basic UUID check)
    if (!stream_id || stream_id.length < 10) {
      return new Response(JSON.stringify({ error: "Invalid stream_id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get backend API URL from environment
    const backendUrl =
      process.env["BACKEND_API_URL"] || "http://localhost:8000";

    // Forward GET to backend (stream_id in URL, but no message!)
    const backendResponse = await fetch(
      `${backendUrl}/api/chat/stream/${stream_id}`,
      {
        method: "GET",
        headers: {
          Accept: "text/event-stream",
          // Forward Last-Event-ID for resume capability
          ...(request.headers.get("Last-Event-ID") && {
            "Last-Event-ID": request.headers.get("Last-Event-ID")!,
          }),
        },
      }
    );

    // Check for backend errors
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`Backend error: ${backendResponse.status} - ${errorText}`);
      return new Response(
        JSON.stringify({
          error: "Backend streaming error",
          details: errorText,
        }),
        {
          status: backendResponse.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Stream response back to client
    // Next.js automatically handles the streaming conversion
    return new Response(backendResponse.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Disable nginx buffering
      },
    });
  } catch (error) {
    console.error("Stream proxy error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
