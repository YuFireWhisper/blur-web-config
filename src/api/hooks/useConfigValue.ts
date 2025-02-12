import { ConfigAPIError } from "../client";
import { getValue } from "../utils/configHelpers";
import { useConfigApi } from "./useConfigApi";

export function useConfigValue<T>(path: string): {
  value: T | undefined;
  isLoading: boolean;
  error: ConfigAPIError | null;
  updateValue: (newValue: T) => Promise<void>;
} {
  const { config, isLoading, error, updateConfig } = useConfigApi();

  return {
    value: config ? getValue<T>(config, path) : undefined,
    isLoading,
    error,
    updateValue: (newValue: T) => updateConfig(path, newValue),
  };
}
