import { sheetDefinitions } from "@/lib/sheetDefinitions";

export async function GET() {
  try {
    return new Response(JSON.stringify(sheetDefinitions), {
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
