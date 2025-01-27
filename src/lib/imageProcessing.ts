import sharp from "sharp";

const UNIVERSAL_FRAME_SIZE = 64;

export async function removeBlankSpace(buffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(buffer).metadata();
  const { width, height } = metadata;

  // Get alpha channel data
  const { data } = await sharp(buffer)
    .extractChannel('alpha')
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Check if image is completely blank
  const isBlank = !data.some(pixel => pixel > 0);
  
  if (isBlank) {
    throw new Error("Image is completely blank");
  }

  return sharp(buffer)
    .trim()
    .toBuffer();
}

interface SliceConfig {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

export async function sliceSprite(
  buffer: Buffer, 
  config: SliceConfig
): Promise<Buffer> {
  return sharp(buffer)
    .extract({
      left: config.offsetX,
      top: config.offsetY,
      width: config.width,
      height: config.height
    })
    .toBuffer();
}

export const BASE_ANIMATIONS = {
  spellcast: 0,
  thrust: 4 * UNIVERSAL_FRAME_SIZE,
  walk: 8 * UNIVERSAL_FRAME_SIZE,
  slash: 12 * UNIVERSAL_FRAME_SIZE,
  shoot: 16 * UNIVERSAL_FRAME_SIZE,
  hurt: 20 * UNIVERSAL_FRAME_SIZE,
  climb: 21 * UNIVERSAL_FRAME_SIZE,
  idle: 22 * UNIVERSAL_FRAME_SIZE,
  jump: 26 * UNIVERSAL_FRAME_SIZE,
  sit: 30 * UNIVERSAL_FRAME_SIZE,
  emote: 34 * UNIVERSAL_FRAME_SIZE,
  run: 38 * UNIVERSAL_FRAME_SIZE,
  combat_idle: 42 * UNIVERSAL_FRAME_SIZE,
  backslash: 46 * UNIVERSAL_FRAME_SIZE,
  halfslash: 50 * UNIVERSAL_FRAME_SIZE,
} as const; 