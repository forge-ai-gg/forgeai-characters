import { GenerateSpriteParams, SpriteLayer } from "@/types/sprites";
import { createCanvas, loadImage } from "canvas";
import { promises as fs } from "fs";
import path from "path";
import { BASE_ANIMATIONS } from "./imageProcessing";

const UNIVERSAL_FRAME_SIZE = 64;
const UNIVERSAL_SHEET_WIDTH = 832;
const UNIVERSAL_SHEET_HEIGHT = 3456;

interface SheetDefinition {
  name: string;
  type_name: string;
  layer_1: {
    zPos: number;
    male: string;
    female: string;
    muscular?: string;
    teen?: string;
    pregnant?: string;
  };
  variants: string[];
  animations?: string[];
}

interface AnimationConfig {
  frames: number;
  rows: number;
}

const ANIMATION_CONFIGS: Record<string, AnimationConfig> = {
  spellcast: { frames: 7, rows: 4 },
  thrust: { frames: 8, rows: 4 },
  walk: { frames: 9, rows: 4 },
  slash: { frames: 6, rows: 4 },
  shoot: { frames: 13, rows: 4 },
  hurt: { frames: 6, rows: 4 },
  climb: { frames: 4, rows: 4 },
  idle: { frames: 1, rows: 4 },
  jump: { frames: 7, rows: 4 },
  sit: { frames: 5, rows: 4 },
  emote: { frames: 4, rows: 4 },
  run: { frames: 9, rows: 4 },
  combat_idle: { frames: 1, rows: 4 },
  backslash: { frames: 6, rows: 4 },
  halfslash: { frames: 7, rows: 4 },
};

async function loadSheetDefinitions(): Promise<SheetDefinition[]> {
  const definitionsPath = path.join(process.cwd(), "sheet_definitions");
  const files = await fs.readdir(definitionsPath);

  const definitions: SheetDefinition[] = [];
  for (const file of files) {
    if (file.endsWith(".json")) {
      const content = await fs.readFile(
        path.join(definitionsPath, file),
        "utf-8"
      );
      definitions.push(JSON.parse(content));
    }
  }
  return definitions;
}

async function getLayersForSprite(
  params: GenerateSpriteParams
): Promise<SpriteLayer[]> {
  const layers: SpriteLayer[] = [];
  const definitions = await loadSheetDefinitions();
  const assetsPath = path.join(process.cwd(), "public/spritesheets");
  const animation = params.animation || "idle";

  console.log("Loaded definitions:", definitions.length);

  // Load body base layer
  const bodyDef = definitions.find((d) => d.type_name === "body");
  console.log("Found body definition:", bodyDef);

  if (bodyDef) {
    const bodyTypeKey = params.bodyType as keyof typeof bodyDef.layer_1;
    const basePath = bodyDef.layer_1[bodyTypeKey];

    if (basePath) {
      // Include animation folder in the path
      const fileName = path.join(assetsPath, basePath, animation, "light.png");
      console.log("Body file path:", fileName);

      layers.push({
        fileName,
        zPos: bodyDef.layer_1.zPos,
        parentName: "body",
        name: "Body",
        variant: "light",
        supportedAnimations: bodyDef.animations,
      });
    }
  }

  // Load head layer
  const headDef = definitions.find(
    (d) => d.type_name === "head" && d.name === "Human male"
  );
  console.log("Found head definition:", headDef);

  if (headDef) {
    const bodyTypeKey = params.bodyType as keyof typeof headDef.layer_1;
    const basePath = headDef.layer_1[bodyTypeKey];

    if (basePath) {
      // Include animation folder in the path
      const fileName = path.join(assetsPath, basePath, animation, "light.png");
      console.log("Head file path:", fileName);

      layers.push({
        fileName,
        zPos: headDef.layer_1.zPos,
        parentName: "head",
        name: "Head",
        variant: "light",
        supportedAnimations: headDef.animations,
      });
    }
  }

  console.log("Final layers to draw:", layers);
  return layers;
}

export async function generateSprite(
  params: GenerateSpriteParams
): Promise<Buffer> {
  // 1. Load layer definitions based on params
  const layers = await getLayersForSprite(params);
  console.log("Got layers:", layers.length);

  // 2. Create canvas with full spritesheet dimensions
  const canvas = createCanvas(UNIVERSAL_SHEET_WIDTH, UNIVERSAL_SHEET_HEIGHT);
  const ctx = canvas.getContext("2d");

  // Clear canvas with a transparent background
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 3. Sort layers by z-position
  const sortedLayers = layers.sort((a, b) => a.zPos - b.zPos);

  // 4. Draw layers to canvas
  await drawLayers(ctx, sortedLayers, params);

  // 5. Return PNG buffer
  return canvas.toBuffer("image/png");
}

async function drawLayers(
  ctx: CanvasRenderingContext2D,
  layers: SpriteLayer[],
  params: GenerateSpriteParams
) {
  console.log("Drawing layers:", layers.length);

  // Try each animation type
  for (const [animName, yOffset] of Object.entries(BASE_ANIMATIONS)) {
    try {
      const config = ANIMATION_CONFIGS[animName] || { frames: 7, rows: 4 };

      // Load animation-specific images for each layer
      const animationLayers = await Promise.all(
        layers.map(async (layer) => {
          const animPath = layer.fileName.replace(
            `/${params.animation || "idle"}/`,
            `/${animName}/`
          );
          try {
            return {
              image: await loadImage(animPath),
              zPos: layer.zPos,
            };
          } catch (error) {
            console.log(
              `Animation ${animName} not found for layer:`,
              layer.fileName
            );
            return null;
          }
        })
      );

      // Filter out any failed loads and sort by zPos
      const validLayers = animationLayers
        .filter((l): l is NonNullable<typeof l> => l !== null)
        .sort((a, b) => a.zPos - b.zPos);

      // For each direction (down, left, right, up)
      for (let direction = 0; direction < config.rows; direction++) {
        // For each frame in the animation
        for (let frame = 0; frame < config.frames; frame++) {
          // Draw each layer in z-order for this specific frame
          for (const layer of validLayers) {
            ctx.drawImage(
              layer.image,
              frame * UNIVERSAL_FRAME_SIZE,
              direction * UNIVERSAL_FRAME_SIZE,
              UNIVERSAL_FRAME_SIZE,
              UNIVERSAL_FRAME_SIZE,
              frame * UNIVERSAL_FRAME_SIZE,
              yOffset + direction * UNIVERSAL_FRAME_SIZE,
              UNIVERSAL_FRAME_SIZE,
              UNIVERSAL_FRAME_SIZE
            );
          }
        }
      }
    } catch (error) {
      console.error(`Failed to draw animation ${animName}:`, error);
    }
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
