import { ConfigBlock } from "../types";

export function getValue<T>(config: ConfigBlock, path: string): T | undefined {
  if (config.path === path) return config as T;

  if (config.children) {
    const parts = path.split("/").filter((part) => part !== "");
    if (parts[0] === "children" && parts.length > 1) parts.shift();

    const currentPart = parts[0];
    if (!currentPart || !config.children[currentPart]) return undefined;

    const childBlocks = config.children[currentPart];

    if (parts.length === 1) return childBlocks as T;

    const nextPart = parts[1];

    if (!isNaN(Number(nextPart))) {
      const index = parseInt(nextPart);
      if (
        Array.isArray(childBlocks) &&
        index >= 0 &&
        index < childBlocks.length
      ) {
        const targetBlock = childBlocks[index];
        if (parts.length === 2) return targetBlock as T;
        return getValue(targetBlock, parts.slice(2).join("/"));
      }
      return undefined;
    }

    const remainingPath = parts.slice(1).join("/");
    if (Array.isArray(childBlocks)) {
      for (const childBlock of childBlocks) {
        const result = getValue(childBlock, remainingPath);
        if (result !== undefined) return result as T;
      }
    }
  }

  return undefined;
}
