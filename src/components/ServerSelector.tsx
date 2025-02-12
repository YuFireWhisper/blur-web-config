import { Alert, Card } from "@heroui/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useConfigValue } from "../api/hooks/useConfigValue";
import { ConfigBlock } from "../api/types";
import { getDisplayName } from "./utils/getDisplayName";
import { motion } from "framer-motion";

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
        <Alert
          description="No location configurations found"
          title="No data"
          color="warning"
          radius="lg"
          className="shadow-lg backdrop-blur bg-white/90"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert
          description={error.message}
          title="Error"
          color="danger"
          radius="lg"
          className="shadow-lg backdrop-blur bg-white/90"
        />
      </div>
    );
  }

  const servers = value.map((server, index) => ({
    index,
    name: getDisplayName(server),
    content: server,
  }));

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
              onPress={() => navigate(`/server/${server.index}`)}
              className={[
                "group relative overflow-hidden bg-white/80 backdrop-blur",
                "transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                "min-w-[15vw] items-center justify-center",
              ].join(" ")}
              isPressable={true}
              isBlurred={true}
              isHoverable={true}
            >
              <div
                className={[
                  "absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0",
                  "group-hover:from-blue-500/5 group-hover:to-indigo-500/5",
                  "transition-all duration-300",
                ].join(" ")}
              />
              <div className="p-8">
                <h2
                  className={[
                    "text-2xl font-semibold text-gray-800",
                    "text-center group-hover:text-blue-600",
                    "transition-colors duration-300",
                  ].join(" ")}
                >
                  {server.name}
                </h2>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ServerSelector;
