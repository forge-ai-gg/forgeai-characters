import { SpriteLayer } from "@/types/sprites";
import { loadImage } from "canvas";
import { ANIMATION_CONFIGS, UNIVERSAL_FRAME_SIZE } from "./constants";
import { BASE_ANIMATIONS } from "./imageProcessing";

export async function drawLayers(
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
