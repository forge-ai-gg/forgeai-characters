import { promises as fs } from "fs";
import path from "path";
import { ASSETS_PATH } from "./constants";

export async function findValidAnimationFile({
  componentPath,
  variant,
  supportedAnimations,
}: {
  componentPath: string;
  variant: string;
  supportedAnimations?: string[];
}): Promise<string | null> {
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
      // if (!supportedAnimations?.includes(anim)) continue;

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
        continue;
      }
    }
  }

  return null;
}
