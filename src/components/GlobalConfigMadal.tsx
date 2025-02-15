import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { ConfigForm } from "./ConfigForm";
import { ConfigBlock } from "../api/types";
import { useConfigValue } from "../api/hooks/useConfigValue";
import { useConfigState } from "./hooks/useConfigStatus";

export const GlobalConfigModal = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { value } = useConfigValue<ConfigBlock>("other/0");
  const { states, actions } = useConfigState(value, "other");
  const state = states["other"];

  if (!value || !state) return null;

  return (
    <>
      <Button onPress={onOpen}>Open Modal</Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col justify-center text-3xl py-[1vw]">
                全局設定
              </ModalHeader>
              <ModalBody>
                <ConfigForm
                  configBlock={value}
                  editedValues={state.editedValues}
                  onChange={(path, value) =>
                    actions.handleParamChange("other", path, value)
                  }
                  onSave={() => actions.handleSave("other")}
                  hasChanges={actions.hasChanges("other")}
                  isSaving={state.isSaving}
                />
              </ModalBody>
              <ModalFooter>
                <Button onPress={onClose}>Close</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
