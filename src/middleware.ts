import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Simple in-memory rate limiting
const rateLimit = new Map<string, number[]>();

const MAX_REQUESTS_PER_MINUTE = 10;
const WINDOW_DURATION_MS = 60000;

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/sprite")) {
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
    const now = Date.now();
    const windowStart = now - WINDOW_DURATION_MS; // 1 minute window

    const requestCount = rateLimit.get(ip) ?? [];
    const recentRequests = requestCount.filter((time) => time > windowStart);

    if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
      // 10 requests per minute
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    recentRequests.push(now);
    rateLimit.set(ip, recentRequests);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/sprite/:path*",
};
