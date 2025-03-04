
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock } from "lucide-react";

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-8 space-y-6"
    >
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Bem-vindo!</h1>
        <p className="text-sm text-muted-foreground">
          Conecte-se ao universo acadêmico
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              className="pl-10"
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-10"
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-right">
            <Button variant="link" className="text-xs p-0 h-auto">
              Esqueci minha senha
            </Button>
          </div>
        </div>
      </div>

      <Button className="w-full">
        Entrar
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Ainda não tem conta?</span>{" "}
        <Button variant="link" onClick={onSwitchToRegister} className="p-0">
          Cadastrar
        </Button>
      </div>
    </motion.div>
  );
};

export default LoginForm;
