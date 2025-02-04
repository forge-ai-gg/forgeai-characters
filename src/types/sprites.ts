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
  type: SpriteType;
  color?: string;
  animation: AnimationType;
  bodyType: BodyType;
  matchBodyColor: boolean;
  shadow: boolean;
  bodyColor: string;
  special: string | null;
  wounds: boolean;
  prostheses: string | null;
  wheelchair: boolean;
  wings: string | null;
  lizard: boolean;
  weaponCategory: string | null;
  weaponVariant: string | null;
}

export interface SpriteMetadata {
  width: number;
  height: number;
  frameCount: number;
  type: SpriteType;
  animation: AnimationType;
}

export interface SpriteLayer {
  fileName: string;
  zPos: number;
  custom_animation?: string;
  parentName: string;
  name: string;
  variant: string;
  supportedAnimations?: string[];
}

export type BodyType =
  | "male"
  | "female"
  | "teen"
  | "child"
  | "muscular"
  | "pregnant";

export type WeaponCategory = "S staff" | "Crystal" | "Wand" | null;
