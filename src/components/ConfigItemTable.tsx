import { ConfigItem } from "../api/types";
import { ConfigItemSection } from "./ConfigItemSection";

interface ConfigItemTableProps {
  configItems: ConfigItem[];
  lang: string;
  editedValues: Record<string, string>;
  onChange: (path: string, value: string) => void;
}

const priorityOrder = ["listen", "server_name"];

const getPriority = (path: string) => {
  const parts = path.split("/").filter(Boolean);
  if (parts.length < 2) return Infinity;
  const key = parts[parts.length - 2];
  const index = priorityOrder.indexOf(key);
  return index === -1 ? Infinity : index;
};

export const ConfigItemTable = ({
  configItems,
  lang,
  editedValues,
  onChange,
}: ConfigItemTableProps) => {
  const sortedItems = [...configItems].sort(
    (a, b) => getPriority(a.path) - getPriority(b.path),
  );

  return (
    <div className="w-full max-w-4xl mx-auto py-6 space-y-6">
      {sortedItems.map((configItem) => (
        <ConfigItemSection
          key={configItem.path}
          configItem={configItem}
          lang={lang}
          editedValues={editedValues}
          onChange={onChange}
        />
      ))}
    </div>
  );
};
