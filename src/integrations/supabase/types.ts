export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      avaliacoes_caronas: {
        Row: {
          avaliado_id: string
          avaliador_id: string
          carona_id: string | null
          comentario: string | null
          created_at: string
          id: string
          nota: number
        }
        Insert: {
          avaliado_id: string
          avaliador_id: string
          carona_id?: string | null
          comentario?: string | null
          created_at?: string
          id?: string
          nota: number
        }
        Update: {
          avaliado_id?: string
          avaliador_id?: string
          carona_id?: string | null
          comentario?: string | null
          created_at?: string
          id?: string
          nota?: number
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_caronas_carona_id_fkey"
            columns: ["carona_id"]
            isOneToOne: false
            referencedRelation: "caronas"
            referencedColumns: ["id"]
          },
        ]
      }
      caronas: {
        Row: {
          created_at: string
          forma_pagamento: string
          horario_saida: string
          id: string
          local_chegada: string
          local_saida: string
          observacoes: string | null
          qtd_vagas: number
          status: string
          updated_at: string
          usuario_id: string
          valor_vaga: number
        }
        Insert: {
          created_at?: string
          forma_pagamento?: string
          horario_saida: string
          id?: string
          local_chegada: string
          local_saida: string
          observacoes?: string | null
          qtd_vagas?: number
          status?: string
          updated_at?: string
          usuario_id: string
          valor_vaga?: number
        }
        Update: {
          created_at?: string
          forma_pagamento?: string
          horario_saida?: string
          id?: string
          local_chegada?: string
          local_saida?: string
          observacoes?: string | null
          qtd_vagas?: number
          status?: string
          updated_at?: string
          usuario_id?: string
          valor_vaga?: number
        }
        Relationships: []
      }
      compra_venda: {
        Row: {
          created_at: string
          descricao: string
          id: string
          imagens: string[] | null
          status: string
          titulo: string
          universidade_id: string | null
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
          status?: string
          titulo: string
          universidade_id?: string | null
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
          status?: string
          titulo?: string
          universidade_id?: string | null
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
      course_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string | null
          enrolled_at: string
          id: string
          progress: number | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id?: string | null
          enrolled_at?: string
          id?: string
          progress?: number | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string | null
          enrolled_at?: string
          id?: string
          progress?: number | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_free: boolean | null
          module_id: string | null
          order_num: number
          title: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean | null
          module_id?: string | null
          order_num?: number
          title: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean | null
          module_id?: string | null
          order_num?: number
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_materials: {
        Row: {
          created_at: string
          file_type: string | null
          file_url: string | null
          id: string
          lesson_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          file_type?: string | null
          file_url?: string | null
          id?: string
          lesson_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          file_type?: string | null
          file_url?: string | null
          id?: string
          lesson_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_materials_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          id: string
          order_num: number
          title: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          order_num?: number
          title: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          order_num?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_ratings: {
        Row: {
          comment: string | null
          course_id: string | null
          created_at: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_ratings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          difficulty_level: string
          duration_minutes: number | null
          id: string
          instructor_id: string
          price: number | null
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string
          duration_minutes?: number | null
          id?: string
          instructor_id: string
          price?: number | null
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string
          duration_minutes?: number | null
          id?: string
          instructor_id?: string
          price?: number | null
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "course_categories"
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
          link_inscricao: string | null
          remuneracao: number | null
          requisitos: string | null
          universidade_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao: string
          empresa: string
          id?: string
          link_inscricao?: string | null
          remuneracao?: number | null
          requisitos?: string | null
          universidade_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string
          empresa?: string
          id?: string
          link_inscricao?: string | null
          remuneracao?: number | null
          requisitos?: string | null
          universidade_id?: string | null
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
          data_evento: string
          descricao: string | null
          id: string
          imagem_url: string | null
          local: string | null
          tipo: string | null
          titulo: string
          universidade_id: string | null
          updated_at: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          data_evento: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          local?: string | null
          tipo?: string | null
          titulo: string
          universidade_id?: string | null
          updated_at?: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          data_evento?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          local?: string | null
          tipo?: string | null
          titulo?: string
          universidade_id?: string | null
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
      favoritos_caronas: {
        Row: {
          created_at: string
          id: string
          motorista_id: string | null
          rota_destino: string | null
          rota_origem: string | null
          usuario_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          motorista_id?: string | null
          rota_destino?: string | null
          rota_origem?: string | null
          usuario_id: string
        }
        Update: {
          created_at?: string
          id?: string
          motorista_id?: string | null
          rota_destino?: string | null
          rota_origem?: string | null
          usuario_id?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string | null
          user_id: string
          watched_seconds: number | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          user_id: string
          watched_seconds?: number | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          user_id?: string
          watched_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
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
          status: string
          titulo: string
          universidade_id: string | null
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
          status?: string
          titulo: string
          universidade_id?: string | null
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
          status?: string
          titulo?: string
          universidade_id?: string | null
          updated_at?: string
          usuario_id?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "materiais_universidade_id_fkey"
            columns: ["universidade_id"]
            isOneToOne: false
            referencedRelation: "universidades"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens_caronas: {
        Row: {
          carona_id: string | null
          created_at: string
          destinatario_id: string
          id: string
          lida: boolean
          mensagem: string
          remetente_id: string
        }
        Insert: {
          carona_id?: string | null
          created_at?: string
          destinatario_id: string
          id?: string
          lida?: boolean
          mensagem: string
          remetente_id: string
        }
        Update: {
          carona_id?: string | null
          created_at?: string
          destinatario_id?: string
          id?: string
          lida?: boolean
          mensagem?: string
          remetente_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_caronas_carona_id_fkey"
            columns: ["carona_id"]
            isOneToOne: false
            referencedRelation: "caronas"
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
          status: string
          universidade_id: string | null
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
          status?: string
          universidade_id?: string | null
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
          status?: string
          universidade_id?: string | null
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
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      reservas_caronas: {
        Row: {
          carona_id: string | null
          created_at: string
          id: string
          status: string
          updated_at: string
          usuario_id: string
        }
        Insert: {
          carona_id?: string | null
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          usuario_id: string
        }
        Update: {
          carona_id?: string | null
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservas_caronas_carona_id_fkey"
            columns: ["carona_id"]
            isOneToOne: false
            referencedRelation: "caronas"
            referencedColumns: ["id"]
          },
        ]
      }
      universidades: {
        Row: {
          created_at: string
          id: string
          nome: string
          sigla: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          sigla: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          sigla?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_course_avg_rating: { Args: { course_uuid: string }; Returns: number }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
