import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Simple in-memory rate limiting
const rateLimit = new Map<string, number[]>();

const MAX_REQUESTS_PER_MINUTE = 10;
const WINDOW_DURATION_MS = 60000;

export function middleware(request: NextRequest) {
  // Handle OPTIONS request for CORS preflight
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Create base response
  const response = NextResponse.next();

  // Add CORS headers for all origins
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");

  // Apply rate limiting only to sprite endpoint
  if (request.nextUrl.pathname.startsWith("/api/sprite")) {
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
    const now = Date.now();
    const windowStart = now - WINDOW_DURATION_MS;

    const requestCount = rateLimit.get(ip) ?? [];
    const recentRequests = requestCount.filter((time) => time > windowStart);

    if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
          },
        }
      );
    }

    recentRequests.push(now);
    rateLimit.set(ip, recentRequests);
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
