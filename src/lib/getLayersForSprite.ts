import { LayerDefinition } from "@/types/sheetDefinitions";
import { SpriteConfigQueryParams, SpriteLayer } from "@/types/sprites";
import { findValidAnimationFile } from "./findValidAnimationFile";
import { SheetDefinition, sheetDefinitions } from "./sheetDefinitions";
import { logSuccess } from "./utils";

export async function getLayersForSprite(
  // params here is the query params from the url
  params: SpriteConfigQueryParams
): Promise<SpriteLayer[]> {
  const layers: SpriteLayer[] = [];

  // Special handling for body options
  // if (params.body) {
  //   console.log(`\nProcessing body: ${params.body}`);
  //   const bodyDef = sheetDefinitions["body"] as BodyDefinition;
  //   if (bodyDef?.options) {
  //     const sex = getEffectiveSex(params.sex);
  //     const { subtype, color } = parseVariant(params.body);
  //     console.log(`Parsed body variant - subtype: ${subtype}, color: ${color}`);

  //     // Handle special body types (skeleton, zombie, etc)
  //     if (params.special) {
  //       const specialDef = sheetDefinitions[
  //         `body_${params.special}`
  //       ] as SheetDefinition;
  //       if (specialDef) {
  //         const layer = specialDef.layer_1 as LayerDefinition;
  //         const sexPath = layer[sex as keyof LayerDefinition] as
  //           | string
  //           | undefined;

  //         if (sexPath) {
  //           layers.push({
  //             fileName: path.join(
  //               ASSETS_PATH,
  //               sexPath,
  //               `${params.special}.png`
  //             ),
  //             zPos: layer.zPos,
  //             parentName: "body",
  //             name: "body_special",
  //             variant: params.special,
  //             supportedAnimations:
  //               specialDef.animations || Object.keys(ANIMATION_CONFIGS),
  //           });
  //           return layers; // Special bodies replace normal body
  //         }
  //       }
  //     }

  //     // Standard body handling
  //     try {
  //       let bodyPath = "body/bodies";
  //       switch (params.sex) {
  //         case "pregnant":
  //           bodyPath = "body/bodies/pregnant";
  //           break;
  //         case "muscular":
  //           bodyPath = "body/bodies/muscular";
  //           break;
  //         case "teen":
  //           bodyPath = "body/bodies/teen";
  //           break;
  //         default:
  //           bodyPath = `body/bodies/${sex}`;
  //       }
  //       console.log(`Resolved body path: ${bodyPath}`);

  //       const fullVariant = subtype ? `${subtype}_${color}` : color;
  //       console.log(
  //         `Attempting to find body file with variant: ${fullVariant}`
  //       );

  //       const fileName = await findValidAnimationFile(
  //         bodyPath,
  //         fullVariant,
  //         Object.keys(ANIMATION_CONFIGS)
  //       );

  //       if (fileName) {
  //         console.log(`Found body file: ${fileName}`);
  //         layers.push({
  //           fileName,
  //           zPos: 10,
  //           parentName: "body",
  //           name: "body_base",
  //           variant: fullVariant,
  //           supportedAnimations: Object.keys(ANIMATION_CONFIGS),
  //         });
  //       } else {
  //         console.error(`❌ Body file not found:
  //           Sex: ${sex}
  //           Variant: ${fullVariant}
  //           Attempted path: ${path.join(ASSETS_PATH, bodyPath, fullVariant)}.png
  //           Also tried animations: ${[
  //             "walk",
  //             "idle",
  //             "combat_idle",
  //             "run",
  //           ].join(", ")}`);
  //       }
  //     } catch (error) {
  //       console.error(`❌ Body processing error:
  //         Sex: ${sex}
  //         Body param: ${params.body}
  //         Error: ${error}`);
  //     }
  //   }
  // }

  console.log({ params });

  // Process all components including shadow
  for (const [type, value] of Object.entries(params)) {
    // Skip non-component params
    // if (
    //   !value ||
    //   value === "none" ||
    //   type === "body" ||
    //   type === "special" ||
    //   type === "sex"
    // )
    //   continue;

    console.log(`\nProcessing component: ${type} = ${value}`);

    // the name of the sheet is always the first part of the value
    let name = value.split("_")[0];

    // handle body
    if (type === "body") {
      name = "Body Options";
    } else if (type === "head") {
      name = value.replaceAll("_", " ");
      // if it has three or more segments, then trim the last one off
      if (name.split(" ").length >= 3) {
        name = name.split(" ").slice(0, -1).join(" ");
      }
    } else if (type === "sex") {
      // we skip sex because that is actually a sub-option of the head/body
      continue;
    }

    const sheetDefinition = Object.values(sheetDefinitions).find(
      (d): d is SheetDefinition => "name" in d && d.name === name
    );

    if (!sheetDefinition) {
      console.error(`❌ No sheet definition found for type: ${type} (${name})`);
      continue;
    } else {
      logSuccess(`✅ Found sheet definition for type: ${type} (${name})`);
    }

    // process the layers for this sheet definition (up to 8 layers)

    // todo - special handling for body and head

    for (let i = 1; i <= 8; i++) {
      const layerKey = `layer_${i}` as keyof SheetDefinition;
      const layer = sheetDefinition[layerKey] as LayerDefinition | undefined;

      // get the last part of the value as the variant
      const variant = value.split("_").pop();

      if (!layer) continue;

      // Get path - use direct path if available, otherwise try sex-specific
      const componentPath = layer[params.sex as keyof LayerDefinition] as
        | string
        | undefined;

      if (!componentPath) {
        console.log(`No path found for component ${type}, layer ${i}`);
        continue;
      }

      console.log(`Attempting file lookup:`, {
        componentPath,
        variant,
        animations: sheetDefinition.animations || [],
      });

      const fileName = await findValidAnimationFile(
        componentPath,
        variant || "",
        sheetDefinition.animations
      );

      if (fileName) {
        layers.push({
          fileName,
          zPos: layer.zPos,
          name: `${type}_${layerKey}`,
          variant,
          supportedAnimations: sheetDefinition.animations || [],
        });
      } else {
        console.error(`❌ Component file not found: ${fileName}`);
      }
    }
  }

  return layers.sort((a, b) => a.zPos - b.zPos);
}
