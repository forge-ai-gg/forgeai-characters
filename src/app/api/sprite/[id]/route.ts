import { generateSprite } from "@/lib/chargen";
import { validateSpriteParams } from "@/lib/validation";
import { SpriteGenerationError } from "@/types/api";
import { GenerateSpriteParams } from "@/types/sprites";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const spriteParams: GenerateSpriteParams = {
      id: params.id,
      type: searchParams.get("type") as any,
      color: searchParams.get("color") ?? undefined,
      animation: searchParams.get("animation") as any,
      bodyType: searchParams.get("bodyType") as any,
      matchBodyColor: searchParams.get("matchBodyColor") === "true",
    };

    validateSpriteParams(spriteParams);
    const sprite = await generateSprite(spriteParams);

    return new Response(sprite, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Sprite generation error:", error);

    if (error instanceof SpriteGenerationError) {
      return Response.json(
        {
          error: error.message,
          details: error.details,
        },
        { status: 400 }
      );
    }

    return Response.json(
      { error: "Failed to generate sprite" },
      { status: 500 }
    );
  }
} 