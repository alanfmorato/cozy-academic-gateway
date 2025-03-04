
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Building, School } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { signUp } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [university, setUniversity] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("estudante");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [exploringUniversities, setExploringUniversities] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!fullName || !email || (!university && !exploringUniversities) || !password) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos"
      });
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres"
      });
      setIsLoading(false);
      return;
    }

    await signUp({
      email,
      password,
      full_name: fullName,
      university: exploringUniversities ? "explorando" : university,
      tipo_usuario: tipoUsuario
    });
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="p-8 space-y-6"
    >
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Crie sua conta</h1>
        <p className="text-sm text-muted-foreground">
          Junte-se à comunidade acadêmica
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <div className="relative">
            <Input
              id="name"
              type="text"
              placeholder="Seu nome"
              className="pl-10"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-email">E-mail</Label>
          <div className="relative">
            <Input
              id="register-email"
              type="email"
              placeholder="seu@email.com"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="register-password">Senha</Label>
          <div className="relative">
            <Input
              id="register-password"
              type="password"
              placeholder="••••••••"
              className="pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "Cadastrando..." : "Cadastrar"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Já possui uma conta?</span>{" "}
        <Button variant="link" onClick={onSwitchToLogin} className="p-0" disabled={isLoading}>
          Entrar
        </Button>
      </div>
    </motion.div>
  );
};

export default RegisterForm;
