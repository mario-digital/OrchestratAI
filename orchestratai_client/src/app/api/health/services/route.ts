/**
 * Health Services API Route
 *
 * Proxies health check requests to the backend to check ChromaDB status.
 */

import { NextResponse } from "next/server";

/**
 * GET /api/health/services
 *
 * Forwards the health check request to the backend API.
 *
 * @returns Health status response with ChromaDB connection status
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Get backend API URL from environment
    const backendUrl =
      process.env["BACKEND_API_URL"] || "http://localhost:8000";

    // Forward GET to backend
    const backendResponse = await fetch(`${backendUrl}/api/health/services`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { status: "error", chromadb: "disconnected" },
        { status: backendResponse.status }
      );
    }

    const data = (await backendResponse.json()) as {
      status: string;
      chromadb: string;
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      { status: "error", chromadb: "disconnected" },
      { status: 500 }
    );
  }
}
