import { SheetDefinition, sheetDefinitions } from "./sheetDefinitions";

interface VariantOption {
  name: string;
  type: string;
  variant: string;
  value: string;
}

interface HierarchyNode {
  [key: string]: VariantOption[];
}

export async function generateOptions() {
  const hierarchy: HierarchyNode = {};

  Object.entries(sheetDefinitions).forEach(([key, def]) => {
    const definition = def as SheetDefinition;
    const type = definition.type_name;

    if (!hierarchy[type]) {
      hierarchy[type] = [];
    }

    if (definition.variants) {
      const options = definition.variants.map((variant) => {
        return {
          value:
            definition.name.replaceAll(" ", "_") +
            "_" +
            variant.replaceAll(" ", "_"),
          type,
          variant,
          name: definition.name,
        };
      });
      hierarchy[type].push(...options);
    }
  });

  // console.log(JSON.stringify(hierarchy, null, 2));
  return hierarchy;
}

if (require.main === module) {
  generateOptions().catch(console.error);
}
