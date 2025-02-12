import { ConfigBlock } from "../types";

export function getValue<T>(config: ConfigBlock, path: string): T | undefined {
  const parts = path.split(".");
  let current: unknown = config;

  for (const part of parts) {
    if (typeof current !== "object" || current === null) return undefined;
    const record = current as Record<string, unknown>;
    if (!(part in record)) return undefined;
    current = record[part];
  }
  return current as T;
}
