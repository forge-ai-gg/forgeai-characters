import { SpriteLayer } from "@/types/sprites";
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
  spellcast: { frames: 7, rows: 4 }, // First 4 rows, 7 frames each
  thrust: { frames: 8, rows: 4 }, // Next 4 rows, 8 frames each
  walk: { frames: 9, rows: 4 }, // Next 4 rows, 9 frames each
  slash: { frames: 6, rows: 4 }, // 6 frames, 4 rows
  shoot: { frames: 13, rows: 4 }, // 13 frames, 4 rows
  hurt: { frames: 6, rows: 1 }, // Single row, 6 frames
  climb: { frames: 6, rows: 1 }, // Single row, 6 frames
  idle: { frames: 2, rows: 4 }, // 4 frames, 4 rows
  jump: { frames: 5, rows: 4 }, // Single row, 6 frames
  sit: { frames: 3, rows: 4 }, // Single row, 5 frames
  emote: { frames: 3, rows: 4 }, // Single row, 4 frames
  run: { frames: 8, rows: 4 }, // 8 frames, 4 rows
  combat_idle: { frames: 2, rows: 4 }, // 2 frames, 4 rows
  backslash: { frames: 6, rows: 4 }, // 6 frames, 4 rows
  halfslash: { frames: 5, rows: 4 }, // 5 frames, 4 rows
};

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

async function loadSheetDefinitions(): Promise<SheetDefinition[]> {
  const definitionsPath = path.join(process.cwd(), "sheet_definitions");
  console.log("Reading sheet definitions from:", definitionsPath);

  const files = await fs.readdir(definitionsPath);
  console.log("Found definition files:", files);

  const definitions: SheetDefinition[] = [];
  for (const file of files) {
    if (file.endsWith(".json")) {
      const filePath = path.join(definitionsPath, file);
      console.log("Loading definition file:", filePath);
      const content = await fs.readFile(filePath, "utf-8");
      definitions.push(JSON.parse(content));
    }
  }
  return definitions;
}

async function getLayersForSprite(
  params: SpriteParams
): Promise<SpriteLayer[]> {
  const layers: SpriteLayer[] = [];
  const definitions = await loadSheetDefinitions();
  const assetsPath = path.join(process.cwd(), "public/spritesheets");

  console.log("Assets path:", assetsPath);
  console.log(
    "Loading definitions from:",
    path.join(process.cwd(), "sheet_definitions")
  );

  // Process each component in order of z-index
  const components = [
    { type: "shadow", path: params.shadow },
    { type: "body", path: params.body },
    { type: "head", path: params.head },
    { type: "eyes", path: params.eyes },
    { type: "ears", path: params.ears },
    { type: "nose", path: params.nose },
    { type: "eyebrows", path: params.eyebrows },
    { type: "wrinkles", path: params.wrinkles },
    { type: "beard", path: params.beard },
    { type: "mustache", path: params.mustache },
    { type: "hair", path: params.hair },
    { type: "shoulders", path: params.shoulders },
    { type: "arms", path: params.arms },
    { type: "bauldron", path: params.bauldron },
    { type: "bracers", path: params.bracers },
    { type: "gloves", path: params.gloves },
    { type: "ring", path: params.ring },
    { type: "clothes", path: params.clothes },
    { type: "chainmail", path: params.chainmail },
    { type: "legs", path: params.legs },
    { type: "shoes", path: params.shoes },
    { type: "weapon", path: params.weapon },
    { type: "shield", path: params.shield },
  ];

  // Helper function to get the base type from a parameter
  const getBaseType = (param: string) => {
    const parts = param.split("_");
    return parts[0].toLowerCase(); // e.g. "Human" from "Human_male_light"
  };

  // Helper function to get the last segment of a parameter
  const getLastSegment = (param: string) => {
    const parts = param.split("_");
    return parts[parts.length - 1];
  };

  // Helper function to parse complex head values
  const parseHeadValue = (value: string) => {
    const parts = value.split("_");
    return {
      race: parts[0].toLowerCase(), // e.g., "human"
      gender: parts[1].toLowerCase(), // e.g., "male"
      variant: parts[2] || "", // e.g., "light"
    };
  };

  // Process each component
  for (const component of components) {
    if (component.path) {
      let def;

      if (component.type === "head") {
        const parsed = parseHeadValue(component.path);
        def = definitions.find((d) => {
          // Match exact name (e.g., "Human male" for "Human_male_light")
          const defName = d.name.toLowerCase();
          const searchName = `${parsed.race} ${parsed.gender}`;
          return d.type_name === "head" && defName === searchName;
        });

        console.log("Head definition search:", {
          path: component.path,
          parsed,
          foundDefinition: def?.name,
        });
      } else {
        def = definitions.find((d) => d.type_name === component.type);
      }

      if (def) {
        const sexKey = params.sex as keyof typeof def.layer_1;
        const basePath = def.layer_1[sexKey];

        if (basePath) {
          // Use only the last segment of the parameter for the filename
          const fileName = path.join(
            assetsPath,
            basePath as string,
            "idle",
            `${getLastSegment(component.path)}.png`
          );

          console.log(`Attempting to load: ${fileName}`);

          try {
            await fs.access(fileName);
            console.log(`File exists: ${fileName}`);
            layers.push({
              fileName,
              zPos: def.layer_1.zPos,
              parentName: component.type,
              name: component.type,
              variant: component.path,
              supportedAnimations: def.animations || [],
            });
          } catch (error) {
            console.log(`File not found: ${fileName}`);
          }
        }
      }
    }
  }

  console.log("Final layers to draw:", layers);
  return layers;
}

export async function generateSprite(params: SpriteParams): Promise<Buffer> {
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
  await drawLayers(ctx as any, sortedLayers, params);

  // 5. Return PNG buffer
  return canvas.toBuffer("image/png");
}

async function drawLayers(
  ctx: CanvasRenderingContext2D,
  layers: SpriteLayer[],
  params: SpriteParams
) {
  console.log("Drawing layers:", layers.length);

  for (const [animName, baseYOffset] of Object.entries(BASE_ANIMATIONS)) {
    try {
      const config = ANIMATION_CONFIGS[animName];
      if (!config) {
        console.log(`No config found for animation: ${animName}`);
        continue;
      }

      const animationLayers = await Promise.all(
        layers.map(async (layer) => {
          // Replace 'idle' with the current animation name in the path
          const animPath = layer.fileName.replace(/\/idle\//, `/${animName}/`);

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

      // Calculate actual Y offset based on animation type
      const yOffset = Number(baseYOffset);

      // For each row in this animation
      for (let row = 0; row < config.rows; row++) {
        // For each frame in the animation
        for (let frame = 0; frame < config.frames; frame++) {
          // Draw each layer in z-order for this specific frame
          for (const layer of validLayers) {
            ctx.drawImage(
              layer.image as unknown as CanvasImageSource,
              frame * UNIVERSAL_FRAME_SIZE,
              row * UNIVERSAL_FRAME_SIZE,
              UNIVERSAL_FRAME_SIZE,
              UNIVERSAL_FRAME_SIZE,
              frame * UNIVERSAL_FRAME_SIZE,
              yOffset + row * UNIVERSAL_FRAME_SIZE,
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
