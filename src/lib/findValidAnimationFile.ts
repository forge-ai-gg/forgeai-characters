import { ASSETS_BASE_URL } from "./constants.server";

// Helper function to check if a URL exists
async function urlExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Helper function to build asset URL
function buildAssetUrl(...pathSegments: string[]): string {
  const cleanSegments = pathSegments
    .filter(Boolean)
    .map((segment) => segment.replace(/^\/+|\/+$/g, "")); // Remove leading/trailing slashes
  return `${ASSETS_BASE_URL}/${cleanSegments.join("/")}`;
}

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
  const baseFileUrl = buildAssetUrl(componentPath, `${variant}.png`);
  const animationPriority = ["walk", "idle", "combat_idle", "run"];

  if (await urlExists(baseFileUrl)) {
    console.log(`✅ Found base file: ${baseFileUrl}`);
    return baseFileUrl;
  } else {
    console.log(`Base file not found, trying animations...`);

    // Try animations in priority order
    for (const anim of animationPriority) {
      // if (!supportedAnimations?.includes(anim)) continue;

      const animFileUrl = buildAssetUrl(componentPath, anim, `${variant}.png`);

      if (await urlExists(animFileUrl)) {
        console.log(`✅ Found animation file: ${animFileUrl}`);
        return animFileUrl;
      } else {
        console.log(`Animation file not found: ${animFileUrl}`);
      }
    }
  }

  return null;
}
