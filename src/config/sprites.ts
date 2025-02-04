import { SpriteConfig } from "@/types/sprites";

export const SPRITE_CONFIG: SpriteConfig = {
  basePath:
    process.env.NODE_ENV === "production"
      ? "/public/assets"
      : "./public/assets",

  types: ["warrior", "mage", "rogue"],
  animations: Object.keys(BASE_ANIMATIONS),

  sheets: {
    arms: {
      path: "arms.png",
      frameSize: { width: 64, height: 64 },
    },
    bracers: {
      path: "bracers.png",
      frameSize: { width: 64, height: 64 },
    },
  },
};
