import { generateSprite } from "@/lib/generateSprite";
import { SpriteConfigQueryParams } from "@/types/sprites";
import { NextRequest } from "next/server";

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

    // Add debug logging
    console.log("Processing sprite params:", params);

    const sprite = await generateSprite(params);

    // Create a cache key from the query params
    const cacheKey = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    const headers: Record<string, string> = {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Cache-Key": cacheKey,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Max-Age": "86400",
    };

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
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Max-Age": "86400",
    },
  });
}
