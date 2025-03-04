
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { signUp } from "@/lib/auth";

export const useRegisterForm = () => {
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

  return {
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
  };
};
