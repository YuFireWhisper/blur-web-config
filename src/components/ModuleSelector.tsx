import { Select, SelectItem } from "@heroui/react";
import { ReactNode } from "react";

export type ModuleItem = {
  key: number;
  label: string;
};

interface ModuleSelectorProps {
  modules: ModuleItem[];
  onSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  getSelectedModule: () => ReactNode;
}

const ModuleSelector = ({ modules, onSelect, getSelectedModule }: ModuleSelectorProps) => {
  return (
    <div className="w-[15vw] mr-[10vw] my-5">
      <Select
        className="max-w-xs"
        selectionMode="single"
        color="default"
        label="Modules"
        placeholder="Select Modules"
        size="sm"
        radius="sm"
        onChange={onSelect}
        renderValue={getSelectedModule}
      >
        {modules.map((module) => (
          <SelectItem key={module.key}>{module.label}</SelectItem>
        ))}
      </Select>
    </div>
  );
};

export default ModuleSelector;

