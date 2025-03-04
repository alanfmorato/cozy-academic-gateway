
import React from "react";

interface FormHeaderProps {
  title: string;
  subtitle: string;
}

const FormHeader: React.FC<FormHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="text-center space-y-2">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm text-muted-foreground">
        {subtitle}
      </p>
    </div>
  );
};

export default FormHeader;
