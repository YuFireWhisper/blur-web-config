import { ConfigItem } from "../api/types";
import { ParamInput } from "./ParamInput";

interface ConfigItemSectionProps {
  configItem: ConfigItem;
  lang: string;
  editedValues: Record<string, string>;
  onChange: (path: string, newValue: string) => void;
}

export const ConfigItemSection = ({
  configItem,
  lang,
  editedValues,
  onChange,
}: ConfigItemSectionProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="flex flex-col gap-2 items-start justify-center">
        <p className="text-medium">{configItem.display_name[lang]}</p>
      </div>
      <div className="col-span-2 flex flex-col gap-2">
        {configItem.params.map((param) => (
          <div key={param.path}>
            <ParamInput
              param={param}
              value={editedValues[param.path] || ""}
              onChange={(newValue: string) => onChange(param.path, newValue)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
