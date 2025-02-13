import React from "react";

type ContextMenuStateData = {
  path: string;
  [key: string]: unknown;
};

interface ContextMenuState {
  x: number;
  y: number;
  data: ContextMenuStateData;
}

export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = React.useState<ContextMenuState | null>(
    null,
  );

  const handleContextMenu = (
    e: React.MouseEvent,
    data: ContextMenuStateData,
  ) => {
    e.preventDefault();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      data,
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  return {
    contextMenu,
    handleContextMenu,
    closeContextMenu,
  };
};
