import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ConfigBlock } from "../api/types";
import { useConfigValue } from "../api/hooks/useConfigValue";
import { useConfigApi } from "../api/hooks/useConfigApi";
import { ConfigItemTable } from "../components/ConfigItemTable";
import { Alert, Button, CircularProgress } from "@heroui/react";
import { getDisplayName } from "../components/utils/getDisplayName";

const getInitialValues = (server: ConfigBlock): Record<string, string> => {
  const values: Record<string, string> = {};
  server.configItems?.forEach((item) => {
    item.params?.forEach((param) => {
      if (param?.path) {
        values[param.path] = param.value ?? "";
      }
    });
  });
  return values;
};

export const ServerConfigPage = () => {
  const { value, isLoading, error } = useConfigValue<ConfigBlock[]>(
    "/http/children/server",
  );
  const { serverIndex } = useParams();
  const { updateConfig } = useConfigApi();

  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [savedValues, setSavedValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && !isLoading && !error && value) {
      const index = serverIndex ? parseInt(serverIndex) : -1;
      const server = value[index];
      if (server) {
        const initial = getInitialValues(server);
        setEditedValues(initial);
        setSavedValues(initial);
        initialized.current = true;
      }
    }
  }, [isLoading, error, value, serverIndex]);

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
          description="No data"
          title="No data"
          color="warning"
          radius="lg"
        />
      </div>
    );
  }

  const index = serverIndex ? parseInt(serverIndex) : -1;
  const server = value[index];

  if (!server) {
    return (
      <div className="p-4">
        <p className="text-red-500">Server not found</p>
      </div>
    );
  }

  const displayName = getDisplayName(server);
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
    const changedParams: { path: string; newValue: string }[] = [];

    server.configItems.forEach((item) => {
      item.params.forEach((param) => {
        const original = savedValues[param.path];
        const edited = editedValues[param.path];
        if (edited !== original) {
          changedParams.push({ path: param.path, newValue: edited });
        }
      });
    });

    try {
      await Promise.all(
        changedParams.map(({ path, newValue }) =>
          updateConfig(path + "/value", newValue),
        ),
      );
      setSavedValues((prev) => ({
        ...prev,
        ...changedParams.reduce(
          (acc, { path, newValue }) => {
            acc[path] = newValue;
            return acc;
          },
          {} as Record<string, string>,
        ),
      }));
    } catch (e) {
      console.error("Failed to save changes", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-auto flex flex-col p-[5vw] gap-3">
      <div className="w-fit flex flex-col gap-[2vh]">
        <h1 className="text-5xl font-bold">{displayName}</h1>
        <p className="text-3xl text-gray-500 text-right">
          {server.desc["zh-tw"]}
        </p>
      </div>

      <div className="w-1/3 ml-[2vw]">
        <ConfigItemTable
          configItems={server.configItems}
          lang="zh-tw"
          editedValues={editedValues}
          onChange={handleParamChange}
        />

        <div className="flex justify-end">
          <Button
            isDisabled={!hasChanges || isSaving}
            color="primary"
            onPress={handleSave}
            isLoading={isSaving}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};
