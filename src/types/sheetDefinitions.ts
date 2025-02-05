export interface LayerDefinition {
  zPos: number;
  male?: string;
  female?: string;
  muscular?: string;
  teen?: string;
  pregnant?: string;
  child?: string;
  is_mask?: boolean;
  custom_animation?: string;
}

export interface BodyOptions {
  sex?: Array<"male" | "female" | "teen" | "child" | "muscular" | "pregnant">;
  bodyColor?: Array<
    | "light"
    | "dark"
    | "dark2"
    | "dark3"
    | "orc"
    | "red_orc"
    | "tanned"
    | "tanned2"
  >;
  special?: Array<"elf" | "orc" | "skeleton">;
  prostheses?: Array<"left_arm" | "right_arm" | "left_leg" | "right_leg">;
  wings?: Array<"angel" | "demon" | "butterfly" | "bird">;
  shadow?: boolean;
  wounds?: boolean;
  wheelchair?: boolean;
  lizard?: boolean;
  matchBodyColor?: boolean;
}

export interface BodyDefinition {
  name: string;
  options: BodyOptions;
}

export interface SheetDefinition {
  name: string;
  type_name: string;
  preview_row?: number;
  preview_column?: number;
  preview_x_offset?: number;
  preview_y_offset?: number;
  match_body_color?: boolean;
  options?: BodyOptions;
  layer_1: LayerDefinition;
  layer_2?: LayerDefinition;
  layer_3?: LayerDefinition;
  layer_4?: LayerDefinition;
  layer_5?: LayerDefinition;
  layer_6?: LayerDefinition;
  layer_7?: LayerDefinition;
  layer_8?: LayerDefinition;
  variants: string[];
  animations?: string[];
}

export type SheetDefinitions = Record<string, SheetDefinition | BodyDefinition>;
export type SheetDefinitionKey = keyof SheetDefinitions;
