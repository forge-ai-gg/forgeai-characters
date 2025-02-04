import { generateSprite } from "@/lib/chargen";
import { NextRequest } from "next/server";

interface SpriteParams {
  body: string;
  head: string;
  sex: "male" | "female";
  shadow: string;
  expression: string;
  eyes: string;
  ears: string;
  nose: string;
  eyebrows: string;
  wrinkles: string;
  beard: string;
  mustache: string;
  hair: string;
  shoulders: string;
  arms: string;
  bauldron: string;
  bracers: string;
  gloves: string;
  ring: string;
  clothes: string;
  chainmail: string;
  legs: string;
  shoes: string;
  weapon: string | null;
  shield: string;
  wounds?: boolean;
  wheelchair?: boolean;
  lizard?: boolean;
  matchBodyColor?: boolean;
  weaponVariant?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse all URL params
    const spriteParams: SpriteParams = {
      body: searchParams.get("body") || "Body_color_light",
      head: searchParams.get("head") || "Human_male_light",
      sex: (searchParams.get("sex") || "male") as "male" | "female",
      shadow: searchParams.get("shadow") || "",
      expression: searchParams.get("expression") || "",
      eyes: searchParams.get("eyes") || "",
      ears: searchParams.get("ears") || "",
      nose: searchParams.get("nose") || "",
      eyebrows: searchParams.get("eyebrows") || "",
      wrinkles: searchParams.get("wrinkles") || "",
      beard: searchParams.get("beard") || "",
      mustache: searchParams.get("mustache") || "",
      hair: searchParams.get("hair") || "",
      shoulders: searchParams.get("shoulders") || "",
      arms: searchParams.get("arms") || "",
      bauldron: searchParams.get("bauldron") || "",
      bracers: searchParams.get("bracers") || "",
      gloves: searchParams.get("gloves") || "",
      ring: searchParams.get("ring") || "",
      clothes: searchParams.get("clothes") || "",
      chainmail: searchParams.get("chainmail") || "",
      legs: searchParams.get("legs") || "",
      shoes: searchParams.get("shoes") || "",
      weapon: searchParams.get("weapon") || null,
      shield: searchParams.get("shield") || "",
      wounds: searchParams.get("wounds") === "true",
      wheelchair: searchParams.get("wheelchair") === "true",
      lizard: searchParams.get("lizard") === "true",
      matchBodyColor: searchParams.get("matchBodyColor") === "true",
      weaponVariant: searchParams.get("weaponVariant") || "",
    };

    // Add debug logging
    console.log("Generating sprite with params:", spriteParams);

    // Generate sprite using the params
    const sprite = await generateSprite(spriteParams);

    // Add debug logging
    console.log("Sprite generated:", sprite ? "success" : "failed");

    return new Response(sprite, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Sprite generation error:", error);
    return Response.json(
      { error: "Failed to generate sprite" },
      { status: 500 }
    );
  }
}
