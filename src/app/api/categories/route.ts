import { generateCategories } from "@/lib/generateSheetDefinitionCategories";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const categories = await generateCategories();

    return new Response(JSON.stringify(categories), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=31536000, immutable",
        Vary: "Accept, Accept-Encoding, Accept-Language, Cookie",
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
