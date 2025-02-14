import { Card } from "@heroui/react";
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
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";

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

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;
  if (!value) return <ErrorState message="No server found" />;

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
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {servers.map((server, idx) => (
          <motion.div
            key={server.index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * idx }}
            className="h-full"
          >
            <Card
              onPress={() =>
                navigate(BASE_URL_PATH + `/server/${server.index}`)
              }
              onContextMenu={(e) => handleContextMenu(e, { path: server.path })}
              className="group relative h-full bg-white/90 backdrop-blur-md
                transition-all duration-300 
                hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
                hover:-translate-y-1
                border border-gray-200/50
                flex flex-col justify-center"
              isPressable
              isBlurred
              isHoverable
            >
              <div
                className="
                absolute inset-0 bg-gradient-to-br from-blue-600/0 
                via-purple-500/0 to-indigo-600/0
                group-hover:from-blue-600/5 group-hover:via-purple-500/5 group-hover:to-indigo-600/5
                transition-all duration-500 ease-out"
              />
              <div className="p-8 flex flex-col items-center space-y-4 relative z-10">
                <div
                  className="
                  w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 
                  flex items-center justify-center mb-2 shadow-lg
                  group-hover:scale-110 transition-transform duration-300"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 12h14M12 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <h2
                  className="text-2xl font-semibold text-gray-800
                  text-center group-hover:text-blue-600
                  transition-colors duration-300"
                >
                  {server.name}
                </h2>
                <p className="text-gray-500 text-sm text-center">
                  Click to configure server
                </p>
              </div>
            </Card>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 * servers.length }}
          className="h-full"
        >
          <AddBlockCard
            onClick={handleAddServer}
            className="h-full bg-gradient-to-br from-gray-50 to-gray-100
              hover:from-gray-100 hover:to-gray-200
              transition-all duration-300"
          />
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
