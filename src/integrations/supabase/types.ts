export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bolsas_auxilios: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
          universidade_id: string
          updated_at: string
          valor: number | null
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          universidade_id: string
          updated_at?: string
          valor?: number | null
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          universidade_id?: string
          updated_at?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bolsas_auxilios_universidade_id_fkey"
            columns: ["universidade_id"]
            isOneToOne: false
            referencedRelation: "universidades"
            referencedColumns: ["id"]
          },
        ]
      }
      compra_venda: {
        Row: {
          created_at: string
          descricao: string
          id: string
          imagens: string[] | null
          titulo: string
          universidade_id: string
          updated_at: string
          usuario_id: string
          valor: number
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          imagens?: string[] | null
          titulo: string
          universidade_id: string
          updated_at?: string
          usuario_id: string
          valor: number
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          imagens?: string[] | null
          titulo?: string
          universidade_id?: string
          updated_at?: string
          usuario_id?: string
          valor?: number
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compra_venda_universidade_id_fkey"
            columns: ["universidade_id"]
            isOneToOne: false
            referencedRelation: "universidades"
            referencedColumns: ["id"]
          },
        ]
      }
      cursos: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
          nota_corte_sisu: number | null
          universidade_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          nota_corte_sisu?: number | null
          universidade_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          nota_corte_sisu?: number | null
          universidade_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cursos_universidade_id_fkey"
            columns: ["universidade_id"]
            isOneToOne: false
            referencedRelation: "universidades"
            referencedColumns: ["id"]
          },
        ]
      }
      estagios: {
        Row: {
          created_at: string
          descricao: string
          empresa: string
          id: string
          remuneracao: number | null
          requisitos: string | null
          universidade_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao: string
          empresa: string
          id?: string
          remuneracao?: number | null
          requisitos?: string | null
          universidade_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string
          empresa?: string
          id?: string
          remuneracao?: number | null
          requisitos?: string | null
          universidade_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estagios_universidade_id_fkey"
            columns: ["universidade_id"]
            isOneToOne: false
            referencedRelation: "universidades"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          created_at: string
          data_hora: string
          descricao: string
          id: string
          localizacao: string | null
          tipo_evento: string | null
          titulo: string
          universidade_id: string
          updated_at: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          data_hora: string
          descricao: string
          id?: string
          localizacao?: string | null
          tipo_evento?: string | null
          titulo: string
          universidade_id: string
          updated_at?: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          data_hora?: string
          descricao?: string
          id?: string
          localizacao?: string | null
          tipo_evento?: string | null
          titulo?: string
          universidade_id?: string
          updated_at?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_universidade_id_fkey"
            columns: ["universidade_id"]
            isOneToOne: false
            referencedRelation: "universidades"
            referencedColumns: ["id"]
          },
        ]
      }
      materiais: {
        Row: {
          arquivo_url: string | null
          created_at: string
          curso_id: string | null
          descricao: string | null
          id: string
          titulo: string
          universidade_id: string
          updated_at: string
          usuario_id: string
          whatsapp: string | null
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string
          curso_id?: string | null
          descricao?: string | null
          id?: string
          titulo: string
          universidade_id: string
          updated_at?: string
          usuario_id: string
          whatsapp?: string | null
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string
          curso_id?: string | null
          descricao?: string | null
          id?: string
          titulo?: string
          universidade_id?: string
          updated_at?: string
          usuario_id?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "materiais_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materiais_universidade_id_fkey"
            columns: ["universidade_id"]
            isOneToOne: false
            referencedRelation: "universidades"
            referencedColumns: ["id"]
          },
        ]
      }
      moradias: {
        Row: {
          created_at: string
          descricao: string
          id: string
          imagens: string[] | null
          localizacao: string | null
          qtd_moradores: number | null
          servicos: string | null
          universidade_id: string
          updated_at: string
          usuario_id: string
          valor_mensal: number
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          imagens?: string[] | null
          localizacao?: string | null
          qtd_moradores?: number | null
          servicos?: string | null
          universidade_id: string
          updated_at?: string
          usuario_id: string
          valor_mensal: number
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          imagens?: string[] | null
          localizacao?: string | null
          qtd_moradores?: number | null
          servicos?: string | null
          universidade_id?: string
          updated_at?: string
          usuario_id?: string
          valor_mensal?: number
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moradias_universidade_id_fkey"
            columns: ["universidade_id"]
            isOneToOne: false
            referencedRelation: "universidades"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          foto_perfil: string | null
          full_name: string | null
          id: string
          tipo_usuario: string | null
          universidade_id: string | null
          university: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          foto_perfil?: string | null
          full_name?: string | null
          id: string
          tipo_usuario?: string | null
          universidade_id?: string | null
          university?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          foto_perfil?: string | null
          full_name?: string | null
          id?: string
          tipo_usuario?: string | null
          universidade_id?: string | null
          university?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_universidade_id_fkey"
            columns: ["universidade_id"]
            isOneToOne: false
            referencedRelation: "universidades"
            referencedColumns: ["id"]
          },
        ]
      }
      universidades: {
        Row: {
          cidade: string
          created_at: string
          custo_vida: number | null
          descricao: string | null
          estado: string
          id: string
          nome: string
          recursos_campus: string | null
          sigla: string
          updated_at: string
        }
        Insert: {
          cidade: string
          created_at?: string
          custo_vida?: number | null
          descricao?: string | null
          estado: string
          id?: string
          nome: string
          recursos_campus?: string | null
          sigla: string
          updated_at?: string
        }
        Update: {
          cidade?: string
          created_at?: string
          custo_vida?: number | null
          descricao?: string | null
          estado?: string
          id?: string
          nome?: string
          recursos_campus?: string | null
          sigla?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
