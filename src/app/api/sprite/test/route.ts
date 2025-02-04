import { generateSprite } from "@/lib/chargen";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const sprite = await generateSprite({
      id: "test",
      type: "basic",
      bodyType: "male",
      animation: "idle",
      matchBodyColor: false,
    });

    return new Response(sprite, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Test sprite generation error:", error);
    return Response.json(
      { error: "Failed to generate test sprite" },
      { status: 500 }
    );
  }
}
