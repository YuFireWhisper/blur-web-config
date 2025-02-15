import { createContext } from "react";
import { ConfigContextValue } from "./components/ConfigProvider";

export type LocalizedText = Record<string, string>; // 格式: { "zh-TW": "中文", "en": "English" }
export type ParamType = "bool" | "u32" | "String" | "usize";

export interface Param {
  path: string; // 使用 Json Pointer 格式
  display_name: LocalizedText;
  desc: LocalizedText;
  type: ParamType;
  is_required: boolean;
  default: string;
  value: string;
}

export interface ConfigItem {
  path: string;
  display_name: LocalizedText;
  desc: LocalizedText;
  params: Param[];
}

export interface ConfigBlock {
  path: string; // 根區塊使用 "" (空字串)
  display_name: LocalizedText;
  desc: LocalizedText;
  params: Param[];
  configItems: ConfigItem[];
  children: Record<string, ConfigBlock[]>;
}

export const ConfigContext = createContext<ConfigContextValue | null>(null);
