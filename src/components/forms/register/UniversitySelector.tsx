
import React from "react";
import { Building, School } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UniversitySelectorProps {
  university: string;
  setUniversity: (value: string) => void;
  exploringUniversities: boolean;
  setExploringUniversities: (value: boolean) => void;
  isLoading: boolean;
}

const UniversitySelector: React.FC<UniversitySelectorProps> = ({
  university,
  setUniversity,
  exploringUniversities,
  setExploringUniversities,
  isLoading
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="university">Universidade</Label>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="exploringUniversities" 
            checked={exploringUniversities} 
            onCheckedChange={(checked) => {
              setExploringUniversities(checked === true);
              if (checked) setUniversity("");
            }}
            disabled={isLoading}
          />
          <Label 
            htmlFor="exploringUniversities" 
            className="text-sm cursor-pointer text-muted-foreground"
          >
            Ainda explorando universidades
          </Label>
        </div>
      </div>
      
      {!exploringUniversities && (
        <div className="relative">
          <Select
            value={university}
            onValueChange={setUniversity}
            disabled={isLoading || exploringUniversities}
          >
            <SelectTrigger className="pl-10">
              <SelectValue placeholder="Selecione sua universidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usp">Universidade de São Paulo</SelectItem>
              <SelectItem value="unicamp">Universidade Estadual de Campinas</SelectItem>
              <SelectItem value="ufrj">Universidade Federal do Rio de Janeiro</SelectItem>
              <SelectItem value="unb">Universidade de Brasília</SelectItem>
              <SelectItem value="ufmg">Universidade Federal de Minas Gerais</SelectItem>
              <SelectItem value="ufsc">Universidade Federal de Santa Catarina</SelectItem>
              <SelectItem value="ufrgs">Universidade Federal do Rio Grande do Sul</SelectItem>
              <SelectItem value="ufc">Universidade Federal do Ceará</SelectItem>
              <SelectItem value="ufba">Universidade Federal da Bahia</SelectItem>
            </SelectContent>
          </Select>
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default UniversitySelector;
