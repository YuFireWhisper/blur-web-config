import React from "react";
import { CircularProgress } from "@heroui/react";

export const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <CircularProgress label="加載中..." size="lg" />
  </div>
);
