
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface UserTypeSelectorProps {
  tipoUsuario: string;
  setTipoUsuario: (value: string) => void;
  isLoading: boolean;
}

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({
  tipoUsuario,
  setTipoUsuario,
  isLoading
}) => {
  return (
    <div className="space-y-2">
      <Label>Tipo de Usuário</Label>
      <RadioGroup 
        value={tipoUsuario} 
        onValueChange={setTipoUsuario}
        className="flex flex-row space-x-4"
        disabled={isLoading}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="estudante" id="estudante" />
          <Label htmlFor="estudante" className="cursor-pointer">Estudante</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="cursinho" id="cursinho" />
          <Label htmlFor="cursinho" className="cursor-pointer">Cursinho</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default UserTypeSelector;
