import sharp from "sharp";

const UNIVERSAL_FRAME_SIZE = 64;

export async function removeBlankSpace(buffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(buffer).metadata();
  const { width, height } = metadata;

  // Get alpha channel data
  const { data } = await sharp(buffer)
    .extractChannel("alpha")
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Check if image is completely blank
  const isBlank = !data.some((pixel) => pixel > 0);

  if (isBlank) {
    throw new Error("Image is completely blank");
  }

  return sharp(buffer).trim().toBuffer();
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
      height: config.height,
    })
    .toBuffer();
}

export const BASE_ANIMATIONS = {
  spellcast: 0,
  thrust: 4 * 64,
  walk: 8 * 64,
  slash: 12 * 64,
  shoot: 16 * 64,
  hurt: 20 * 64,
  climb: 21 * 64,
  idle: 22 * 64,
  jump: 26 * 64,
  sit: 30 * 64,
  emote: 34 * 64,
  run: 38 * 64,
  combat_idle: 42 * 64,
  backslash: 46 * 64,
  halfslash: 50 * 64,
} as const;
