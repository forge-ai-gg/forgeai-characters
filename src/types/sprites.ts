export type SpriteType = "warrior" | "mage" | "rogue";
export type AnimationType = keyof typeof BASE_ANIMATIONS;

export interface FrameSize {
  width: number;
  height: number;
}

export interface SheetConfig {
  path: string;
  frameSize: FrameSize;
  frames?: number;
  frameRate?: number;
}

export interface SpriteConfig {
  basePath: string;
  types: SpriteType[];
  animations: AnimationType[];
  sheets: {
    [key: string]: SheetConfig;
  };
}

export interface GenerateSpriteParams {
  id: string;
  type?: SpriteType;
  color?: string;
  animation?: AnimationType;
}

export interface SpriteMetadata {
  width: number;
  height: number;
  frameCount: number;
  type: SpriteType;
  animation: AnimationType;
}
