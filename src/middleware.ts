import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Simple in-memory rate limiting
const rateLimit = new Map<string, number[]>();

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/sprite")) {
    const ip = request.ip ?? "anonymous";
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window

    const requestCount = rateLimit.get(ip) ?? [];
    const recentRequests = requestCount.filter((time) => time > windowStart);

    if (recentRequests.length >= 60) {
      // 60 requests per minute
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
