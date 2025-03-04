
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User } from "lucide-react";
import FormHeader from "@/components/forms/register/FormHeader";
import InputWithIcon from "@/components/forms/common/InputWithIcon";
import UniversitySelector from "@/components/forms/register/UniversitySelector";
import UserTypeSelector from "@/components/forms/register/UserTypeSelector";
import FormFooter from "@/components/forms/register/FormFooter";
import { useRegisterForm } from "@/components/forms/register/useRegisterForm";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const {
    fullName,
    setFullName,
    email,
    setEmail,
    university,
    setUniversity,
    tipoUsuario,
    setTipoUsuario,
    password,
    setPassword,
    isLoading,
    exploringUniversities,
    setExploringUniversities,
    handleSubmit
  } = useRegisterForm();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="p-8 space-y-6"
    >
      <FormHeader 
        title="Crie sua conta" 
        subtitle="Junte-se à comunidade acadêmica" 
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputWithIcon
          id="name"
          label="Nome completo"
          type="text"
          placeholder="Seu nome"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={isLoading}
          icon={<User className="h-4 w-4" />}
        />

        <InputWithIcon
          id="register-email"
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          icon={<Mail className="h-4 w-4" />}
        />

        <UniversitySelector
          university={university}
          setUniversity={setUniversity}
          exploringUniversities={exploringUniversities}
          setExploringUniversities={setExploringUniversities}
          isLoading={isLoading}
        />

        <UserTypeSelector
          tipoUsuario={tipoUsuario}
          setTipoUsuario={setTipoUsuario}
          isLoading={isLoading}
        />

        <InputWithIcon
          id="register-password"
          label="Senha"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          icon={<Lock className="h-4 w-4" />}
        />

        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "Cadastrando..." : "Cadastrar"}
        </Button>
      </form>

      <FormFooter
        switchText="Já possui uma conta?"
        switchButtonText="Entrar"
        onSwitch={onSwitchToLogin}
        isLoading={isLoading}
      />
    </motion.div>
  );
};

export default RegisterForm;
