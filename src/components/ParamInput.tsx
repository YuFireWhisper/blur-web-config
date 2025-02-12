import { Input, Switch } from "@heroui/react";
import { Param } from "../api/types";

interface ParamInputProps {
  param: Param;
  value: string;
  onChange: (value: string) => void;
}

export const ParamInput = ({ param, value, onChange }: ParamInputProps) => {
  if (param.type === "bool") {
    const boolValue = value === "true" || value === "on";
    return (
      <Switch
        isSelected={boolValue}
        onValueChange={(newVal) => onChange(newVal ? "true" : "false")}
        aria-label="Switch"
      />
    );
  }

  return <Input value={value} onValueChange={onChange} />;
};

