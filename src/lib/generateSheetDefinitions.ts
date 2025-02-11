import type {
  SheetDefinition,
  SheetDefinitions,
} from "@/types/sheetDefinitions";
import fs from "fs/promises";
import path from "path";

function escapeString(str: string): string {
  return str.replace(/'/g, "\\'");
}

function stringifyObject(obj: any, indent = 0): string {
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return `[\n${obj
      .map(
        (item) =>
          " ".repeat(indent + 2) +
          (typeof item === "string"
            ? `'${escapeString(item)}'`
            : stringifyObject(item, indent + 2))
      )
      .join(",\n")}\n${" ".repeat(indent)}]`;
  }

  if (typeof obj === "object" && obj !== null) {
    const entries = Object.entries(obj).filter(([key]) => key !== "credits");
    if (entries.length === 0) return "{}";
    return `{\n${entries
      .map(
        ([key, value]) =>
          " ".repeat(indent + 2) +
          `${key}: ${
            typeof value === "string"
              ? `'${escapeString(value)}'`
              : stringifyObject(value, indent + 2)
          }`
      )
      .join(",\n")}\n${" ".repeat(indent)}}`;
  }

  return String(obj);
}

async function generateDefinitions() {
  const definitionsPath = path.join(process.cwd(), "sheet_definitions");
  const outPath = path.join(process.cwd(), "src/lib/sheetDefinitions.ts");

  const files = await fs.readdir(definitionsPath);
  const definitions: SheetDefinitions = {};

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const content = await fs.readFile(
      path.join(definitionsPath, file),
      "utf-8"
    );
    const def = JSON.parse(content) as SheetDefinition;

    const key = path.basename(file, ".json");
    definitions[key] = def;
  }

  const output = `// Auto-generated from sheet_definitions/*.json
// Do not edit directly

import type { SheetDefinition, SheetDefinitionKey, BodyDefinition } from '@/types/sheetDefinitions'

export const sheetDefinitions: Record<string, SheetDefinition | BodyDefinition> = ${stringifyObject(
    definitions
  )} as const;

export type { SheetDefinition, SheetDefinitionKey };
`;

  await fs.writeFile(outPath, output);
  console.log(`Generated definitions at ${outPath}`);

  // Import canvas properly for Node environment
  const Canvas = require("canvas");
  const { createCanvas, loadImage } = Canvas;

  const processImages = async () => {
    const MALE_BASE =
      "public/spritesheets/torso/clothes/longsleeve/longsleeve/male";
    const MALE_IDLE = `${MALE_BASE}/idle`;
    const MALE_WALK = `${MALE_BASE}/walk`;

    // Create idle folder if it doesn't exist
    await fs.mkdir(MALE_IDLE, { recursive: true });

    // Get all PNG files from walk folder
    const files = await fs.readdir(MALE_WALK);
    const pngFiles = files.filter((file) => file.endsWith(".png"));

    for (const filename of pngFiles) {
      console.log(`Processing ${filename}...`);

      const img = await loadImage(`${MALE_WALK}/${filename}`);
      const canvas = createCanvas(576, 256); // 9 columns * 64px, 4 rows * 64px
      const ctx = canvas.getContext("2d");

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Extract first column
      const firstColCanvas = createCanvas(64, 256);
      const firstCtx = firstColCanvas.getContext("2d");
      firstCtx.drawImage(img, 0, 0); // Get first column

      // Clear second column in main canvas
      ctx.clearRect(64, 0, 64, 256);

      // Draw first column into second column position, shifted up by 1 pixel
      ctx.drawImage(firstColCanvas, 0, 0, 64, 256, 64, -1, 64, 256);

      // Save the result
      const buffer = canvas.toBuffer("image/png");
      await fs.writeFile(`${MALE_IDLE}/${filename}`, buffer);

      console.log(`Successfully processed ${filename}`);
    }

    console.log("Processed animations and saved to idle folder");
  };

  // After writing definitions, process the images
  await processImages().catch(console.error);
}

generateDefinitions().catch(console.error);
