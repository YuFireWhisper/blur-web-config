import { Alert, Card } from "@heroui/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useConfigValue } from "../api/hooks/useConfigValue";
import { useConfigApi } from "../api/hooks/useConfigApi";
import { ConfigBlock } from "../api/types";
import { getDisplayName } from "./utils/getDisplayName";
import { motion } from "framer-motion";
import { BASE_URL_PATH } from "../App";
import { CardContextMenu, AddBlockCard } from "../components/CardContextMenu";
import { useContextMenu } from "./hooks/useContextMenu";

export interface ServerData {
  index: number;
  path: string;
  name: string;
  content: ConfigBlock;
}

const ServerSelector: React.FC = () => {
  const navigate = useNavigate();
  const { value, isLoading, error } = useConfigValue<ConfigBlock[]>(
    "/http/children/server",
  );
  const { addBlock, deleteBlock } = useConfigApi();
  const { contextMenu, handleContextMenu, closeContextMenu } = useContextMenu();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div
          className={[
            "w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin",
          ].join(" ")}
        />
      </div>
    );
  }

  if (!value) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert title="No data" color="warning">
          No location configurations found
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert title="Error" color="danger">
          {error.message}
        </Alert>
      </div>
    );
  }

  const servers: ServerData[] = value.map((server, index) => ({
    index,
    path: server.path,
    name: getDisplayName(server),
    content: server,
  }));

  const handleAddServer = async () => {
    try {
      await addBlock("/http", "server");
    } catch (error) {
      console.error("Failed to add server block:", error);
    }
  };

  const handleDeleteServer = async (path: string) => {
    try {
      await deleteBlock(path);
    } catch (error) {
      console.error("Failed to delete server block:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="max-w-5xl mx-[10vw] w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {servers.map((server, idx) => (
          <motion.div
            key={server.index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * idx }}
          >
            <Card
              onPress={() =>
                navigate(BASE_URL_PATH + `/server/${server.index}`)
              }
              onContextMenu={(e) =>
                handleContextMenu(e, { path: server.path })
              }
              className="group relative overflow-hidden bg-white/80 backdrop-blur
                transition-all duration-300 hover:shadow-xl hover:-translate-y-1
                min-w-[15vw] items-center justify-center"
              isPressable
              isBlurred
              isHoverable
            >
              <div
                className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0
                group-hover:from-blue-500/5 group-hover:to-indigo-500/5
                transition-all duration-300"
              />
              <div className="p-8">
                <h2
                  className="text-2xl font-semibold text-gray-800
                  text-center group-hover:text-blue-600
                  transition-colors duration-300"
                >
                  {server.name}
                </h2>
              </div>
            </Card>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 * servers.length }}
        >
          <AddBlockCard onClick={handleAddServer} />
        </motion.div>
      </div>

      {contextMenu && (
        <CardContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
          onDelete={() => {
            handleDeleteServer(contextMenu.data.path);
            closeContextMenu();
          }}
          isDeleteDisabled={servers.length <= 1}
        />
      )}
    </motion.div>
  );
};

export default ServerSelector;
