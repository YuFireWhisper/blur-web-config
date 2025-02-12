import { Card } from "@heroui/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useConfigValue } from "../api/hooks/useConfigValue";
import { ConfigBlock } from "../api/types";

export type ServerItem = {
  index: number;
  name: string;
  content: React.FC;
};

const ServerSelector = () => {
  const navigate = useNavigate();

  const { value, isLoading, error } = useConfigValue<ConfigBlock[]>(
    "childrenBlocks.http.0.childrenBlocks.server",
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!value) {
    return <div>No data</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const servers = value.map((server, index) => ({
    index,
    name: server.display_name["zh-tw"],
    content: server,
  }));

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-10 mb-4">
        {servers.map((server) => (
          <Card
            key={server.index}
            onPress={() => navigate(`/server/${server.index}`)}
            className="w-[30vw] min-h-[10vh] flex items-center justify-center bg-white"
            isPressable={true}
            isBlurred={true}
            isHoverable={true}
          >
            <h1 className="text-2xl text-center">{server.name}</h1>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServerSelector;
