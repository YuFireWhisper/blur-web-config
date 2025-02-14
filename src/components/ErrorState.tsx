import React from "react";
import { Alert } from "@heroui/react";

interface ErrorStateProps {
  message: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message }) => (
  <div className="p-[1vw]">
    <Alert description={message} title="Error" color="danger" radius="lg" />
  </div>
);
