import { generateSprite } from "@/lib/chargen";
import { SpriteConfigQueryParams } from "@/types/sprites";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Format the parameters properly
    const params: SpriteConfigQueryParams = {
      body: searchParams.get("body") || "Body_color_light",
      head: searchParams.get("head") || "Human_male_light",
      sex: searchParams.get("sex") || "male",
      shadow:
        searchParams.get("shadow") === "true" ||
        searchParams.get("shadow") === "1"
          ? "Shadow_shadow"
          : undefined,
      ...Object.fromEntries(searchParams.entries()),
    };

    // Add debug logging
    console.log("Processing sprite params:", params);

    const sprite = await generateSprite(params);

    // Create a cache key from the query params
    const cacheKey = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    return new Response(sprite, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
        Vary: "Accept, Accept-Encoding, Accept-Language, Cookie",
        "Cache-Key": cacheKey, // Custom header to differentiate cache entries
      },
    });
  } catch (error) {
    console.error("Sprite generation error:", error);
    return Response.json(
      { error: "Failed to generate sprite", details: error },
      { status: 500 }
    );
  }
}
