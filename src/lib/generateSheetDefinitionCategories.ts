import { SheetDefinition, sheetDefinitions } from "./sheetDefinitions";

interface CategoryNode {
  [key: string]: {
    name: string;
    items: string[];
    variants: string[];
  };
}

export async function generateCategories() {
  const categories: CategoryNode = {};

  Object.entries(sheetDefinitions).forEach(([key, def]) => {
    const definition = def as SheetDefinition;
    const type = definition.type_name;

    // Skip entries without a type_name
    if (!type) return;

    if (!categories[type]) {
      // Convert type_name to display name (e.g., "body_color" -> "Body Color")
      const displayName = type
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      categories[type] = {
        name: displayName,
        items: [],
        variants: [],
      };
    }

    categories[type].items.push(key.replaceAll(type + "_", ""));

    // Add variance if it exists and isn't already in the array
    if (definition.variants) {
      definition.variants.forEach((v) => {
        if (!categories[type]?.variants.includes(v)) {
          categories[type]?.variants.push(v);
        }
      });
    }
  });

  console.log(JSON.stringify(categories, null, 2));
  return categories;
}

if (require.main === module) {
  generateCategories().catch(console.error);
}
