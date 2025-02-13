import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ConfigBlock } from "../api/types";
import { useConfigValue } from "../api/hooks/useConfigValue";
import { useConfigApi } from "../api/hooks/useConfigApi";
import { ConfigItemTable } from "../components/ConfigItemTable";
import { Alert, Button, CircularProgress } from "@heroui/react";

export const SSLPage: React.FC = () => {
  const { serverIndex } = useParams();
  const { value, isLoading, error } = useConfigValue<ConfigBlock>(
    `/http/children/server/${serverIndex}/children/ssl/0`,
  );
  const { updateConfig } = useConfigApi();
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [savedValues, setSavedValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (value?.configItems) {
      const initial = value.configItems.reduce(
        (acc, item) => {
          item.params?.forEach((param) => {
            if (param?.path) {
              acc[param.path] = param.value ?? "";
            }
          });
          return acc;
        },
        {} as Record<string, string>,
      );

      setEditedValues(initial);
      setSavedValues(initial);
    }
  }, [value]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircularProgress label="加載中..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-[1vw]">
        <Alert
          description={error.message}
          title="Error"
          color="danger"
          radius="lg"
        />
      </div>
    );
  }

  if (!value) {
    return (
      <div className="p-4">
        <Alert
          description="No SSL configuration found"
          title="No data"
          color="warning"
          radius="lg"
        />
      </div>
    );
  }

  const handleParamChange = (path: string, newValue: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [path]: newValue,
    }));
  };

  const hasChanges = Object.keys(editedValues).some(
    (key) => editedValues[key] !== savedValues[key],
  );

  const handleSave = async () => {
    setIsSaving(true);
    const changedParams = Object.entries(editedValues)
      .filter(([path, value]) => value !== savedValues[path])
      .map(([path, value]) => ({ path, newValue: value }));

    try {
      await Promise.all(
        changedParams.map(({ path, newValue }) =>
          updateConfig(path + "/value", newValue),
        ),
      );
      setSavedValues(editedValues);
    } catch (e) {
      console.error("Failed to save changes", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-auto flex flex-col p-[5vw] gap-3">
      <div className="w-fit flex flex-col gap-[2vh]">
        <h1 className="text-5xl font-bold">SSL 設定</h1>
        <p className="text-3xl text-gray-500 text-right">
          {value.desc["zh-tw"]}
        </p>
      </div>

      <div className="w-2/3 ml-[2vw]">
        <ConfigItemTable
          configItems={value.configItems}
          lang="zh-tw"
          editedValues={editedValues}
          onChange={handleParamChange}
        />

        <div className="flex justify-end mt-4">
          <Button
            isDisabled={!hasChanges || isSaving}
            color="primary"
            onPress={handleSave}
            isLoading={isSaving}
          >
            儲存
          </Button>
        </div>
      </div>
    </div>
  );
};
