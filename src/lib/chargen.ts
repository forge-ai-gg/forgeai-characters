import { SpriteGenerationError } from "@/types/api";
import { GenerateSpriteParams } from "@/types/sprites";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { BASE_ANIMATIONS, sliceSprite } from "./imageProcessing";

const UNIVERSAL_FRAME_SIZE = 64;
const UNIVERSAL_SHEET_WIDTH = 832;
const UNIVERSAL_SHEET_HEIGHT = 3456;

export async function generateSprite(
  params: GenerateSpriteParams
): Promise<Buffer> {
  const { type, animation = "idle", color = "light" } = params;

  // Create base canvas
  const baseImage = sharp({
    create: {
      width: UNIVERSAL_FRAME_SIZE,
      height: UNIVERSAL_FRAME_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  try {
    // Load sprite sheets
    const assetsPath = path.join(process.cwd(), "public/assets");
    const layers = await loadSpriteLayers(assetsPath, type, color);

    // Get animation offset
    const animationOffset =
      BASE_ANIMATIONS[animation as keyof typeof BASE_ANIMATIONS] ?? 0;

    // Slice and composite layers
    const compositeLayers = await Promise.all(
      layers.map(async (layer) => {
        const sliced = await sliceSprite(layer.buffer, {
          width: UNIVERSAL_FRAME_SIZE,
          height: UNIVERSAL_FRAME_SIZE,
          offsetX: 0,
          offsetY: animationOffset,
        });

        return {
          input: sliced,
          top: 0,
          left: 0,
        };
      })
    );

    // Combine all layers
    return baseImage.composite(compositeLayers).png().toBuffer();
  } catch (error) {
    throw new SpriteGenerationError(
      "Failed to generate sprite",
      error instanceof Error ? error.message : undefined
    );
  }
}

async function loadSpriteLayers(
  assetsPath: string,
  type?: string,
  color?: string
) {
  // This would load your sprite sheets based on type and color
  // You'll need to adapt this to your actual file structure
  const layers = [];

  // Example layer loading:
  const bodyPath = path.join(assetsPath, `body_${type}_${color}.png`);
  if (await fileExists(bodyPath)) {
    layers.push({
      buffer: await fs.readFile(bodyPath),
      zIndex: 0,
    });
  }

  return layers.sort((a, b) => a.zIndex - b.zIndex);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
