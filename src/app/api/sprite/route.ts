import { generateSprite } from "@/lib/generateSprite";
import { SpriteConfigQueryParams } from "@/types/sprites";
import crypto from "crypto";
import { NextRequest } from "next/server";

// Helper function to create normalized cache key
function createCacheKey(params: Partial<SpriteConfigQueryParams>): string {
  // Sort params for consistent key generation
  const sortedEntries = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b));

  const paramString = sortedEntries
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return paramString;
}

// Helper function to create ETag
function createETag(cacheKey: string): string {
  return crypto
    .createHash("sha256")
    .update(cacheKey)
    .digest("hex")
    .substring(0, 16);
}

// Helper function to get common headers
function getHeaders(cacheKey: string, etag: string) {
  return {
    "Content-Type": "image/png",
    "Cache-Control": "public, max-age=31536000, immutable",
    ETag: `"${etag}"`,
    Vary: "Accept",
    "X-Cache-Key": cacheKey,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD",
    "Access-Control-Allow-Headers": "If-None-Match",
    "Access-Control-Max-Age": "86400",
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Format the parameters properly
    const params: Partial<SpriteConfigQueryParams> = {
      body: searchParams.get("body") || "Body_color_light",
      head: searchParams.get("head") || "Human_male_light",
      sex: searchParams.get("sex") || "male",
      // shadow:
      //   searchParams.get("shadow") === "true" ||
      //   searchParams.get("shadow") === "1"
      //     ? "Shadow_shadow"
      //     : undefined,
      ...Object.fromEntries(searchParams.entries()),
    };

    // Create cache key and ETag
    const cacheKey = createCacheKey(params);
    const etag = createETag(cacheKey);

    // Check if client already has this version
    const ifNoneMatch = request.headers.get("if-none-match");
    if (ifNoneMatch === `"${etag}"`) {
      return new Response(null, {
        status: 304,
        headers: getHeaders(cacheKey, etag),
      });
    }

    // Add debug logging
    console.log("Processing sprite params:", params);

    const sprite = await generateSprite(params);

    return new Response(sprite as BodyInit, {
      headers: getHeaders(cacheKey, etag),
    });
  } catch (error) {
    console.error("Sprite generation error:", error);
    // Don't cache errors
    return Response.json(
      { error: "Failed to generate sprite", details: error },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}

// HEAD handler - returns headers without generating sprite
export async function HEAD(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Format the parameters properly (same as GET)
    const params: Partial<SpriteConfigQueryParams> = {
      body: searchParams.get("body") || "Body_color_light",
      head: searchParams.get("head") || "Human_male_light",
      sex: searchParams.get("sex") || "male",
      ...Object.fromEntries(searchParams.entries()),
    };

    // Create cache key and ETag
    const cacheKey = createCacheKey(params);
    const etag = createETag(cacheKey);

    // Check if client already has this version
    const ifNoneMatch = request.headers.get("if-none-match");
    if (ifNoneMatch === `"${etag}"`) {
      return new Response(null, {
        status: 304,
        headers: getHeaders(cacheKey, etag),
      });
    }

    // Return headers without generating the sprite
    return new Response(null, {
      headers: getHeaders(cacheKey, etag),
    });
  } catch (error) {
    console.error("HEAD request error:", error);
    return new Response(null, {
      status: 500,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}

// Add OPTIONS handler for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD",
      "Access-Control-Allow-Headers": "If-None-Match",
      "Access-Control-Max-Age": "86400",
    },
  });
}
