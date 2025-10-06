"use client";

import { CharacterOptions } from "@/components/CharacterOptions";
import { useCharacterState } from "@/lib/hooks/useCharacterState";
import Image from "next/image";
import { useEffect, useState } from "react";

export function CharacterGenerator() {
  const {
    config,
    updateOption,
    updateOptions,
    resetConfig,
    randomizeConfig,
    getSpriteUrl,
    isLoading,
  } = useCharacterState();

  const [options, setOptions] = useState<any>({});
  const [spriteKey, setSpriteKey] = useState(0); // Force image refresh
  const [imageLoading, setImageLoading] = useState(true);

  // Fetch options for randomization
  useEffect(() => {
    async function fetchOptions() {
      try {
        const res = await fetch("/api/options");
        if (res.ok) {
          const data = await res.json();
          setOptions(data);
        }
      } catch (error) {
        console.error("Failed to fetch options:", error);
      }
    }
    fetchOptions();
  }, []);

  // Force sprite refresh when config changes
  useEffect(() => {
    setSpriteKey((prev) => prev + 1);
    setImageLoading(true);
  }, [config]);

  const handleOptionChange = (key: string, value: string | null) => {
    updateOption(key, value);
  };

  const handleToggleOption = (key: string) => {
    const currentValue = config[key as keyof typeof config];

    switch (key) {
      case "shadow":
        updateOption(key, currentValue ? undefined : "Shadow_shadow");
        break;
      case "wounds":
      case "wheelchair":
      case "lizard":
      case "matchBodyColor":
        updateOption(key, !currentValue);
        break;
      default:
        updateOption(key, !currentValue);
    }
  };

  const handleRandomize = () => {
    randomizeConfig(options);
  };

  const handleReset = () => {
    resetConfig();
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(getSpriteUrl());
      // You could add a toast notification here
      alert("URL copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  const spriteUrl = getSpriteUrl();
  const selectedOptionsCount = Object.keys(config).filter(
    (key) => config[key as keyof typeof config]
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                LPC Character Generator
              </h1>
              <p className="text-gray-600 mt-1">
                Create and customize your character sprite
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{selectedOptionsCount} options selected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Controls Panel */}
          <div className="xl:col-span-1 space-y-6">
            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={handleRandomize}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 font-medium flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Randomizing...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
                      </svg>
                      <span>Randomize</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 7H6v6h2V7h2V5H4v2zM8 10a2 2 0 104 0V8a2 2 0 10-4 0v2zm8-6V3H8v1h8zm0 2H8v1h8V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Reset</span>
                </button>

                <button
                  onClick={handleCopyUrl}
                  className="w-full px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                  <span>Copy URL</span>
                </button>
              </div>
            </div>

            {/* Character Options */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Customize Character
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Select options to personalize your sprite
                </p>
              </div>
              <div className="p-6">
                <div className="max-h-[calc(100vh-20rem)] overflow-y-auto scrollbar-thin pr-2">
                  <CharacterOptions
                    config={config}
                    onOptionChange={handleOptionChange}
                    onToggleOption={handleToggleOption}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview and Details Panel */}
          <div className="xl:col-span-3 space-y-8">
            {/* Sprite Preview */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Character Preview
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Live Preview</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="flex justify-center items-center min-h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-200 relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="grid grid-cols-8 gap-4 h-full">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div key={i} className="bg-gray-400 rounded"></div>
                      ))}
                    </div>
                  </div>

                  {spriteUrl ? (
                    <div className="relative z-10 text-center">
                      {imageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Loading sprite...</span>
                          </div>
                        </div>
                      )}
                      <Image
                        key={spriteKey}
                        src={spriteUrl}
                        alt="Generated Character Sprite"
                        width={416} // 832 / 2 for better display
                        height={1728} // 3456 / 2 for better display
                        className="pixelated max-w-full h-auto drop-shadow-lg"
                        unoptimized
                        onLoad={() => setImageLoading(false)}
                        onError={() => {
                          console.error("Failed to load sprite image");
                          setImageLoading(false);
                        }}
                      />
                      <div className="mt-4 p-3 bg-white bg-opacity-90 rounded-lg backdrop-blur-sm">
                        <p className="text-sm font-medium text-gray-700">
                          {selectedOptionsCount} customizations applied
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 relative z-10">
                      <svg
                        className="w-16 h-16 mx-auto mb-4 text-gray-300"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-lg font-medium">
                        Configure your character
                      </p>
                      <p className="text-sm">
                        Select options to see the sprite preview
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* API URL Display */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    API Endpoint
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Direct access to your sprite
                  </p>
                </div>
                <div className="p-6">
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto border">
                    <a
                      href={spriteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-green-300 break-all transition-colors"
                    >
                      {spriteUrl}
                    </a>
                  </div>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleCopyUrl}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                      <span>Copy</span>
                    </button>
                    <a
                      href={spriteUrl}
                      download="character-sprite.png"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium text-center transition-colors flex items-center justify-center space-x-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Configuration Summary */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Configuration Summary
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Current character settings
                  </p>
                </div>
                <div className="p-6">
                  <div className="max-h-96 overflow-y-auto scrollbar-thin">
                    <div className="space-y-3">
                      {Object.entries(config)
                        .filter(
                          ([_, value]) =>
                            value !== undefined &&
                            value !== null &&
                            value !== false &&
                            value !== ""
                        )
                        .map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                          >
                            <span className="text-sm font-medium text-gray-600 capitalize">
                              {key
                                .replace(/([A-Z])/g, " $1")
                                .replace(/_/g, " ")}
                            </span>
                            <span className="text-sm text-gray-900 font-mono bg-white px-2 py-1 rounded border">
                              {typeof value === "boolean"
                                ? value
                                  ? "Yes"
                                  : "No"
                                : value.toString().replace(/_/g, " ")}
                            </span>
                          </div>
                        ))}
                    </div>
                    {selectedOptionsCount === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        <svg
                          className="w-12 h-12 mx-auto mb-4 text-gray-300"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p>No customizations applied</p>
                        <p className="text-xs">
                          Start selecting options to see your configuration
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
