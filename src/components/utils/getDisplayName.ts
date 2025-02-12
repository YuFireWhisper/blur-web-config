import { ConfigBlock } from "../../api/types";

export const getDisplayName = (server: ConfigBlock): string => {
  const getParamValue = (pathKeyword: string): string | undefined => {
    const item = server.configItems?.find((item) =>
      item?.path?.includes(pathKeyword),
    );
    return item?.params?.[0]?.value;
  };

  const serverName = getParamValue("server_name");
  const listen = getParamValue("listen");

  return serverName || listen || "未命名伺服器";
};
