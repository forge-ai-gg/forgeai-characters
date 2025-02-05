import type { BodyDefinition, SheetDefinition } from "@/types/sheetDefinitions";
import { LayerDefinition } from "@/types/sheetDefinitions";
import { SpriteConfigQueryParams, SpriteLayer } from "@/types/sprites";
import { createCanvas, loadImage } from "canvas";
import { promises as fs } from "fs";
import path from "path";
import { BASE_ANIMATIONS } from "./imageProcessing";
import { sheetDefinitions } from "./sheetDefinitions";

const UNIVERSAL_FRAME_SIZE = 64;
const UNIVERSAL_SHEET_WIDTH = 832;
const UNIVERSAL_SHEET_HEIGHT = 3456;

const ASSETS_PATH = path.join(process.cwd(), "public/spritesheets");

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

const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  originalError("\x1b[31m", ...args, "\x1b[0m");
};

console.warn = (...args) => {
  originalWarn("\x1b[33m", ...args, "\x1b[0m");
};

export async function generateSprite(
  params: SpriteConfigQueryParams
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

function parseVariant(value: string): {
  style?: string;
  subtype?: string;
  color: string;
  modifier?: string;
} {
  const parts = value.split("_");

  // Handle head formats
  if (value.toLowerCase().startsWith("minotaur")) {
    // Format: Minotaur_female_fur_grey
    const [style, sex, ...colorParts] = parts;
    return { style, color: colorParts.join("_") };
  }

  if (parts.length === 4) {
    if (parts?.[0]?.toLowerCase() === "head") {
      // Format: Head_Minotaur_female_grey
      const [_, style, sex, ...colorParts] = parts;
      return { style, color: colorParts.join("_") };
    }
    // Format: Body_color_fur_gold
    const [_, __, subtype, color] = parts;
    return { subtype, color: color as string };
  } else if (parts.length === 3) {
    const [type, second, third] = parts;
    if (type?.toLowerCase() === "head") {
      // Format: Head_Minotaur_grey
      return { style: second, color: third as string };
    }
    // Format: Body_color_light
    return { color: third as string };
  } else if (parts.length === 2 && parts[0].toLowerCase() === "head") {
    // Format: Head_human
    return { style: parts[1], color: "light" }; // Default color for heads
  }
  return { color: parts[parts.length - 1] as string };
}

async function getLayersForSprite(
  params: SpriteConfigQueryParams
): Promise<SpriteLayer[]> {
  const layers: SpriteLayer[] = [];

  // Special handling for body options
  if (params.body) {
    console.log(`\nProcessing body: ${params.body}`);
    const bodyDef = sheetDefinitions["body"] as BodyDefinition;
    if (bodyDef?.options) {
      const sex = getEffectiveSex(params.sex);
      const { subtype, color } = parseVariant(params.body);
      console.log(`Parsed body variant - subtype: ${subtype}, color: ${color}`);

      // Handle special body types (skeleton, zombie, etc)
      if (params.special) {
        const specialDef = sheetDefinitions[
          `body_${params.special}`
        ] as SheetDefinition;
        if (specialDef) {
          const layer = specialDef.layer_1 as LayerDefinition;
          const sexPath = layer[sex as keyof LayerDefinition] as
            | string
            | undefined;

          if (sexPath) {
            layers.push({
              fileName: path.join(
                ASSETS_PATH,
                sexPath,
                `${params.special}.png`
              ),
              zPos: layer.zPos,
              parentName: "body",
              name: "body_special",
              variant: params.special,
              supportedAnimations:
                specialDef.animations || Object.keys(ANIMATION_CONFIGS),
            });
            return layers; // Special bodies replace normal body
          }
        }
      }

      // Standard body handling
      try {
        let bodyPath = "body/bodies";
        switch (params.sex) {
          case "pregnant":
            bodyPath = "body/bodies/pregnant";
            break;
          case "muscular":
            bodyPath = "body/bodies/muscular";
            break;
          case "teen":
            bodyPath = "body/bodies/teen";
            break;
          default:
            bodyPath = `body/bodies/${sex}`;
        }
        console.log(`Resolved body path: ${bodyPath}`);

        const fullVariant = subtype ? `${subtype}_${color}` : color;
        console.log(
          `Attempting to find body file with variant: ${fullVariant}`
        );

        const fileName = await findValidAnimationFile(
          bodyPath,
          fullVariant,
          Object.keys(ANIMATION_CONFIGS)
        );

        if (fileName) {
          console.log(`Found body file: ${fileName}`);
          layers.push({
            fileName,
            zPos: 10,
            parentName: "body",
            name: "body_base",
            variant: fullVariant,
            supportedAnimations: Object.keys(ANIMATION_CONFIGS),
          });
        } else {
          console.error(`❌ Body file not found:
            Sex: ${sex}
            Variant: ${fullVariant}
            Attempted path: ${path.join(ASSETS_PATH, bodyPath, fullVariant)}.png
            Also tried animations: ${[
              "walk",
              "idle",
              "combat_idle",
              "run",
            ].join(", ")}`);
        }
      } catch (error) {
        console.error(`❌ Body processing error:
          Sex: ${sex}
          Body param: ${params.body}
          Error: ${error}`);
      }
    }
  }

  // Process all components including shadow
  for (const [type, value] of Object.entries(params)) {
    // Skip non-component params
    if (
      !value ||
      value === "none" ||
      type === "body" ||
      type === "special" ||
      type === "sex"
    )
      continue;

    console.log(`\nProcessing component: ${type} = ${value}`);

    const sheetDefinition = Object.values(sheetDefinitions).find(
      (d): d is SheetDefinition => "type_name" in d && d.type_name === type
    );

    if (!sheetDefinition) {
      console.error(`❌ No sheet definition found for type: ${type} (${type})`);
      continue;
    }

    if (type === "shadow") {
      // Special handling for shadow using its sheet definition
      const layer = sheetDefinition.layer_1 as LayerDefinition;
      if (!layer) continue;

      const sexPath = layer[params.sex as keyof LayerDefinition] as
        | string
        | undefined;
      if (!sexPath) continue;

      // Try to find a valid animation file for shadow
      const fileName = await findValidAnimationFile(sexPath, "shadow", [
        "spellcast",
        "thrust",
        "walk",
        "slash",
        "shoot",
        "hurt",
        "idle",
        "run",
      ]);

      if (fileName) {
        layers.push({
          fileName,
          zPos: layer.zPos,
          parentName: "shadow",
          name: "shadow",
          variant: "shadow",
          supportedAnimations: [
            "spellcast",
            "thrust",
            "walk",
            "slash",
            "shoot",
            "hurt",
            "idle",
            "run",
          ],
        });
      } else {
        console.error(`Shadow file not found in path: ${sexPath}`);
      }
      continue;
    }

    await processLayersForComponent(
      layers,
      sheetDefinition,
      type,
      value,
      params
    );
  }

  return layers.sort((a, b) => a.zPos - b.zPos);
}

async function processLayersForComponent(
  layers: SpriteLayer[],
  sheetDefinition: SheetDefinition,
  type: string,
  value: string,
  params: SpriteConfigQueryParams
): Promise<void> {
  console.log(`\nProcessing component details:`, {
    type,
    value,
    definition_type: sheetDefinition.type_name,
    has_animations: !!sheetDefinition.animations,
    layers: Object.keys(sheetDefinition).filter((k) => k.startsWith("layer_")),
  });

  // Special handling for heads
  if (type === "head") {
    const { style, color } = parseVariant(value);
    const variant = color;
    const headStyle = style?.toLowerCase() || "minotaur";
    const sex = params.sex || "male";

    // Adjust head key format - try with sex-specific variant first
    const headKey = `heads_${headStyle}_${sex}`;
    const altHeadKey = `heads_${headStyle}`;

    console.log(
      `Looking up head definition with keys: ${headKey} or ${altHeadKey}`
    );
    console.log("Available definitions:", Object.keys(sheetDefinitions));

    const headDefinition = (
      style
        ? sheetDefinitions[headKey] || sheetDefinitions[altHeadKey as string]
        : undefined
    ) as SheetDefinition;

    if (!headDefinition) {
      console.error(
        `❌ No head definition found for keys: ${headKey} or ${altHeadKey}`
      );
      return;
    }

    for (let i = 1; i <= 8; i++) {
      const layerKey = `layer_${i}` as keyof SheetDefinition;
      const layer = headDefinition[layerKey] as LayerDefinition | undefined;

      if (!layer) continue;

      const sexPath = layer[params.sex as keyof LayerDefinition] as
        | string
        | undefined;
      if (!sexPath) continue;

      // Use the sexPath from the definition
      let fileName = await findValidAnimationFile(
        sexPath,
        variant,
        headDefinition.animations || Object.keys(ANIMATION_CONFIGS)
      );

      if (fileName) {
        layers.push({
          fileName,
          zPos: layer.zPos,
          parentName: type,
          name: `${type}_${layerKey}`,
          variant: value,
          supportedAnimations: headDefinition.animations || [],
        });
      } else {
        console.error(
          `Head file not found for style: ${style}, sex: ${params.sex}, variant: ${variant}, path: ${sexPath}`
        );
      }
    }
    return;
  }

  // Regular component handling
  const parts = value.split("_");
  let variant = parts[parts.length - 1];

  // Special handling for shields
  if (type === "shield") {
    // Format: Kite_kite_gray_green -> gray_green
    const colorParts = parts.slice(2); // Skip "Kite_kite" prefix
    variant = colorParts.join("_");

    for (let i = 1; i <= 8; i++) {
      const layerKey = `layer_${i}` as keyof SheetDefinition;
      const layer = sheetDefinition[layerKey] as LayerDefinition | undefined;

      if (!layer) continue;

      // Shields have fg/ and bg/ paths
      const componentPath =
        layer.male?.replace("/fg/", "/") || layer.male?.replace("/bg/", "/");

      if (!componentPath) {
        console.log(`No path found for shield layer ${i}`);
        continue;
      }

      const fileName = await findValidAnimationFile(
        componentPath,
        variant,
        sheetDefinition.animations
      );

      if (fileName) {
        layers.push({
          fileName,
          zPos: layer.zPos,
          parentName: type,
          name: `${type}_${layerKey}`,
          variant: value,
          supportedAnimations: sheetDefinition.animations || [],
        });
      }
    }
    return;
  }

  for (let i = 1; i <= 8; i++) {
    const layerKey = `layer_${i}` as keyof SheetDefinition;
    const layer = sheetDefinition[layerKey] as LayerDefinition | undefined;

    if (!layer) continue;

    // Get path - use direct path if available, otherwise try sex-specific
    const componentPath = layer[params.sex as keyof LayerDefinition] as
      | string
      | undefined;

    if (!componentPath) {
      console.log(`No path found for component ${type}, layer ${i}`);
      continue;
    }

    console.log(`Attempting file lookup:`, {
      componentPath,
      variant,
      animations: sheetDefinition.animations,
    });

    const fileName = await findValidAnimationFile(
      componentPath,
      variant || "",
      sheetDefinition.animations
    );

    if (fileName) {
      layers.push({
        fileName,
        zPos: layer.zPos,
        parentName: type,
        name: `${type}_${layerKey}`,
        variant: value,
        supportedAnimations: sheetDefinition.animations || [],
      });
    } else {
      console.error(
        `❌ Component file not found:
         Type: ${type}
         Path: ${componentPath}
         Variant: ${variant}
         Sex: ${params.sex}`
      );
    }
  }
}

async function findValidAnimationFile(
  componentPath: string,
  variant: string,
  supportedAnimations?: string[]
): Promise<string | null> {
  console.log(`\nSearching for file:
    Component path: ${componentPath}
    Variant: ${variant}
    Supported animations: ${supportedAnimations?.join(", ")}`);

  // Try non-animated variant first
  const baseFileName = path.join(ASSETS_PATH, componentPath, `${variant}.png`);
  const animationPriority = ["walk", "idle", "combat_idle", "run"];

  try {
    await fs.access(baseFileName);
    console.log(`✅ Found base file: ${baseFileName}`);
    return baseFileName;
  } catch {
    console.log(`Base file not found, trying animations...`);

    // Try animations in priority order
    for (const anim of animationPriority) {
      if (!supportedAnimations?.includes(anim)) continue;

      const animFileName = path.join(
        ASSETS_PATH,
        componentPath,
        anim,
        `${variant}.png`
      );

      try {
        await fs.access(animFileName);
        console.log(`✅ Found animation file: ${animFileName}`);
        return animFileName;
      } catch {
        console.log(`❌ Not found: ${animFileName}`);
        continue;
      }
    }
  }

  console.error(`❌ No valid file found for:
    Component path: ${componentPath}
    Variant: ${variant}
    Attempted base: ${baseFileName}
    Attempted animations in: ${animationPriority.join(", ")}`);
  return null;
}

async function drawLayers(
  ctx: CanvasRenderingContext2D,
  layers: SpriteLayer[]
) {
  for (const [animName, baseYOffset] of Object.entries(BASE_ANIMATIONS)) {
    try {
      const config = ANIMATION_CONFIGS[animName];
      if (!config) {
        console.log(`No config found for animation: ${animName}`);
        continue;
      }

      const animationLayers = await Promise.all(
        layers.map(async (layer) => {
          // Special handling for shadow - only process supported animations
          if (
            layer.parentName === "shadow" &&
            !layer.supportedAnimations?.includes(animName)
          ) {
            return null;
          }

          // Replace the animation folder in the path
          const animPath = layer.fileName?.replace(
            /\/(idle|walk|run|slash|thrust|spellcast|shoot|hurt|jump|climb)\//,
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

function getEffectiveSex(sex: string | undefined): string {
  switch (sex) {
    case "teen":
    case "pregnant":
      return "female";
    case "muscular":
      return "male";
    default:
      return sex || "male";
  }
}
