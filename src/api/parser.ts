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
    unique: boolean
  ): string {
    return unique ? `${parentPath}/${key}` : `${parentPath}/${key}/${index}`;
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
    const itemPath = PathBuilder.buildElementPath(parentPath, key, index, rawItem.unique);
    return {
      path: itemPath,
      display_name: rawItem.display_name,
      desc: rawItem.desc,
      params: rawItem.params.map((param) => ParamParser.parse(param, itemPath)),
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
      params: rawBlock.params.map((param) =>
        ParamParser.parse(param, blockPath),
      ),
      configItems: [],
      childrenBlocks: {},
    };

    if (rawBlock.children) {
      this.parseChildren(rawBlock.children, block, `${blockPath}/children`);
    }

    return block;
  }

  private static parseChildren(
    children: Record<string, RawConfigElement[]>,
    parentBlock: ConfigBlock,
    parentPath: string,
  ): void {
    Object.entries(children).forEach(([childKey, childArray]) => {
      childArray.forEach((child, index) => {
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
    if (!parentBlock.childrenBlocks[childKey]) {
      parentBlock.childrenBlocks[childKey] = [];
    }
    parentBlock.childrenBlocks[childKey].push(childBlock);
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
      childrenBlocks: {},
    };

    Object.entries(rawConfig).forEach(([key, rawElement]) => {
      if (rawElement.is_block) {
        this.parseRootBlock(rawElement, rootBlock, key);
      } else {
        rootBlock.configItems.push(
          ConfigElementParser.parseItem(rawElement, "", key, 0),
        );
      }
    });

    return rootBlock;
  }

  private static parseRootBlock(
    rawElement: RawConfigElement,
    rootBlock: ConfigBlock,
    key: string,
  ): void {
    const block = ConfigElementParser.parseBlock(rawElement, "", key, 0);
    if (!rootBlock.childrenBlocks[key]) {
      rootBlock.childrenBlocks[key] = [];
    }
    rootBlock.childrenBlocks[key].push(block);
  }
}

export function parseRawConfig(rawConfig: RawConfig): ConfigBlock {
  return RootConfigParser.parse(rawConfig);
}
