import type {
  SheetDefinition,
  SheetDefinitions,
} from "@/types/sheetDefinitions";
import fs from "fs/promises";
import path from "path";

function escapeString(str: string): string {
  return str.replace(/'/g, "\\'");
}

function stringifyObject(obj: any, indent = 0): string {
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return `[\n${obj
      .map(
        (item) =>
          " ".repeat(indent + 2) +
          (typeof item === "string"
            ? `'${escapeString(item)}'`
            : stringifyObject(item, indent + 2))
      )
      .join(",\n")}\n${" ".repeat(indent)}]`;
  }

  if (typeof obj === "object" && obj !== null) {
    const entries = Object.entries(obj).filter(([key]) => key !== "credits");
    if (entries.length === 0) return "{}";
    return `{\n${entries
      .map(
        ([key, value]) =>
          " ".repeat(indent + 2) +
          `${key}: ${
            typeof value === "string"
              ? `'${escapeString(value)}'`
              : stringifyObject(value, indent + 2)
          }`
      )
      .join(",\n")}\n${" ".repeat(indent)}}`;
  }

  return String(obj);
}

async function generateDefinitions() {
  const definitionsPath = path.join(process.cwd(), "sheet_definitions");
  const outPath = path.join(process.cwd(), "src/lib/sheetDefinitions.ts");

  const files = await fs.readdir(definitionsPath);
  const definitions: SheetDefinitions = {};

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const content = await fs.readFile(
      path.join(definitionsPath, file),
      "utf-8"
    );
    const def = JSON.parse(content) as SheetDefinition;

    const key = path.basename(file, ".json");
    definitions[key] = def;
  }

  const output = `// Auto-generated from sheet_definitions/*.json
// Do not edit directly

import type { SheetDefinition, SheetDefinitionKey, BodyDefinition } from '@/types/sheetDefinitions'

export const sheetDefinitions: Record<string, SheetDefinition | BodyDefinition> = ${stringifyObject(
    definitions
  )} as const;

export type { SheetDefinition, SheetDefinitionKey };
`;

  await fs.writeFile(outPath, output);
  console.log(`Generated definitions at ${outPath}`);
}

generateDefinitions().catch(console.error);
