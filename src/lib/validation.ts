import { SPRITE_CONFIG } from "@/config/sprites";
import { SpriteGenerationError } from "@/types/api";
import {
  AnimationType,
  GenerateSpriteParams,
  SpriteType,
} from "@/types/sprites";

export function validateSpriteParams(
  params: GenerateSpriteParams
): void | never {
  const { type, animation } = params;

  if (type && !SPRITE_CONFIG.types.includes(type as SpriteType)) {
    throw new SpriteGenerationError(
      `Invalid type. Must be one of: ${SPRITE_CONFIG.types.join(", ")}`
    );
  }

  if (
    animation &&
    !SPRITE_CONFIG.animations.includes(animation as AnimationType)
  ) {
    throw new SpriteGenerationError(
      `Invalid animation. Must be one of: ${SPRITE_CONFIG.animations.join(
        ", "
      )}`
    );
  }
}
