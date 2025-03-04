
import { useState } from "react";

export const useUniversityCreation = (supabase: any) => {
  const [universidadeLoading, setUniversidadeLoading] = useState(false);

  const verificaECriaUniversidade = async (sigla: string) => {
    if (universidadeLoading) return null;

    setUniversidadeLoading(true);
    try {
      // Verifica se a universidade já existe
      const { data: existingUni, error: checkError } = await supabase
        .from("universidades")
        .select("id")
        .eq("sigla", sigla)
        .maybeSingle();

      if (checkError) {
        console.error("Erro ao verificar universidade:", checkError);
        return null;
      }

      // Se a universidade não existir, criamos uma nova
      if (!existingUni) {
        console.log(`Universidade com sigla ${sigla} não encontrada. Criando uma nova.`);

        // Mapeamento das siglas para nomes completos
        const uniNomes: Record<string, [string, string, string]> = {
          usp: ["Universidade de São Paulo", "São Paulo", "SP"],
          unicamp: ["Universidade Estadual de Campinas", "Campinas", "SP"],
          ufrj: ["Universidade Federal do Rio de Janeiro", "Rio de Janeiro", "RJ"],
          unb: ["Universidade de Brasília", "Brasília", "DF"],
          ufmg: ["Universidade Federal de Minas Gerais", "Belo Horizonte", "MG"],
          ufsc: ["Universidade Federal de Santa Catarina", "Florianópolis", "SC"],
          ufrgs: ["Universidade Federal do Rio Grande do Sul", "Porto Alegre", "RS"],
          ufc: ["Universidade Federal do Ceará", "Fortaleza", "CE"],
          ufba: ["Universidade Federal da Bahia", "Salvador", "BA"],
        };

        if (!uniNomes[sigla]) {
          console.error(`Não foi possível mapear a sigla ${sigla} para um nome de universidade`);
          return null;
        }

        const [nome, cidade, estado] = uniNomes[sigla];

        // Inserir a nova universidade
        const { data: newUni, error: insertError } = await supabase
          .from("universidades")
          .insert({
            nome,
            sigla,
            cidade,
            estado,
          })
          .select("id")
          .single();

        if (insertError) {
          console.error("Erro ao criar universidade:", insertError);
          return null;
        }

        console.log(`Universidade ${nome} (${sigla}) criada com sucesso!`);
        return newUni.id;
      } else {
        console.log(`Universidade com sigla ${sigla} encontrada.`);
        return existingUni.id;
      }
    } catch (error) {
      console.error("Erro ao verificar/criar universidade:", error);
      return null;
    } finally {
      setUniversidadeLoading(false);
    }
  };

  return {
    universidadeLoading,
    verificaECriaUniversidade,
  };
};
