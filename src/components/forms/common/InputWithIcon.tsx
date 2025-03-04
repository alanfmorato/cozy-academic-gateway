
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputWithIconProps {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  icon: React.ReactNode;
}

const InputWithIcon: React.FC<InputWithIconProps> = ({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  disabled = false,
  icon
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          className="pl-10"
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default InputWithIcon;
