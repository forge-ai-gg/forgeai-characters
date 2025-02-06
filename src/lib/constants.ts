import path from "path";
import { AnimationConfig } from "./types";

export const UNIVERSAL_FRAME_SIZE = 64;
export const UNIVERSAL_SHEET_WIDTH = 832;
export const UNIVERSAL_SHEET_HEIGHT = 3456;

export const ASSETS_PATH = path.join(process.cwd(), "public/spritesheets");

export const ANIMATION_CONFIGS: Record<string, AnimationConfig> = {
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
