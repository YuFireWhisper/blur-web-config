import {
  ConfigBlock,
  ConfigItem,
  LocalizedText,
  Param,
  ParamType,
} from "./types";

export interface RawParam {
  index: number;
  display_name: LocalizedText;
  desc: LocalizedText;
  type: ParamType;
  is_required: boolean;
  default: string;
  value: string;
}

export interface RawConfigElement {
  is_block: boolean;
  unique: boolean;
  display_name: LocalizedText;
  desc: LocalizedText;
  params: RawParam[];
  children?: Record<string, RawConfigElement[]>;
}

export type RawConfig = Record<string, RawConfigElement>;

class PathBuilder {
  static buildParamPath(parentPath: string, index: number): string {
    return `${parentPath}/params/${index}`;
  }

  static buildElementPath(
    parentPath: string,
    key: string,
    index: number,
    unique: boolean,
  ): string {
    const base =
      parentPath === "" ? `/${key}` : `${parentPath}/children/${key}`;
    return unique ? base : `${base}/${index}`;
  }
}

class ParamParser {
  static parse(rawParam: RawParam, parentPath: string): Param {
    return {
      path: PathBuilder.buildParamPath(parentPath, rawParam.index),
      display_name: rawParam.display_name,
      desc: rawParam.desc,
      type: rawParam.type,
      is_required: rawParam.is_required,
      default: rawParam.default,
      value: rawParam.value,
    };
  }
}

class ConfigElementParser {
  static parseItem(
    rawItem: RawConfigElement,
    parentPath: string,
    key: string,
    index: number,
  ): ConfigItem {
    const itemPath = PathBuilder.buildElementPath(
      parentPath,
      key,
      index,
      rawItem.unique,
    );
    return {
      path: itemPath,
      display_name: rawItem.display_name,
      desc: rawItem.desc,
      params: (rawItem.params || []).map((param) =>
        ParamParser.parse(param, itemPath),
      ),
    };
  }

  static parseBlock(
    rawBlock: RawConfigElement,
    parentPath: string,
    key?: string,
    index?: number,
  ): ConfigBlock {
    const blockPath =
      key !== undefined && index !== undefined
        ? PathBuilder.buildElementPath(parentPath, key, index, rawBlock.unique)
        : parentPath;

    const block: ConfigBlock = {
      path: blockPath,
      display_name: rawBlock.display_name,
      desc: rawBlock.desc,
      params: (rawBlock.params || []).map((param) =>
        ParamParser.parse(param, blockPath),
      ),
      configItems: [],
      children: {},
    };

    if (rawBlock.children) {
      this.parseChildren(rawBlock.children, block, blockPath);
    }

    return block;
  }

  private static parseChildren(
    children: Record<string, RawConfigElement[]>,
    parentBlock: ConfigBlock,
    parentPath: string,
  ): void {
    Object.entries(children).forEach(([childKey, childArray]) => {
      if (!Array.isArray(childArray)) return;

      childArray.forEach((child, index) => {
        if (!child) return;

        if (child.is_block) {
          this.parseChildBlock(child, parentBlock, parentPath, childKey, index);
        } else {
          parentBlock.configItems.push(
            this.parseItem(child, parentPath, childKey, index),
          );
        }
      });
    });
  }

  private static parseChildBlock(
    child: RawConfigElement,
    parentBlock: ConfigBlock,
    parentPath: string,
    childKey: string,
    index: number,
  ): void {
    const childBlock = this.parseBlock(child, parentPath, childKey, index);
    if (!parentBlock.children[childKey]) {
      parentBlock.children[childKey] = [];
    }
    parentBlock.children[childKey].push(childBlock);
  }
}

class RootConfigParser {
  static parse(rawConfig: RawConfig): ConfigBlock {
    const rootBlock: ConfigBlock = {
      path: "",
      display_name: { "zh-tw": "根" },
      desc: { "zh-tw": "" },
      params: [],
      configItems: [],
      children: {},
    };

    if (!rawConfig) return rootBlock;

    Object.entries(rawConfig).forEach(([key, rawElement]) => {
      if (!rawElement) return;

      if (rawElement.is_block) {
        const block = ConfigElementParser.parseBlock(rawElement, "", key, 0);
        if (!rootBlock.children[key]) {
          rootBlock.children[key] = [];
        }
        rootBlock.children[key].push(block);
      } else {
        const globalItem = ConfigElementParser.parseItem(
          rawElement,
          "",
          key,
          0,
        );
        rootBlock.configItems.push(globalItem);
      }
    });

    return rootBlock;
  }
}

export function parseRawConfig(rawConfig: RawConfig): ConfigBlock {
  return RootConfigParser.parse(rawConfig);
}
