import { SpriteConfigQueryParams, SpriteLayer } from "@/types/sprites";
import { createCanvas, loadImage } from "canvas";
import { promises as fs } from "fs";
import path from "path";
import { BASE_ANIMATIONS } from "./imageProcessing";
import { sheetDefinitions, type SheetDefinition } from "./sheetDefinitions";

const UNIVERSAL_FRAME_SIZE = 64;
const UNIVERSAL_SHEET_WIDTH = 832;
const UNIVERSAL_SHEET_HEIGHT = 3456;

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
console.error = (...args) => {
  originalError("\x1b[31m", ...args, "\x1b[0m");
};

const definitions = Object.values(sheetDefinitions);

async function getLayersForSprite(
  params: SpriteConfigQueryParams
): Promise<SpriteLayer[]> {
  const layers: SpriteLayer[] = [];
  const assetsPath = path.join(process.cwd(), "public/spritesheets");

  console.log("Processing request:", {
    params,
    assetsPath,
    definitionsCount: definitions.length,
  });

  // Process each component in order of z-index
  const components = Object.entries(params).map(([key, value]) => ({
    type: key,
    path: value,
  }));

  // Helper function to get the base type from a parameter
  // const getBaseType = (param: string) => {
  //   const parts = param.split("_");
  //   return parts[0]?.toLowerCase() || ""; // e.g. "Human" from "Human_male_light"
  // };

  // // Helper function to get the last segment of a parameter
  // const getLastSegment = (param: string) => {
  //   const parts = param.split("_");
  //   return parts[parts.length - 1];
  // };

  // Helper function to parse complex head values
  const parseHeadValue = (value: string) => {
    const parts = value.split("_");
    return {
      race: parts[0]?.toLowerCase() || "", // e.g., "human"
      gender: parts[1]?.toLowerCase() || "", // e.g., "male"
      variant: parts[2] || "", // e.g., "light"
    };
  };

  for (const component of components) {
    if (component.path) {
      let def;

      // Special handling for shadow
      if (component.type === "shadow") {
        if (component.path === "none") {
          continue;
        }
        def = definitions.find((d) => d.type_name === "body");
        const fileName = path.join(
          assetsPath,
          "shadow",
          "adult",
          "walk",
          "shadow.png"
        );

        try {
          await fs.access(fileName);
          layers.push({
            fileName,
            zPos: -1,
            parentName: component.type,
            name: component.type,
            variant: "shadow",
            supportedAnimations: def?.animations || [],
          });
        } catch (error) {
          console.log(`Shadow file not found: ${fileName}`);
        }
        continue;
      }

      // Special handling for body
      if (component.type === "body") {
        if (component.path === "none") {
          continue;
        }
        def = definitions.find((d) => d.type_name === "body");
        if (def) {
          const variant = component.path.split("_").pop() || "";
          const bodyFolder = params.sex;
          const fileName = path.join(
            assetsPath,
            "body/bodies",
            bodyFolder,
            "idle",
            `${variant}.png`
          );

          try {
            await fs.access(fileName);
            layers.push({
              fileName,
              zPos: def.layer_1.zPos,
              parentName: component.type,
              name: component.type,
              variant: component.path,
              supportedAnimations: def.animations || [],
            });
          } catch (error) {
            console.log(`File not found: ${fileName}`, error);
          }
        }
      } else if (component.type === "head") {
        const parsed = parseHeadValue(component.path);
        if (parsed.race === "none") {
          continue;
        }
        def = definitions.find((d) => {
          const defName = d.name.toLowerCase();
          const searchName = `${parsed.race} ${parsed.gender}`;
          return d.type_name === "head" && defName === searchName;
        });

        if (def) {
          const sexKey = params.sex as keyof typeof def.layer_1;
          const basePath = def.layer_1[sexKey];

          if (basePath) {
            // Adjust path for child heads
            let headPath = basePath as string;
            if (params.sex === "child") {
              // Replace 'adult' with 'child' in the path if it exists
              headPath = headPath.replace("/adult/", "/child/");
            }

            const fileName = path.join(
              assetsPath,
              headPath as string,
              "idle",
              `${parsed.variant}.png`
            );

            console.log("Attempting to access head:", {
              sex: params.sex,
              basePath,
              adjustedPath: headPath,
              variant: parsed.variant,
              fileName,
            });

            try {
              await fs.access(fileName);
              layers.push({
                fileName,
                zPos: def.layer_1.zPos,
                parentName: component.type,
                name: component.type,
                variant: component.path,
                supportedAnimations: def?.animations || [],
              });
            } catch (error) {
              console.log(`File not found: ${fileName}`);
            }
          }
        }
      } else {
        // Generic component handling
        if (component.path === "none") {
          continue;
        }
        def = definitions.find((d) => d.type_name === component.type);

        if (def) {
          // Process all possible layers
          for (let i = 1; i <= 8; i++) {
            const layerKey = `layer_${i}` as keyof SheetDefinition;
            const layer = def[layerKey];

            if (layer) {
              const sexKey = params.sex as keyof typeof layer;
              const basePath = layer[sexKey];

              if (basePath) {
                // Special handling for arms to extract variant
                let variant = "";
                let componentPath = basePath;
                if (component.type === "arms") {
                  const parts = component.path.split("_");
                  if (parts[0] === "none") {
                    continue;
                  }
                  const armourType = parts[0].toLowerCase();
                  variant = parts[parts.length - 1];
                  componentPath = path.join(
                    "arms",
                    armourType,
                    "plate",
                    params.sex
                  );
                } else if (
                  component.type === "shoulders" ||
                  component.type === "bauldron" ||
                  component.type === "wrists" ||
                  component.type === "gloves" ||
                  component.type === "clothes"
                ) {
                  // Use the definition file's path structure
                  const parts = component.path.split("_");
                  if (parts[0] === "none") {
                    continue;
                  }

                  if (component.type === "clothes") {
                    const parts = component.path.split("_");
                    variant = parts[parts.length - 1].toLowerCase(); // "blue"

                    // Get base path from definition like "torso/clothes/longsleeve/longsleeve/male/"
                    const sexKey = params.sex as keyof typeof layer;
                    const defPath = layer?.[sexKey];

                    if (!defPath) {
                      console.error(
                        `No path found for ${component.type} ${sexKey}`
                      );
                      continue;
                    }

                    // Remove trailing slash if present
                    componentPath = defPath.replace(/\/$/, "");
                  } else {
                    const itemType = parts[0].toLowerCase(); // "epaulets", "cuffs", etc
                    variant = parts[parts.length - 1].toLowerCase(); // "gray", "brass", etc

                    if (component.type === "bauldron") {
                      componentPath = path.join("bauldron", params.sex);
                    } else if (component.type === "gloves") {
                      componentPath = path.join("gloves", params.sex);
                    } else {
                      componentPath = path.join(
                        component.type,
                        itemType,
                        params.sex
                      );
                    }
                  }
                } else if (component.type === "bracers") {
                  const parts = component.path.split("_");
                  if (parts[0] === "none") {
                    continue;
                  }
                  variant = parts[parts.length - 1].toLowerCase(); // "brass"
                  componentPath = path.join("bracers", params.sex);
                } else {
                  variant = component.path.split("_").pop() || "";
                }

                let fileName = path.join(
                  assetsPath,
                  componentPath,
                  "idle",
                  `${variant}.png`
                );

                try {
                  await fs.access(fileName);
                } catch (error) {
                  // Fallback to walk animation for arms, shoulders, bauldron and wrists
                  if (
                    component.type === "arms" ||
                    component.type === "shoulders" ||
                    component.type === "bauldron" ||
                    component.type === "wrists" ||
                    component.type === "clothes" ||
                    component.type === "bracers" ||
                    component.type === "gloves"
                  ) {
                    fileName = path.join(
                      assetsPath,
                      componentPath,
                      "walk",
                      `${variant}.png`
                    );
                  }
                }

                layers.push({
                  fileName,
                  zPos: layer.zPos,
                  parentName: component.type,
                  name: `${component.type}_${layerKey}`,
                  variant: component.path,
                  supportedAnimations: def?.animations || [],
                });
              }
            }
          }
        }
      }
    }
  }

  return layers.sort((a, b) => a.zPos - b.zPos);
}

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
            !layer.supportedAnimations.includes(animName)
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
