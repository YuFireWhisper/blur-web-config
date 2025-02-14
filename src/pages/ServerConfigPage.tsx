import { useParams } from "react-router-dom";
import { ConfigBlock } from "../api/types";
import { useConfigValue } from "../api/hooks/useConfigValue";
import { useConfigState } from "../components/hooks/useConfigStatus";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { ConfigLayout } from "../components/ConfigLayout";
import { ConfigForm } from "../components/ConfigForm";

export const ServerConfigPage = () => {
  const { serverIndex } = useParams();
  const { value, isLoading, error } = useConfigValue<ConfigBlock>(
    `/http/children/server/${serverIndex}`,
  );

  const { states, actions } = useConfigState(value, "server");
  const mainState = states["server"];

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;
  if (!value || !mainState)
    return <ErrorState message="No Server configuration found" />;

  return (
    <ConfigLayout title="Server 設定" description={value.desc["zh-tw"]}>
      <ConfigForm
        configBlock={value}
        editedValues={mainState.editedValues}
        onChange={(path, value) =>
          actions.handleParamChange("server", path, value)
        }
        onSave={() => actions.handleSave("server")}
        hasChanges={actions.hasChanges("server")}
        isSaving={mainState.isSaving}
      />
    </ConfigLayout>
  );
};
