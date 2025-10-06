"use client";

import { SpriteConfigQueryParams } from "@/types/sprites";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// Default character configuration
const DEFAULT_CONFIG: Partial<SpriteConfigQueryParams> = {
  body: "Body_color_light",
  head: "Human_male_light",
  sex: "male",
  shadow: undefined,
  expression: undefined,
  eyes: undefined,
  ears: undefined,
  nose: undefined,
  eyebrows: undefined,
  wrinkles: undefined,
  beard: undefined,
  mustache: undefined,
  hair: undefined,
  shoulders: undefined,
  arms: undefined,
  bauldron: undefined,
  bracers: undefined,
  gloves: undefined,
  ring: undefined,
  clothes: undefined,
  chainmail: undefined,
  legs: undefined,
  shoes: undefined,
  weapon: undefined,
  shield: undefined,
  animation: undefined,
  bodyColor: "light",
  special: undefined,
  prostheses: undefined,
  wings: undefined,
  wounds: false,
  wheelchair: false,
  lizard: false,
  matchBodyColor: false,
  weaponVariant: undefined,
};

export function useCharacterState() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [config, setConfig] =
    useState<Partial<SpriteConfigQueryParams>>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize state from URL params
  useEffect(() => {
    const initialConfig: Partial<SpriteConfigQueryParams> = {
      ...DEFAULT_CONFIG,
    };

    // Parse URL parameters
    searchParams.forEach((value, key) => {
      if (key in initialConfig) {
        if (
          typeof DEFAULT_CONFIG[key as keyof SpriteConfigQueryParams] ===
          "boolean"
        ) {
          (initialConfig as any)[key] = value === "true" || value === "1";
        } else {
          (initialConfig as any)[key] = value || undefined;
        }
      }
    });

    setConfig(initialConfig);
  }, [searchParams]);

  // Update URL when config changes
  const updateURL = useCallback(
    (newConfig: Partial<SpriteConfigQueryParams>) => {
      const params = new URLSearchParams();

      Object.entries(newConfig).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== false) {
          if (typeof value === "boolean") {
            params.set(key, value ? "true" : "false");
          } else {
            params.set(key, value.toString());
          }
        }
      });

      const url = `/?${params.toString()}`;
      router.push(url, { scroll: false });
    },
    [router]
  );

  // Update a single configuration option
  const updateOption = useCallback(
    (key: keyof SpriteConfigQueryParams, value: any) => {
      const newConfig = { ...config, [key]: value };
      setConfig(newConfig);
      updateURL(newConfig);
    },
    [config, updateURL]
  );

  // Update multiple options at once
  const updateOptions = useCallback(
    (updates: Partial<SpriteConfigQueryParams>) => {
      const newConfig = { ...config, ...updates };
      setConfig(newConfig);
      updateURL(newConfig);
    },
    [config, updateURL]
  );

  // Reset to default configuration
  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    updateURL(DEFAULT_CONFIG);
  }, [updateURL]);

  // Generate sprite URL
  const getSpriteUrl = useCallback(() => {
    const params = new URLSearchParams();

    Object.entries(config).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== false) {
        if (typeof value === "boolean") {
          params.set(key, value ? "true" : "false");
        } else {
          params.set(key, value.toString());
        }
      }
    });

    return `${
      process.env["NEXT_PUBLIC_API_URL"] || ""
    }/api/sprite?${params.toString()}`;
  }, [config]);

  // Randomize configuration
  const randomizeConfig = useCallback(
    (options: any) => {
      setIsLoading(true);
      const newConfig = { ...DEFAULT_CONFIG };

      // Randomize each category if options are available
      Object.entries(options).forEach(
        ([categoryKey, categoryOptions]: [string, any]) => {
          if (Array.isArray(categoryOptions) && categoryOptions.length > 0) {
            const randomOption =
              categoryOptions[
                Math.floor(Math.random() * categoryOptions.length)
              ];
            if (randomOption?.value) {
              newConfig[categoryKey as keyof SpriteConfigQueryParams] =
                randomOption.value;
            }
          }
        }
      );

      // Randomize body type and color
      const bodyTypes = [
        "male",
        "female",
        "teen",
        "child",
        "muscular",
        "pregnant",
      ];
      const bodyColors = [
        "light",
        "dark",
        "dark2",
        "dark3",
        "orc",
        "red_orc",
        "tanned",
        "tanned2",
      ];

      newConfig.sex = bodyTypes[Math.floor(Math.random() * bodyTypes.length)];
      newConfig.bodyColor =
        bodyColors[Math.floor(Math.random() * bodyColors.length)];
      newConfig.body = `Body_color_${newConfig.bodyColor}`;
      newConfig.head = `Human_${newConfig.sex}_${newConfig.bodyColor}`;

      setConfig(newConfig);
      updateURL(newConfig);
      setIsLoading(false);
    },
    [updateURL]
  );

  return {
    config,
    updateOption,
    updateOptions,
    resetConfig,
    randomizeConfig,
    getSpriteUrl,
    isLoading,
  };
}
