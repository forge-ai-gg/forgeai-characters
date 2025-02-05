"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface BodyOptionsProps {
  spriteConfig: {
    sex: string;
    bodyColor?: string;
    special?: string | null;
    prostheses?: string | null;
    wings?: string | null;
    shadow?: string;
    wounds?: boolean;
    wheelchair?: boolean;
    lizard?: boolean;
    matchBodyColor?: boolean;
  };
  handleBodyTypeChange: (
    type: "male" | "female" | "teen" | "child" | "muscular" | "pregnant"
  ) => void;
  handleBodyColorChange: (color: string) => void;
  handleOptionChange: (option: string, value: string | null) => void;
  handleToggleOption: (option: string) => void;
  handleColorMatch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function BodyOptions({
  spriteConfig,
  handleBodyTypeChange,
  handleBodyColorChange,
  handleOptionChange,
  handleToggleOption,
  handleColorMatch,
}: BodyOptionsProps) {
  return (
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
                    <label key={type} className="flex items-center space-x-2">
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
                    <label key={color} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="bodyColor"
                        value={color}
                        checked={spriteConfig.bodyColor === color}
                        onChange={(e) => handleBodyColorChange(e.target.value)}
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
                            e.target.value === "none" ? null : e.target.value
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
                            e.target.value === "none" ? null : e.target.value
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
                      <label key={wing} className="flex items-center space-x-2">
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
                              e.target.value === "none" ? null : e.target.value
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
                      checked={spriteConfig.shadow === "Shadow"}
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
    </Accordion>
  );
}
