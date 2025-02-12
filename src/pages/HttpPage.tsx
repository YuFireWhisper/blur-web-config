import { useConfigValue } from "../api/hooks/useConfigValue";
import { ConfigBlock } from "../api/types";
import ServerSelector from "../components/ServerSelector";

const HttpPage = () => {
  const { value, isLoading, error } =
    useConfigValue<ConfigBlock>("childrenBlocks.http.0.childrenBlocks.server");

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!value) {
    console.log("No data");
    return <div>No data</div>;
  }

  return (
    <div className="flex flex-col min-w-full h-screen bg-black p-[2vw] gap-10">
      <div className="flex flex-col pl-[10vw] text-white gap-2">
        <h1 className="text-[2vw]">HTTP</h1>
        <p className="text-lg">請選擇要配置的 Server</p>
      </div>
      <div className="w-full flex flex-col items-center justify-center">
        <ServerSelector />
      </div>
    </div>
  );
};

export default HttpPage;
