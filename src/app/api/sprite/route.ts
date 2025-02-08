import { ALLOWED_ORIGINS, LOCALHOST_PATTERN } from "@/lib/constants";
import { generateSprite } from "@/lib/generateSprite";
import { SpriteConfigQueryParams } from "@/types/sprites";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Check origin if it exists
    const origin = request.headers.get("origin");
    if (
      origin &&
      !ALLOWED_ORIGINS.includes(origin) &&
      !LOCALHOST_PATTERN.test(origin)
    ) {
      return new Response("Not allowed", {
        status: 403,
        headers: { "Content-Type": "text/plain" },
      });
    }

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

    // Add debug logging
    console.log("Processing sprite params:", params);

    const sprite = await generateSprite(params);

    // Create a cache key from the query params
    const cacheKey = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    // Add CORS headers when origin is present
    const headers: Record<string, string> = {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      Vary: "Origin, Accept, Accept-Encoding, Accept-Language, Cookie",
      "Cache-Key": cacheKey,
    };

    if (
      origin &&
      (ALLOWED_ORIGINS.includes(origin) || LOCALHOST_PATTERN.test(origin))
    ) {
      headers["Access-Control-Allow-Origin"] = origin;
      headers["Access-Control-Allow-Methods"] = "GET";
    }

    return new Response(sprite, { headers });
  } catch (error) {
    console.error("Sprite generation error:", error);
    return Response.json(
      { error: "Failed to generate sprite", details: error },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (
    origin &&
    (ALLOWED_ORIGINS.includes(origin) || LOCALHOST_PATTERN.test(origin))
  ) {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  return new Response(null, { status: 204 });
}
