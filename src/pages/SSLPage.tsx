import { useParams } from "react-router-dom";
import { ConfigBlock } from "../api/types";
import { useConfigValue } from "../api/hooks/useConfigValue";
import { useConfigState } from "../components/hooks/useConfigStatus";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { ConfigLayout } from "../components/ConfigLayout";
import { ConfigForm } from "../components/ConfigForm";

export const SSLPage: React.FC = () => {
  const { serverIndex } = useParams();
  const { value, isLoading, error } = useConfigValue<ConfigBlock>(
    `/http/children/server/${serverIndex}/children/ssl/0`,
  );

  const { states, actions, hasSingleState } = useConfigState(value, "ssl");
  const mainState = hasSingleState ? states["ssl"] : null;

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;
  if (!value || !mainState)
    return <ErrorState message="No SSL configuration found" />;

  return (
    <ConfigLayout title="SSL 設定" description={value.desc["zh-tw"]}>
      <ConfigForm
        configBlock={value}
        editedValues={mainState.editedValues}
        onChange={(path, value) =>
          actions.handleParamChange("ssl", path, value)
        }
        onSave={() => actions.handleSave("ssl")}
        hasChanges={actions.hasChanges("ssl")}
        isSaving={mainState.isSaving}
      />
    </ConfigLayout>
  );
};
