import { SpriteConfigQueryParams } from "@/types/sprites";
import { createCanvas } from "canvas";
import { UNIVERSAL_SHEET_HEIGHT, UNIVERSAL_SHEET_WIDTH } from "./constants";
import { drawLayers } from "./drawLayers";
import { getLayersForSprite } from "./getLayersForSprite";

export async function generateSprite(
  params: Partial<SpriteConfigQueryParams>
): Promise<Buffer> {
  // 1. Load layer definitions based on params
  const layers = await getLayersForSprite(params);
  // console.log("Got layers:", layers.length);

  // 2. Create canvas with full spritesheet dimensions
  const canvas = createCanvas(UNIVERSAL_SHEET_WIDTH, UNIVERSAL_SHEET_HEIGHT);
  const ctx = canvas.getContext("2d");

  // Clear canvas with a transparent background
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 3. Sort layers by z-position
  const sortedLayers = layers.sort((a, b) => a.zPos - b.zPos);

  // 4. Draw layers to canvas
  await drawLayers(ctx as any, sortedLayers);

  // 5. Return PNG buffer
  return canvas.toBuffer("image/png");
}
