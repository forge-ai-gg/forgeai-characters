import { OptionsAccordionClient } from "./OptionsAccordionClient";

interface SheetDefinition {
  name: string;
  options: {
    sex: string[];
    [key: string]: any;
  };
}

interface OptionsAccordionProps {
  sheetDefinition: string;
  spriteConfig: any;
  handleOptionChange: (option: string, value: string | null) => void;
  handleToggleOption: (option: string) => void;
}

export async function OptionsAccordion({
  sheetDefinition,
  spriteConfig,
  handleOptionChange,
  handleToggleOption,
}: OptionsAccordionProps) {
  const definition: SheetDefinition = (
    await import(`../../sheet_definitions/${sheetDefinition}.json`)
  ).default;

  return (
    <OptionsAccordionClient
      name={definition.name}
      bodyTypes={definition.options.sex}
      spriteConfig={spriteConfig}
      handleOptionChange={handleOptionChange}
      handleToggleOption={handleToggleOption}
    />
  );
}
