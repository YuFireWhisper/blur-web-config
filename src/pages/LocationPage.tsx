import { useParams } from "react-router-dom";
import { ConfigBlock } from "../api/types";
import { useConfigValue } from "../api/hooks/useConfigValue";
import { Card, CardHeader } from "@heroui/react";
import { useConfigState } from "../components/hooks/useConfigStatus";
import { ConfigLayout } from "../components/ConfigLayout";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { ConfigForm } from "../components/ConfigForm";

export const LocationPage: React.FC = () => {
  const { serverIndex } = useParams();
  const {
    value: locations,
    isLoading,
    error,
  } = useConfigValue<ConfigBlock[]>(
    `/http/children/server/${serverIndex}/children/location`,
  );

  const { states, actions } = useConfigState(locations, "location");
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;
  if (!locations?.length)
    return <ErrorState message="No location configurations found" />;

  const getLocationPath = (location: ConfigBlock) => {
    const pathParam = location.params?.find((param) =>
      param.path.includes("location"),
    );
    return pathParam?.value || "未命名位置";
  };

  return (
    <ConfigLayout title="Location 設定">
      {locations.map((location, index) => {
        const identifier = `location-${index}`;
        const state = states[identifier];

        if (!state) return null;

        return (
          <Card key={identifier} className="w-full p-[2vw]">
            <CardHeader>
              <p className="text-3xl">{getLocationPath(location)}</p>
            </CardHeader>

            <ConfigForm
              configBlock={location}
              editedValues={state.editedValues}
              onChange={(path, value) =>
                actions.handleParamChange(identifier, path, value)
              }
              onSave={() => actions.handleSave(identifier)}
              hasChanges={actions.hasChanges(identifier)}
              isSaving={state.isSaving}
            />
          </Card>
        );
      })}
    </ConfigLayout>
  );
};
