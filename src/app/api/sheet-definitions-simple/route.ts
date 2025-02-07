import { SheetDefinition, sheetDefinitions } from "@/lib/sheetDefinitions";

export async function GET() {
  try {
    const sheetDefinitionsSimple = {
      sex: ["male", "female"],
      bodyColor: [
        "light",
        "amber",
        "olive",
        "taupe",
        "bronze",
        "brown",
        "black",
      ],
      hairStyle: [
        ...Object.entries(sheetDefinitions)
          .filter(
            ([key, value]) => (value as SheetDefinition).type_name === "hair"
          )
          .map(([key, value]) => value.name.replaceAll(" ", "_")),
      ],
      hairColor: [
        "blonde",
        "ash",
        "sandy",
        "platinum",
        "strawberry",
        "redhead",
        "ginger",
        "carrot",
        "chestnut",
        "light_brown",
        "dark_brown",
        "black",
        "raven",
        "dark_gray",
        "gray",
      ],
      shirtStyle: ["Longsleeve", "Shortsleeve"],
      shirtColor: [
        "black",
        "blue",
        "bluegray",
        "brown",
        "charcoal",
        "forest",
        "gray",
        "green",
        "lavender",
        "leather",
        "maroon",
        "navy",
      ],
      pantsStyle: ["Pants"],
      pantsColor: [
        "black",
        "blue",
        "bluegray",
        "brown",
        "charcoal",
        "forest",
        "gray",
        "green",
        "lavender",
        "leather",
        "maroon",
        "navy",
      ],
      shoesStyle: ["Boots", "Shoes"],
      shoesColor: [
        "black",
        "blue",
        "bluegray",
        "brown",
        "charcoal",
        "forest",
        "gray",
        "green",
        "lavender",
        "leather",
        "maroon",
        "navy",
      ],
    };

    console.log(sheetDefinitionsSimple);

    return new Response(JSON.stringify(sheetDefinitionsSimple), {
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
