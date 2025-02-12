import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { ConfigBlock } from "../api/types";
import { useConfigValue } from "../api/hooks/useConfigValue";
import { useConfigApi } from "../api/hooks/useConfigApi";
import { ConfigItemTable } from "../components/ConfigItemTable";

// 將初始化參數值的邏輯獨立出來（不依賴組件內部狀態）
const getInitialValues = (server: ConfigBlock): Record<string, string> => {
  const values: Record<string, string> = {};
  server.configItems.forEach((item) => {
    item.params.forEach((param) => {
      values[param.path] = param.value;
    });
  });
  return values;
};

export const ServerPage = () => {
  const { value, isLoading, error } = useConfigValue<ConfigBlock[]>(
    "childrenBlocks.http.0.childrenBlocks.server",
  );
  const { serverIndex } = useParams();
  const { updateConfig } = useConfigApi();

  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [savedValues, setSavedValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isLoading && !error && value) {
      const index = serverIndex ? parseInt(serverIndex) : -1;
      const server = value[index];
      if (server) {
        const initial = getInitialValues(server);
        setEditedValues(initial);
        setSavedValues(initial);
      }
    }
  }, [isLoading, error, value, serverIndex]);

  // 接下來再根據狀態返回對應畫面（這裡的 return 已發生在 Hooks 呼叫之後）
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!value) {
    return <div>No data</div>;
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

  // 取得 Server 顯示名稱
  const getDisplayName = (server: ConfigBlock): string => {
    const getParamValue = (pathKeyword: string): string | undefined => {
      const item = server.configItems.find((item) =>
        item.path.includes(pathKeyword),
      );
      return item?.params[0]?.value;
    };

    const serverName = getParamValue("server_name");
    const listen = getParamValue("listen");

    return serverName || listen || "";
  };

  const displayName = getDisplayName(server);

  // 當使用者編輯參數時，更新 editedValues
  const handleParamChange = (path: string, newValue: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [path]: newValue,
    }));
  };

  // 檢查是否有任何參數被修改（editedValues 與 savedValues 不同）
  const hasChanges = Object.keys(editedValues).some(
    (key) => editedValues[key] !== savedValues[key],
  );

  const handleSave = async () => {
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
      </div>

      <div className="flex justify-end mt-4">
        <button
          disabled={!hasChanges}
          onClick={handleSave}
          className={`px-4 py-2 rounded ${
            hasChanges ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"
          }`}
        >
          Save
        </button>
      </div>
    </div>
  );
};
