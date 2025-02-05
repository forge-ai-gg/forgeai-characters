"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface OptionsAccordionClientProps {
  name: string;
  bodyTypes: string[];
  spriteConfig: any;
  handleOptionChange: (option: string, value: string | null) => void;
  handleToggleOption: (option: string) => void;
}

export function OptionsAccordionClient({
  name,
  bodyTypes,
  spriteConfig,
  handleOptionChange,
}: OptionsAccordionClientProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="main">
        <AccordionTrigger>{name}</AccordionTrigger>
        <AccordionContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="bodyType">
              <AccordionTrigger>Body Type</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col space-y-2">
                  {bodyTypes.map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="sex"
                        value={type}
                        checked={spriteConfig.sex === type}
                        onChange={(e) =>
                          handleOptionChange("sex", e.target.value)
                        }
                        className="radio"
                      />
                      <span className="capitalize">
                        {type.replace(/_/g, " ")}
                      </span>
                    </label>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
