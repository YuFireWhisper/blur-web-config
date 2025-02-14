import React from "react";
import {
  Card,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";

interface CardContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDelete: () => void;
  isDeleteDisabled?: boolean;
}

export const CardContextMenu: React.FC<CardContextMenuProps> = ({
  x,
  y,
  onClose,
  onDelete,
  isDeleteDisabled = false,
}) => {
  const { isOpen, onOpen, onClose: onModalClose } = useDisclosure();

  const handleDelete = () => {
    onModalClose();
    onDelete();
  };

  return (
    <>
      <Card
        className="absolute z-50 bg-white shadow-xl"
        style={{
          left: x,
          top: y,
          minWidth: "180px",
        }}
      >
        <Button
          className="w-full text-left p-3 hover:bg-gray-100 rounded-none text-red-600"
          variant="light"
          onPress={onOpen}
          isDisabled={isDeleteDisabled}
        >
          刪除區塊
        </Button>
      </Card>

      <Modal isOpen={isOpen} onClose={onModalClose}>
        <ModalContent>
          <ModalHeader>確認刪除</ModalHeader>
          <ModalBody>你確定要刪除這個區塊嗎？此操作無法撤銷。</ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onModalClose}>
              取消
            </Button>
            <Button color="danger" onPress={handleDelete}>
              刪除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <div className="fixed inset-0 z-40" onClick={onClose} />
    </>
  );
};

interface AddBlockCardProps {
  className?: string;
  onClick: () => void;
}

export const AddBlockCard: React.FC<AddBlockCardProps> = ({
  onClick,
  className,
}) => (
  <Card
    onPress={onClick}
    className={[
      "group relative overflow-hidden bg-white/80 backdrop-blur cursor-pointer\
      transition-all duration-300 hover:shadow-xl hover:-translate-y-1\
      min-w-[15vw] items-center justify-center border-2 border-dashed border-gray-300",
      className,
    ].join(" ")}
    isPressable
    isBlurred
    isHoverable
  >
    <div className="p-8 flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
        <svg
          className="w-6 h-6 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </div>
      <h2 className="text-xl font-medium text-gray-600 group-hover:text-blue-600">
        新增區塊
      </h2>
    </div>
  </Card>
);
