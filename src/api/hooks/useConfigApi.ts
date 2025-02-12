import { useContext } from "react";
import { ConfigContext } from "../types";

export function useConfigApi() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfigApi must be used within a ConfigProvider");
  }
  return context;
}
