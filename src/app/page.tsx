"use client";

import { AnimationType, SpriteType } from "@/types/sprites";
import Image from "next/image";
import { useState } from "react";

type BodyType = "male" | "female" | "teen" | "child" | "muscular" | "pregnant";

interface SpriteConfigState {
  type: SpriteType;
  color: string;
  animation: AnimationType;
  bodyType: BodyType;
  matchBodyColor: boolean;
}

export default function Home() {
  const [spriteConfig, setSpriteConfig] = useState<SpriteConfigState>({
    type: "warrior",
    color: "light",
    animation: "idle",
    bodyType: "male",
    matchBodyColor: true,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const spriteUrl = `/api/sprite/demo?${new URLSearchParams({
    ...spriteConfig,
    matchBodyColor: spriteConfig.matchBodyColor.toString(),
  })}`;

  const handleAnimationChange = (animation: AnimationType) => {
    setSpriteConfig((prev) => ({ ...prev, animation }));
  };

  const handleBodyTypeChange = (bodyType: BodyType) => {
    setSpriteConfig((prev) => ({ ...prev, bodyType }));
  };

  const handleColorMatch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpriteConfig((prev) => ({
      ...prev,
      matchBodyColor: e.target.checked,
    }));
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Sprite Generator API</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl mb-2">Preview</h2>
            <div className="border p-4 rounded bg-gray-50">
              <Image
                src={spriteUrl}
                alt="Generated Sprite"
                width={64}
                height={64}
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

        <div className="space-y-6">
          <div>
            <h2 className="text-xl mb-2">Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Body Type
                </label>
                <select
                  value={spriteConfig.bodyType}
                  onChange={(e) =>
                    handleBodyTypeChange(e.target.value as BodyType)
                  }
                  className="w-full border rounded p-2"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="teen">Teen</option>
                  <option value="child">Child</option>
                  <option value="muscular">Muscular</option>
                  <option value="pregnant">Pregnant</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Animation
                </label>
                <select
                  value={spriteConfig.animation}
                  onChange={(e) =>
                    handleAnimationChange(e.target.value as AnimationType)
                  }
                  className="w-full border rounded p-2"
                >
                  <option value="idle">Idle</option>
                  <option value="walk">Walk</option>
                  <option value="run">Run</option>
                  <option value="slash">Slash</option>
                  <option value="spellcast">Spellcast</option>
                  <option value="shoot">Shoot</option>
                  <option value="hurt">Hurt</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="match_body-color"
                  checked={spriteConfig.matchBodyColor}
                  onChange={handleColorMatch}
                  className="mr-2"
                />
                <label htmlFor="match_body-color">Match body color</label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Search</label>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sprites..."
                  className="w-full border rounded p-2"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl mb-2">Actions</h2>
            <div className="space-x-2">
              <button
                onClick={() => {
                  setSpriteConfig({
                    type: "warrior",
                    color: "light",
                    animation: "idle",
                    bodyType: "male",
                    matchBodyColor: true,
                  });
                  setSearchQuery("");
                }}
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
      </div>
    </main>
  );
} 