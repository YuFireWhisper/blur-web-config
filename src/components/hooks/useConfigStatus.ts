import { useState, useEffect } from "react";
import { ConfigBlock } from "../../api/types";
import { useConfigApi } from "../../api/hooks/useConfigApi";

interface ConfigStateEntry {
  editedValues: Record<string, string>;
  savedValues: Record<string, string>;
  isSaving: boolean;
  identifier: string;
}

interface ConfigActions {
  handleParamChange: (
    identifier: string,
    path: string,
    newValue: string,
  ) => void;
  handleSave: (identifier: string) => Promise<void>;
  hasChanges: (identifier: string) => boolean;
}

type UseConfigStateResult = {
  states: Record<string, ConfigStateEntry>;
  actions: ConfigActions;
  hasSingleState: boolean;
};

export const useConfigState = (
  config: ConfigBlock | ConfigBlock[] | undefined,
  identifierPrefix = "config",
): UseConfigStateResult => {
  const [states, setStates] = useState<Record<string, ConfigStateEntry>>({});
  const { updateConfig } = useConfigApi();

  const getInitialValues = (configBlock: ConfigBlock) => {
    return (
      configBlock.configItems?.reduce(
        (acc, item) => {
          item.params?.forEach((param) => {
            if (param?.path) {
              acc[param.path] = param.value ?? "";
            }
          });
          return acc;
        },
        {} as Record<string, string>,
      ) ?? {}
    );
  };

  useEffect(() => {
    if (!config) return;

    const configBlocks = Array.isArray(config) ? config : [config];
    const newStates = configBlocks.reduce(
      (acc, block, index) => {
        const initial = getInitialValues(block);
        const identifier = Array.isArray(config)
          ? `${identifierPrefix}-${index}`
          : identifierPrefix;

        acc[identifier] = {
          editedValues: initial,
          savedValues: initial,
          isSaving: false,
          identifier,
        };
        return acc;
      },
      {} as Record<string, ConfigStateEntry>,
    );

    setStates(newStates);
  }, [config, identifierPrefix]);

  const handleParamChange = (
    identifier: string,
    path: string,
    newValue: string,
  ) => {
    setStates((prev) => ({
      ...prev,
      [identifier]: {
        ...prev[identifier],
        editedValues: {
          ...prev[identifier].editedValues,
          [path]: newValue,
        },
      },
    }));
  };

  const handleSave = async (identifier: string) => {
    const state = states[identifier];
    if (!state) return;

    setStates((prev) => ({
      ...prev,
      [identifier]: { ...prev[identifier], isSaving: true },
    }));

    const changedParams = Object.entries(state.editedValues)
      .filter(([path, value]) => value !== state.savedValues[path])
      .map(([path, value]) => ({ path, newValue: value }));

    try {
      await Promise.all(
        changedParams.map(({ path, newValue }) =>
          updateConfig(path + "/value", newValue),
        ),
      );

      setStates((prev) => ({
        ...prev,
        [identifier]: {
          ...prev[identifier],
          savedValues: { ...prev[identifier].editedValues },
          isSaving: false,
        },
      }));
    } catch (e) {
      console.error("Failed to save changes", e);
      setStates((prev) => ({
        ...prev,
        [identifier]: { ...prev[identifier], isSaving: false },
      }));
    }
  };

  const hasChanges = (identifier: string) => {
    const state = states[identifier];
    if (!state) return false;

    return Object.keys(state.editedValues).some(
      (key) => state.editedValues[key] !== state.savedValues[key],
    );
  };

  const hasSingleState = Object.keys(states).length === 1;
  const actions = { handleParamChange, handleSave, hasChanges };

  return { states, actions, hasSingleState };
};
