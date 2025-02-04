"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

// example url: https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/#?body=Body_color_light&head=Human_female_elderly_light&sex=male&shadow=Shadow_shadow&expression=Angry_male_light&eyes=Closing_Eyes_purple&ears=Elven_ears_light&nose=Big_nose_light&eyebrows=Thick_Eyebrows_blonde&wrinkes=Wrinkles_light&beard=Basic_Beard_blonde&mustache=Mustache_blonde&hair=Princess_blonde&shoulders=Legion_bronze&arms=Armour_steel&bauldron=Bauldron_brown&bracers=Bracers_steel&gloves=Gloves_brass&ring=Stud_Ring_blue&clothes=Longsleeve_black&chainmail=Chainmail_gray&legs=Armour_steel&shoes=Boots_black&weapon=Smash_axe&shield=Shield_crusader

interface SpriteConfigState {
  body: string;
  head: string;
  sex: "male" | "female" | "teen" | "child" | "muscular" | "pregnant";
  shadow: string;
  expression: string;
  eyes: string;
  ears: string;
  nose: string;
  eyebrows: string;
  wrinkles: string;
  beard: string;
  mustache: string;
  hair: string;
  shoulders: string;
  arms: string;
  bauldron: string;
  bracers: string;
  gloves: string;
  ring: string;
  clothes: string;
  chainmail: string;
  legs: string;
  shoes: string;
  weapon: string | null;
  shield: string;
  animation?: string;
  bodyColor?: string;
  special?: string | null;
  prostheses?: string | null;
  wings?: string | null;
  wounds?: boolean;
  wheelchair?: boolean;
  lizard?: boolean;
  matchBodyColor?: boolean;
  weaponVariant?: string;
}

const DEFAULT_CONFIG: SpriteConfigState = {
  body: "Body_color_light",
  head: "Human_male_light",
  sex: "male" as "male" | "female" | "teen" | "child" | "muscular" | "pregnant",
  shadow: "",
  expression: "",
  eyes: "",
  ears: "",
  nose: "",
  eyebrows: "",
  wrinkles: "",
  beard: "",
  mustache: "",
  hair: "",
  shoulders: "",
  arms: "",
  bauldron: "",
  bracers: "",
  gloves: "",
  ring: "",
  clothes: "",
  chainmail: "",
  legs: "",
  shoes: "",
  weapon: null,
  shield: "",
};

// Helper function to parse different types of complex values
const parseComplexValue = (
  value: string | null
): {
  part: string;
  variant?: string;
  color?: string;
  style?: string;
} => {
  if (!value) return { part: "" };
  const parts = value.split("_");

  // Handle head format (e.g. Human_male_light or Human_teen_light)
  if (
    [
      "Human",
      "Alien",
      "Lizard",
      "Goblin",
      "Minotaur",
      "Frankenstein",
      "Vampire",
    ].includes(parts[0])
  ) {
    return {
      part: parts[0],
      variant: parts[1], // Can be male/female/teen/child/etc
      color: parts[2],
    };
  }

  // Handle different formats based on type
  if (value.startsWith("Body_color_")) {
    return {
      part: "Body",
      variant: "color",
      color: parts[2],
    };
  }

  // Handle material-based items (arms, armor, etc)
  if (
    [
      "steel",
      "iron",
      "ceramic",
      "brass",
      "copper",
      "bronze",
      "silver",
      "gold",
    ].includes(parts[parts.length - 1])
  ) {
    return {
      part: parts[0],
      variant: parts[parts.length - 1],
    };
  }

  // Handle style-based items (backpacks, etc)
  if (
    ["round", "square", "3_logs", "9_logs"].includes(parts[parts.length - 1])
  ) {
    return {
      part: parts[0],
      style: parts[parts.length - 1],
    };
  }

  // Default case for simple values
  return {
    part: parts[0],
    variant: parts[1],
    color: parts[2],
  };
};

// Helper function to combine values based on type
const combineComplexValue = (
  part: string,
  variant?: string,
  color?: string,
  style?: string
): string => {
  if (part === "Body") {
    return `Body_color_${color || "light"}`;
  }

  if (
    [
      "Human",
      "Alien",
      "Lizard",
      "Goblin",
      "Minotaur",
      "Frankenstein",
      "Vampire",
    ].includes(part)
  ) {
    // For heads, variant can be any valid body type
    return [part, variant || "male", color || "light"].join("_");
  }

  // Handle material-based items
  if (
    variant &&
    [
      "steel",
      "iron",
      "ceramic",
      "brass",
      "copper",
      "bronze",
      "silver",
      "gold",
    ].includes(variant)
  ) {
    return [part, variant].join("_");
  }

  // Handle style-based items
  if (style) {
    return [part, style].join("_");
  }

  // Default case
  return [part, variant, color].filter(Boolean).join("_");
};

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateQueryParams = useCallback(
    (updates: Partial<SpriteConfigState>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  // Get current values from URL instead of state
  const spriteConfig = {
    body: searchParams.get("body") || DEFAULT_CONFIG.body,
    head: searchParams.get("head") || DEFAULT_CONFIG.head,
    sex: searchParams.get("sex") || DEFAULT_CONFIG.sex,
    shadow: searchParams.get("shadow") || "",
    expression: searchParams.get("expression") || "",
    eyes: searchParams.get("eyes") || "",
    ears: searchParams.get("ears") || "",
    nose: searchParams.get("nose") || "",
    eyebrows: searchParams.get("eyebrows") || "",
    wrinkles: searchParams.get("wrinkles") || "",
    beard: searchParams.get("beard") || "",
    mustache: searchParams.get("mustache") || "",
    hair: searchParams.get("hair") || "",
    shoulders: searchParams.get("shoulders") || "",
    arms: searchParams.get("arms") || "",
    bauldron: searchParams.get("bauldron") || "",
    bracers: searchParams.get("bracers") || "",
    gloves: searchParams.get("gloves") || "",
    ring: searchParams.get("ring") || "",
    clothes: searchParams.get("clothes") || "",
    chainmail: searchParams.get("chainmail") || "",
    legs: searchParams.get("legs") || "",
    shoes: searchParams.get("shoes") || "",
    weapon: searchParams.get("weapon") || null,
    shield: searchParams.get("shield") || "",
    wounds: searchParams.get("wounds") === "true",
    wheelchair: searchParams.get("wheelchair") === "true",
    lizard: searchParams.get("lizard") === "true",
    matchBodyColor: searchParams.get("matchBodyColor") === "true",
    weaponVariant: searchParams.get("weaponVariant") || "",
  };

  // Update handlers to use URL params
  const handleAnimationChange = (animation: string) => {
    // Remove if animation is no longer needed
  };

  const handleBodyTypeChange = (
    bodyType: "male" | "female" | "teen" | "child" | "muscular" | "pregnant"
  ) => {
    const current = parseComplexValue(spriteConfig.head);
    const headRace = current.part || "Human";

    // Map body type to appropriate head variant
    let headVariant = bodyType;
    if (bodyType === "teen" || bodyType === "child") {
      // Some heads have specific teen/child variants
      headVariant = bodyType;
    } else if (["male", "female"].includes(bodyType)) {
      // For gendered body types, use the gender
      headVariant = bodyType;
    }

    updateQueryParams({
      sex: bodyType,
      head: combineComplexValue(
        headRace,
        headVariant,
        current.color || "light"
      ),
    });
  };

  const handleColorMatch = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove if no longer needed
  };

  const handleWeaponCategoryChange = (weapon: string | null) => {
    updateQueryParams({ weapon: weapon || "" });
  };

  const handleWeaponVariantChange = (variant: string) => {
    updateQueryParams({ weaponVariant: variant });
  };

  const handleBodyColorChange = (color: string) => {
    // Update body color
    updateQueryParams({
      body: combineComplexValue("Body", "color", color),
      // Also update head color to match if it exists
      ...(spriteConfig.head && {
        head: combineComplexValue(
          "Human",
          searchParams.get("sex") || "male",
          color
        ),
      }),
    });
  };

  const handleToggleOption = (option: keyof SpriteConfigState) => {
    const currentValue = searchParams.get(option);
    updateQueryParams({
      [option]: currentValue === "true" ? "false" : "true",
    });
  };

  const handleOptionChange = (option: string, value: string | null) => {
    if (
      ["head", "eyes", "eyebrows", "beard", "mustache", "hair"].includes(option)
    ) {
      // These options expect color variants
      const current = parseComplexValue(spriteConfig[option]);
      if (value === null) {
        updateQueryParams({ [option]: "" });
      } else {
        updateQueryParams({
          [option]: combineComplexValue(value, current.variant, current.color),
        });
      }
    } else if (["arms", "bracers", "gloves", "ring"].includes(option)) {
      // These options expect material variants
      const current = parseComplexValue(spriteConfig[option]);
      updateQueryParams({
        [option]: combineComplexValue(value || "", current.variant),
      });
    } else {
      // Handle simple values normally
      updateQueryParams({ [option]: value });
    }
  };

  const handleReset = () => {
    const params = new URLSearchParams();
    Object.entries(DEFAULT_CONFIG).forEach(([key, value]) => {
      if (value !== null) {
        params.set(key, value);
      }
    });
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Update sprite URL to use current params directly
  const spriteUrl = useMemo(() => {
    const params = new URLSearchParams();

    // Get current params
    const currentParams = new URLSearchParams(searchParams.toString());

    // Only add non-empty current params first
    for (const [key, value] of currentParams.entries()) {
      if (value && value !== "") {
        params.set(key, value);
      }
    }

    // Then ensure required params have defaults if not set
    if (!params.has("body")) params.set("body", DEFAULT_CONFIG.body);
    if (!params.has("head")) params.set("head", DEFAULT_CONFIG.head);
    if (!params.has("sex")) params.set("sex", DEFAULT_CONFIG.sex);

    return `/api/sprite?${params.toString()}`;
  }, [searchParams]);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Sprite Generator API</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl mb-2">Configuration</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="body">
                <AccordionTrigger>Body Options</AccordionTrigger>
                <AccordionContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="bodyType">
                      <AccordionTrigger>Body Type</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col space-y-2">
                          {[
                            "male",
                            "female",
                            "teen",
                            "child",
                            "muscular",
                            "pregnant",
                          ].map((type) => (
                            <label
                              key={type}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="radio"
                                name="bodyType"
                                value={type}
                                checked={spriteConfig.sex === type}
                                onChange={(e) =>
                                  handleBodyTypeChange(
                                    e.target.value as
                                      | "male"
                                      | "female"
                                      | "teen"
                                      | "child"
                                      | "muscular"
                                      | "pregnant"
                                  )
                                }
                                className="radio"
                              />
                              <span className="capitalize">{type}</span>
                            </label>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="bodyColor">
                      <AccordionTrigger>Body Color</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col space-y-2">
                          {[
                            "light",
                            "dark",
                            "dark2",
                            "dark3",
                            "orc",
                            "red_orc",
                            "tanned",
                            "tanned2",
                          ].map((color) => (
                            <label
                              key={color}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="radio"
                                name="bodyColor"
                                value={color}
                                checked={spriteConfig.bodyColor === color}
                                onChange={(e) =>
                                  handleBodyColorChange(e.target.value)
                                }
                                className="radio"
                              />
                              <span className="capitalize">
                                {color.replace("_", " ")}
                              </span>
                            </label>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="special">
                      <AccordionTrigger>Special</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col space-y-2">
                          {["none", "elf", "orc", "skeleton"].map((special) => (
                            <label
                              key={special}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="radio"
                                name="special"
                                value={special}
                                checked={
                                  spriteConfig.special ===
                                  (special === "none" ? null : special)
                                }
                                onChange={(e) =>
                                  handleOptionChange(
                                    "special",
                                    e.target.value === "none"
                                      ? null
                                      : e.target.value
                                  )
                                }
                                className="radio"
                              />
                              <span className="capitalize">{special}</span>
                            </label>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="prostheses">
                      <AccordionTrigger>Prostheses</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col space-y-2">
                          {[
                            "none",
                            "left_arm",
                            "right_arm",
                            "left_leg",
                            "right_leg",
                          ].map((prosthesis) => (
                            <label
                              key={prosthesis}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="radio"
                                name="prostheses"
                                value={prosthesis}
                                checked={
                                  spriteConfig.prostheses ===
                                  (prosthesis === "none" ? null : prosthesis)
                                }
                                onChange={(e) =>
                                  handleOptionChange(
                                    "prostheses",
                                    e.target.value === "none"
                                      ? null
                                      : e.target.value
                                  )
                                }
                                className="radio"
                              />
                              <span className="capitalize">
                                {prosthesis.replace("_", " ")}
                              </span>
                            </label>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="wings">
                      <AccordionTrigger>Wings</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col space-y-2">
                          {["none", "angel", "demon", "butterfly", "bird"].map(
                            (wing) => (
                              <label
                                key={wing}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="radio"
                                  name="wings"
                                  value={wing}
                                  checked={
                                    spriteConfig.wings ===
                                    (wing === "none" ? null : wing)
                                  }
                                  onChange={(e) =>
                                    handleOptionChange(
                                      "wings",
                                      e.target.value === "none"
                                        ? null
                                        : e.target.value
                                    )
                                  }
                                  className="radio"
                                />
                                <span className="capitalize">{wing}</span>
                              </label>
                            )
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="toggles">
                      <AccordionTrigger>Other Options</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col space-y-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="shadow"
                              checked={spriteConfig.shadow}
                              onChange={() => handleToggleOption("shadow")}
                              className="radio"
                            />
                            <span>Shadow</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="wounds"
                              checked={spriteConfig.wounds}
                              onChange={() => handleToggleOption("wounds")}
                              className="radio"
                            />
                            <span>Wounds</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="wheelchair"
                              checked={spriteConfig.wheelchair}
                              onChange={() => handleToggleOption("wheelchair")}
                              className="radio"
                            />
                            <span>Wheelchair</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="lizard"
                              checked={spriteConfig.lizard}
                              onChange={() => handleToggleOption("lizard")}
                              className="radio"
                            />
                            <span>Lizard</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="matchBodyColor"
                              checked={spriteConfig.matchBodyColor}
                              onChange={handleColorMatch}
                              className="radio"
                            />
                            <span>Match body color</span>
                          </label>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="animation">
                <AccordionTrigger>Animation</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "idle",
                      "walk",
                      "run",
                      "slash",
                      "spellcast",
                      "shoot",
                      "hurt",
                    ].map((anim) => (
                      <label key={anim} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="animation"
                          value={anim}
                          checked={spriteConfig.animation === anim}
                          onChange={(e) =>
                            handleAnimationChange(e.target.value)
                          }
                          className="radio"
                        />
                        <span className="capitalize">{anim}</span>
                      </label>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="search">
                <AccordionTrigger>Search</AccordionTrigger>
                <AccordionContent>
                  <input
                    type="search"
                    value={searchParams.get("search") || ""}
                    onChange={(e) =>
                      handleOptionChange("search", e.target.value)
                    }
                    placeholder="Search sprites..."
                    className="w-full border rounded p-2"
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="weapons">
                <AccordionTrigger>Weapons</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Weapon Type</label>
                      <div className="grid grid-cols-1 gap-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="weaponCategory"
                            checked={spriteConfig.weapon === null}
                            onChange={() => handleWeaponCategoryChange(null)}
                            className="radio"
                          />
                          <span>No weapon</span>
                        </label>

                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="weaponCategory"
                            checked={spriteConfig.weapon === "S staff"}
                            onChange={() =>
                              handleWeaponCategoryChange("S staff")
                            }
                            className="radio"
                          />
                          <span>S staff</span>
                        </label>

                        {spriteConfig.weapon === "S staff" && (
                          <div className="ml-6 grid grid-cols-2 gap-2">
                            {[
                              "medium",
                              "light",
                              "red",
                              "dark",
                              "brass",
                              "bronze",
                              "ceramic",
                              "copper",
                              "gold",
                              "iron",
                              "silver",
                              "steel",
                            ].map((variant) => (
                              <label
                                key={variant}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="radio"
                                  name="weaponVariant"
                                  value={variant}
                                  checked={
                                    spriteConfig.weaponVariant === variant
                                  }
                                  onChange={(e) =>
                                    handleWeaponVariantChange(e.target.value)
                                  }
                                  className="radio"
                                />
                                <span className="capitalize">{variant}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="weaponCategory"
                            checked={spriteConfig.weapon === "Crystal"}
                            onChange={() =>
                              handleWeaponCategoryChange("Crystal")
                            }
                            className="radio"
                          />
                          <span>Crystal</span>
                        </label>

                        {spriteConfig.weapon === "Crystal" && (
                          <div className="ml-6 grid grid-cols-2 gap-2">
                            {[
                              "blue",
                              "orange",
                              "green",
                              "purple",
                              "red",
                              "yellow",
                            ].map((variant) => (
                              <label
                                key={variant}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="radio"
                                  name="weaponVariant"
                                  value={variant}
                                  checked={
                                    spriteConfig.weaponVariant === variant
                                  }
                                  onChange={(e) =>
                                    handleWeaponVariantChange(e.target.value)
                                  }
                                  className="radio"
                                />
                                <span className="capitalize">{variant}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="weaponCategory"
                            checked={spriteConfig.weapon === "Wand"}
                            onChange={() => handleWeaponCategoryChange("Wand")}
                            className="radio"
                          />
                          <span>Wand</span>
                        </label>

                        {spriteConfig.weapon === "Wand" && (
                          <div className="ml-6">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="weaponVariant"
                                value="wand"
                                checked={spriteConfig.weaponVariant === "wand"}
                                onChange={(e) =>
                                  handleWeaponVariantChange(e.target.value)
                                }
                                className="radio"
                              />
                              <span>Wand</span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div>
            <h2 className="text-xl mb-2">Actions</h2>
            <div className="space-x-2">
              <button
                onClick={handleReset}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  // Download sprite
                  window.open(spriteUrl, "_blank");
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Download PNG
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl mb-2">Preview</h2>
            <div className="border p-4 rounded bg-gray-50">
              <Image
                src={spriteUrl}
                alt="Generated Sprite"
                width={1664}
                height={6912}
                className="pixelated"
                unoptimized
              />
            </div>
          </div>

          <div>
            <h2 className="text-xl mb-2">API URL</h2>
            <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto">
              {`GET ${spriteUrl}`}
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}
