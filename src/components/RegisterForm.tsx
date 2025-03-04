
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { signUp } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [university, setUniversity] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!fullName || !email || !university || !password) {
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
      university
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
          <Label htmlFor="university">Universidade</Label>
          <Select
            value={university}
            onValueChange={setUniversity}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua universidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usp">Universidade de São Paulo</SelectItem>
              <SelectItem value="unicamp">Universidade Estadual de Campinas</SelectItem>
              <SelectItem value="ufrj">Universidade Federal do Rio de Janeiro</SelectItem>
              <SelectItem value="unb">Universidade de Brasília</SelectItem>
              <SelectItem value="ufmg">Universidade Federal de Minas Gerais</SelectItem>
            </SelectContent>
          </Select>
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
