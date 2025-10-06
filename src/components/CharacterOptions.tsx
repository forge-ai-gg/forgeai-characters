"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useState } from "react";

interface VariantOption {
  name: string;
  type: string;
  variant: string;
  value: string;
}

interface CategoryOptions {
  [key: string]: VariantOption[];
}

interface CharacterOption {
  id: string;
  label: string;
  value: string;
  color?: string;
}

interface CategorySelectorProps {
  categoryKey: string;
  categoryName: string;
  options: VariantOption[];
  selectedValue?: string;
  onOptionChange: (key: string, value: string | null) => void;
  allowNone?: boolean;
}

function CategorySelector({
  categoryKey,
  categoryName,
  options,
  selectedValue,
  onOptionChange,
  allowNone = true,
}: CategorySelectorProps) {
  // Group options by name and collect variants
  const groupedOptions = options.reduce((acc, option) => {
    if (!acc[option.name]) {
      acc[option.name] = {
        name: option.name,
        variants: [],
      };
    }
    acc[option.name].variants.push({
      variant: option.variant,
      value: option.value,
    });
    return acc;
  }, {} as any);

  const getColorPreview = (variant: string) => {
    const colorMap: { [key: string]: string } = {
      red: "#ef4444",
      blue: "#3b82f6",
      green: "#10b981",
      black: "#1f2937",
      white: "#f9fafb",
      brown: "#92400e",
      gray: "#6b7280",
      grey: "#6b7280",
      yellow: "#f59e0b",
      purple: "#8b5cf6",
      pink: "#ec4899",
      orange: "#f97316",
      blonde: "#fbbf24",
      dark: "#374151",
      light: "#f3f4f6",
    };

    const lowerVariant = variant.toLowerCase();
    return colorMap[lowerVariant];
  };

  return (
    <AccordionItem value={categoryKey} className="border-none">
      <AccordionTrigger className="text-left hover:no-underline hover:bg-gray-50 px-4 py-3 rounded-lg transition-colors">
        <div className="flex items-center justify-between w-full">
          <span className="font-medium text-gray-900">{categoryName}</span>
          {selectedValue && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {selectedValue.replace(/_/g, " ")}
              </span>
            </div>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4">
          {allowNone && (
            <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name={categoryKey}
                value=""
                checked={!selectedValue}
                onChange={() => onOptionChange(categoryKey, null)}
                className="radio"
              />
              <span className="text-sm font-medium text-gray-600">None</span>
            </label>
          )}

          {Object.entries(groupedOptions).map(
            ([name, group]: [string, any]) => (
              <div key={name} className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-1">
                  {name}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                  {group.variants.map((variant: any) => {
                    const colorPreview = getColorPreview(variant.variant);
                    return (
                      <label
                        key={variant.value}
                        className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-blue-50 transition-colors group"
                      >
                        <input
                          type="radio"
                          name={categoryKey}
                          value={variant.value}
                          checked={selectedValue === variant.value}
                          onChange={(e) =>
                            onOptionChange(categoryKey, e.target.value)
                          }
                          className="radio group-hover:border-blue-400"
                        />
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <span className="text-sm text-gray-700 capitalize truncate">
                            {variant.variant.replace(/_/g, " ")}
                          </span>
                          {colorPreview && (
                            <div
                              className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                              style={{
                                backgroundColor: colorPreview,
                              }}
                            />
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

interface CharacterOptionsProps {
  config: any;
  onOptionChange: (key: string, value: string | null) => void;
  onToggleOption: (key: string) => void;
}

export function CharacterOptions({
  config,
  onOptionChange,
  onToggleOption,
}: CharacterOptionsProps) {
  const [options, setOptions] = useState<CategoryOptions>({});
  const [categories, setCategories] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [optionsRes, categoriesRes] = await Promise.all([
          fetch("/api/options"),
          fetch("/api/categories"),
        ]);

        if (optionsRes.ok && categoriesRes.ok) {
          const optionsData = await optionsRes.json();
          const categoriesData = await categoriesRes.json();

          setOptions(optionsData);
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error("Failed to fetch options:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading options...</span>
        </div>
      </div>
    );
  }

  // Body type options (handled separately)
  const bodyTypes = ["male", "female", "teen", "child", "muscular", "pregnant"];
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

  // Filter categories based on search term
  const filteredCategories = Object.entries(options).filter(
    ([categoryKey, categoryOptions]) => {
      if (!searchTerm) return true;
      const categoryInfo = categories[categoryKey];
      const categoryName =
        categoryInfo?.name ||
        categoryKey
          .replace("_", " ")
          .replace(/\b\w/g, (l: string) => l.toUpperCase());

      return (
        categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categoryOptions.some(
          (option: VariantOption) =>
            option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            option.variant.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      {Object.keys(options).length > 0 && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search categories and options..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      <Accordion type="multiple" className="w-full space-y-2">
        {/* Body Configuration */}
        <AccordionItem
          value="body"
          className="border border-gray-200 rounded-xl bg-blue-50"
        >
          <AccordionTrigger className="hover:no-underline px-6 py-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="font-semibold text-gray-900">
                Body Configuration
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Body Type</span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {bodyTypes.map((type) => (
                    <label
                      key={type}
                      className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                    >
                      <input
                        type="radio"
                        name="bodyType"
                        value={type}
                        checked={config.sex === type}
                        onChange={(e) => {
                          const newSex = e.target.value;
                          onOptionChange("sex", newSex);
                          // Update body and head to match new sex and current body color
                          const bodyColor = config.bodyColor || "light";
                          onOptionChange("body", `Body_color_${bodyColor}`);
                          onOptionChange(
                            "head",
                            `Human_${newSex}_${bodyColor}`
                          );
                        }}
                        className="radio group-hover:border-blue-400"
                      />
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a2 2 0 00-2 2v11a2 2 0 001.85 1.995L4 17h2l.15-.005A2 2 0 008 15V4a2 2 0 00-2-2H4zm8 0a2 2 0 00-2 2v11a2 2 0 001.85 1.995L12 17h2l.15-.005A2 2 0 0016 15V4a2 2 0 00-2-2h-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Skin Color</span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {bodyColors.map((color) => (
                    <label
                      key={color}
                      className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                    >
                      <input
                        type="radio"
                        name="bodyColor"
                        value={color}
                        checked={config.bodyColor === color}
                        onChange={(e) => {
                          const newColor = e.target.value;
                          onOptionChange("bodyColor", newColor);
                          // Update body and head to match new color and current sex
                          const sex = config.sex || "male";
                          onOptionChange("body", `Body_color_${newColor}`);
                          onOptionChange("head", `Human_${sex}_${newColor}`);
                        }}
                        className="radio group-hover:border-blue-400"
                      />
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {color.replace("_", " ")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Special Options */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Special Effects</span>
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { key: "shadow", label: "Shadow", icon: "⚫" },
                    { key: "wounds", label: "Battle Wounds", icon: "🩸" },
                    { key: "wheelchair", label: "Wheelchair", icon: "♿" },
                    { key: "lizard", label: "Lizard Features", icon: "🦎" },
                    {
                      key: "matchBodyColor",
                      label: "Match Body Color",
                      icon: "🎨",
                    },
                  ].map((option) => (
                    <label
                      key={option.key}
                      className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                    >
                      <input
                        type="checkbox"
                        checked={!!config[option.key]}
                        onChange={() => onToggleOption(option.key)}
                        className="checkbox group-hover:border-blue-400"
                      />
                      <span className="text-lg">{option.icon}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Dynamic Categories */}
        {filteredCategories.map(([categoryKey, categoryOptions]) => {
          if (!categoryOptions || categoryOptions.length === 0) return null;

          const categoryInfo = categories[categoryKey];
          const categoryName =
            categoryInfo?.name ||
            categoryKey
              .replace("_", " ")
              .replace(/\b\w/g, (l: string) => l.toUpperCase());

          return (
            <CategorySelector
              key={categoryKey}
              categoryKey={categoryKey}
              categoryName={categoryName}
              options={categoryOptions}
              selectedValue={config[categoryKey]}
              onOptionChange={onOptionChange}
              allowNone={true}
            />
          );
        })}
      </Accordion>

      {searchTerm && filteredCategories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
          <p>No categories found for "{searchTerm}"</p>
          <p className="text-xs mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
