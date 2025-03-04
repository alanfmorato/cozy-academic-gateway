
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
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

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <div className="relative">
            <Input
              id="name"
              type="text"
              placeholder="Seu nome"
              className="pl-10"
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
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="university">Universidade</Label>
          <Select>
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
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      <Button className="w-full">
        Cadastrar
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Já possui uma conta?</span>{" "}
        <Button variant="link" onClick={onSwitchToLogin} className="p-0">
          Entrar
        </Button>
      </div>
    </motion.div>
  );
};

export default RegisterForm;
