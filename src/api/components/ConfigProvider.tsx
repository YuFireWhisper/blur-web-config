import { useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { ConfigBlock, ConfigContext } from "../types";
import { ConfigAPIClient, ConfigAPIError } from "../client";

export interface ConfigContextValue {
  config: ConfigBlock | null;
  isLoading: boolean;
  error: ConfigAPIError | null;
  refreshConfig: () => Promise<void>;
  updateConfig: (path: string, newValue: unknown) => Promise<void>;
  addBlock: (parentPath: string, blockName: string) => Promise<void>;
  deleteBlock: (blockPath: string) => Promise<void>;
}

interface ConfigProviderProps {
  children: ReactNode;
  apiClient?: ConfigAPIClient;
}

export const ConfigProvider = ({
  children,
  apiClient,
}: ConfigProviderProps) => {
  const client = useMemo(() => apiClient ?? new ConfigAPIClient(), [apiClient]);

  const [config, setConfig] = useState<ConfigBlock | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ConfigAPIError | null>(null);

  const refreshConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newConfig = await client.getConfig();
      setConfig(newConfig);
    } catch (err) {
      setError(
        err instanceof ConfigAPIError
          ? err
          : new ConfigAPIError("Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const updateConfig = useCallback(
    async (path: string, newValue: unknown) => {
      try {
        await client.updateConfig(path, newValue);
        await refreshConfig();
      } catch (err) {
        throw err instanceof ConfigAPIError
          ? err
          : new ConfigAPIError("Unknown error");
      }
    },
    [client, refreshConfig]
  );

  const addBlock = useCallback(
    async (parentPath: string, blockName: string) => {
      try {
        await client.addBlock(parentPath, blockName);
        await refreshConfig();
      } catch (err) {
        throw err instanceof ConfigAPIError
          ? err
          : new ConfigAPIError("Unknown error");
      }
    },
    [client, refreshConfig]
  );

  const deleteBlock = useCallback(
    async (blockPath: string) => {
      try {
        await client.deleteBlock(blockPath);
        await refreshConfig();
      } catch (err) {
        throw err instanceof ConfigAPIError
          ? err
          : new ConfigAPIError("Unknown error");
      }
    },
    [client, refreshConfig]
  );

  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);

  const value: ConfigContextValue = {
    config,
    isLoading,
    error,
    refreshConfig,
    updateConfig,
    addBlock,
    deleteBlock,
  };

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
};

