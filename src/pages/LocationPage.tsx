import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ConfigBlock } from "../api/types";
import { useConfigValue } from "../api/hooks/useConfigValue";
import { useConfigApi } from "../api/hooks/useConfigApi";
import { ConfigItemTable } from "../components/ConfigItemTable";
import {
  Alert,
  Button,
  CircularProgress,
  Card,
  CardHeader,
  CardBody,
} from "@heroui/react";
import { CardContextMenu, AddBlockCard } from "../components/CardContextMenu";
import { useContextMenu } from "../components/hooks/useContextMenu";

export const LocationPage: React.FC = () => {
  const { serverIndex } = useParams();
  const {
    value: locations,
    isLoading,
    error,
  } = useConfigValue<ConfigBlock[]>(
    `/http/children/server/${serverIndex}/children/location`,
  );
  const { updateConfig, addBlock, deleteBlock } = useConfigApi();
  const { contextMenu, handleContextMenu, closeContextMenu } = useContextMenu();
  const [locationStates, setLocationStates] = useState<{
    [key: string]: {
      editedValues: Record<string, string>;
      savedValues: Record<string, string>;
      isSaving: boolean;
    };
  }>({});

  useEffect(() => {
    if (locations) {
      const newStates = locations.reduce(
        (acc, location, index) => {
          const initial =
            location.configItems?.reduce(
              (values, item) => {
                item.params?.forEach((param) => {
                  if (param?.path) {
                    values[param.path] = param.value ?? "";
                  }
                });
                return values;
              },
              {} as Record<string, string>,
            ) ?? {};

          acc[`location-${index}`] = {
            editedValues: initial,
            savedValues: initial,
            isSaving: false,
          };
          return acc;
        },
        {} as typeof locationStates,
      );

      setLocationStates(newStates);
    }
  }, [locations]);

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

  if (!locations?.length) {
    return (
      <div className="p-4">
        <Alert
          description="No location configurations found"
          title="No data"
          color="warning"
          radius="lg"
        />
      </div>
    );
  }

  const handleParamChange = (
    locationId: string,
    path: string,
    newValue: string,
  ) => {
    setLocationStates((prev) => ({
      ...prev,
      [locationId]: {
        ...prev[locationId],
        editedValues: {
          ...prev[locationId].editedValues,
          [path]: newValue,
        },
      },
    }));
  };

  const hasChanges = (locationId: string) => {
    const state = locationStates[locationId];
    return Object.keys(state.editedValues).some(
      (key) => state.editedValues[key] !== state.savedValues[key],
    );
  };

  const handleSave = async (locationId: string) => {
    const state = locationStates[locationId];
    setLocationStates((prev) => ({
      ...prev,
      [locationId]: { ...prev[locationId], isSaving: true },
    }));

    const changedParams = Object.entries(state.editedValues)
      .filter(([path, value]) => value !== state.savedValues[path])
      .map(([path, value]) => ({ path, newValue: value }));

    try {
      await Promise.all(
        changedParams.map(({ path, newValue }) =>
          updateConfig(path + "/value", newValue),
        ),
      );

      setLocationStates((prev) => ({
        ...prev,
        [locationId]: {
          ...prev[locationId],
          savedValues: { ...prev[locationId].editedValues },
          isSaving: false,
        },
      }));
    } catch (e) {
      console.error("Failed to save changes", e);
      setLocationStates((prev) => ({
        ...prev,
        [locationId]: { ...prev[locationId], isSaving: false },
      }));
    }
  };

  const handleAddLocation = async () => {
    try {
      await addBlock(`/http/children/server/${serverIndex}`, "location");
    } catch (error) {
      console.error("Failed to add location block:", error);
    }
  };

  const handleDeleteLocation = async (path: string) => {
    try {
      await deleteBlock(path);
    } catch (error) {
      console.error("Failed to delete location block:", error);
    }
  };

  const getLocationPath = (location: ConfigBlock) => {
    const pathParam = location.params?.find((param) =>
      param.path.includes("location"),
    );
    return pathParam?.value || "未命名位置";
  };

  return (
    <div className="w-auto flex flex-col p-[5vw] gap-6">
      <h1 className="text-5xl font-bold mb-8">Location 設定</h1>

      {locations.map((location, index) => {
        const locationId = `location-${index}`;
        const state = locationStates[locationId];

        if (!state) return null;

        return (
          <Card
            key={locationId}
            className="w-full p-[2vw]"
            onContextMenu={(e) => handleContextMenu(e, { path: location.path })}
          >
            <CardHeader className="flex flex-row justify-between items-center">
              <h2 className="text-2xl font-semibold">
                {getLocationPath(location)}
              </h2>
              <Button
                isDisabled={!hasChanges(locationId) || state.isSaving}
                color="primary"
                onPress={() => handleSave(locationId)}
                isLoading={state.isSaving}
              >
                儲存
              </Button>
            </CardHeader>
            <CardBody>
              <ConfigItemTable
                configItems={location.configItems}
                lang="zh-tw"
                editedValues={state.editedValues}
                onChange={(path, value) =>
                  handleParamChange(locationId, path, value)
                }
              />
            </CardBody>
          </Card>
        );
      })}

      <AddBlockCard onClick={handleAddLocation} />

      {contextMenu && (
        <CardContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
          onDelete={() => {
            handleDeleteLocation(contextMenu.data.path);
            closeContextMenu();
          }}
          isDeleteDisabled={locations.length <= 1}
        />
      )}
    </div>
  );
};
