import { Alert, CircularProgress } from "@heroui/react";
import { useConfigValue } from "../api/hooks/useConfigValue";
import { ConfigBlock } from "../api/types";
import ServerSelector from "../components/ServerSelector";
import { motion } from "framer-motion";

const HttpPage = () => {
  const { value, isLoading, error } = useConfigValue<ConfigBlock>(
    "childrenBlocks.http.0.childrenBlocks.server",
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircularProgress label="加載中..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
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

  if (!value) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col min-w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50"
    >
      <div className="flex flex-col px-[1vw] pt-[5vh] pb-[5vh]">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-[10vw] w-full"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">HTTP</h1>
          <p className="text-lg text-gray-600">請選擇要配置的 Server</p>
        </motion.div>
      </div>
      <div className="flex-1 px-[4vw] pb-12">
        <ServerSelector />
      </div>
    </motion.div>
  );
};

export default HttpPage;
