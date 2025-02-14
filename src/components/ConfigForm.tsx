import React from "react";
import { Button } from "@heroui/react";
import { ConfigItemTable } from "./ConfigItemTable";
import { ConfigBlock } from "../api/types";

interface ConfigFormProps {
  configBlock: ConfigBlock;
  editedValues: Record<string, string>;
  onChange: (path: string, value: string) => void;
  onSave: () => Promise<void>;
  hasChanges: boolean;
  isSaving: boolean;
  lang?: string;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({
  configBlock,
  editedValues,
  onChange,
  onSave,
  hasChanges,
  isSaving,
  lang = "zh-tw",
}) => {
  return (
    <>
      <ConfigItemTable
        configItems={configBlock.configItems}
        lang={lang}
        editedValues={editedValues}
        onChange={onChange}
      />
      <div className="flex justify-end mt-4">
        <Button
          isDisabled={!hasChanges || isSaving}
          color="primary"
          onPress={onSave}
          isLoading={isSaving}
        >
          儲存
        </Button>
      </div>
    </>
  );
};
