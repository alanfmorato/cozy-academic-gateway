
import React from "react";
import { Button } from "@/components/ui/button";

interface FormFooterProps {
  switchText: string;
  switchButtonText: string;
  onSwitch: () => void;
  isLoading: boolean;
}

const FormFooter: React.FC<FormFooterProps> = ({
  switchText,
  switchButtonText,
  onSwitch,
  isLoading
}) => {
  return (
    <div className="text-center text-sm">
      <span className="text-muted-foreground">{switchText}</span>{" "}
      <Button variant="link" onClick={onSwitch} className="p-0" disabled={isLoading}>
        {switchButtonText}
      </Button>
    </div>
  );
};

export default FormFooter;
