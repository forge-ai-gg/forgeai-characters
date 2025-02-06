import { LayerDefinition } from "@/types/sheetDefinitions";
import { SpriteConfigQueryParams, SpriteLayer } from "@/types/sprites";
import { findValidAnimationFile } from "./findValidAnimationFile";
import { SheetDefinition, sheetDefinitions } from "./sheetDefinitions";
import { logSuccess } from "./utils";

export async function getLayersForSprite(
  // params here is the query params from the url
  params: Partial<SpriteConfigQueryParams>
): Promise<SpriteLayer[]> {
  const layers: SpriteLayer[] = [];

  for (const [type, value] of Object.entries(params)) {
    console.log(`\nProcessing param: ${type} = ${value}`);

    // the name of the sheet is always the first part of the value, but it could have a space in it like "Long Pants"
    // lets get the name based on joining all the segments that start with a capital letter
    let name = value
      ?.toString()
      .split("_")
      .filter((t) => t.slice(0, 1).match(/[A-Z]/))
      .join(" ");
    if (!name && type !== "sex") {
      console.error(`❌ No name found for type: ${type}, value: ${value}`);
      continue;
    }

    // handle body
    if (type === "body") {
      name = "Body Options";
    } else if (type === "head") {
      name = value?.toString().replaceAll("_", " ") ?? "";
      // if it has three or more segments, then only just the first two
      if (name.split(" ").length >= 3) {
        name = name.split(" ").slice(0, 2).join(" ");
      }
    } else if (type === "sex") {
      // we skip sex because that is actually a sub-option of the head/body
      continue;
    }

    // get the number of segments in the name and value to determine how to process the name and value
    const nameSegmentLength = name?.split("_").length; // Longsleeve or Long_Pants
    const valueSegmentLength = value?.toString().split("_").length; // black or fur_blue

    // get the sheet definition for this name which tells us a lot about how to process the layers
    const sheetDefinition = Object.values(sheetDefinitions).find(
      (d): d is SheetDefinition => "name" in d && d.name === name
    );

    if (!sheetDefinition) {
      console.error(
        `❌ No sheet definition found for type: ${type} value: (${value})`
      );
      continue;
    } else {
      logSuccess(
        `✅ Found sheet definition for type: ${type} value: (${value}). Value Segment Length: ${valueSegmentLength} and Name Segment Length: ${nameSegmentLength}`
      );
    }

    // process the layers for this sheet definition (up to 8 layers)

    // todo - special handling for body and head
    if (type === "body") {
      const fileName = await findValidAnimationFile({
        componentPath: `body/bodies/${params.sex}`,
        variant: params.body?.replace("Body_color_", "") || "",
      });
      console.log(`\nFound file: ${fileName}`);
      layers.push({
        fileName: fileName || "",
        zPos: 1,
        name: `${type}_${params.sex}`,
        variant: params.body,
        supportedAnimations: [],
      });
    } else {
      // if its not body, then we need to process up to 8 layers
      for (let i = 1; i <= 8; i++) {
        const layerKey = `layer_${i}` as keyof SheetDefinition;
        const layer = sheetDefinition[layerKey] as LayerDefinition | undefined;

        // get the variant by removing the type
        let variant = value?.toString() ?? "";
        if (valueSegmentLength && valueSegmentLength >= 3) {
          variant = variant.split("_").slice(2).join("_");
        } else {
          variant = variant?.split("_").pop() ?? "";
        }

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

        const fileName = await findValidAnimationFile({
          componentPath,
          variant: variant || "",
          supportedAnimations: sheetDefinition.animations,
        });

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
  }

  return layers.sort((a, b) => a.zPos - b.zPos);
}
