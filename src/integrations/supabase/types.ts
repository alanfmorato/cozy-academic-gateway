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
      avaliacoes_caronas: {
        Row: {
          avaliado_id: string
          avaliador_id: string
          carona_id: string
          comentario: string | null
          created_at: string
          id: string
          nota: number
        }
        Insert: {
          avaliado_id: string
          avaliador_id: string
          carona_id: string
          comentario?: string | null
          created_at?: string
          id?: string
          nota: number
        }
        Update: {
          avaliado_id?: string
          avaliador_id?: string
          carona_id?: string
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
          forma_pagamento: string
          horario_saida: string
          id?: string
          local_chegada: string
          local_saida: string
          observacoes?: string | null
          qtd_vagas: number
          status?: string
          updated_at?: string
          usuario_id: string
          valor_vaga: number
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
          status: string | null
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
          status?: string | null
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
          status?: string | null
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
      course_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          course_id: string
          id: string
          price_paid: number
          progress: Json | null
          purchased_at: string
          status: string
          user_id: string
        }
        Insert: {
          course_id: string
          id?: string
          price_paid: number
          progress?: Json | null
          purchased_at?: string
          status?: string
          user_id: string
        }
        Update: {
          course_id?: string
          id?: string
          price_paid?: number
          progress?: Json | null
          purchased_at?: string
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
          duration: number | null
          id: string
          module_id: string
          order_num: number
          title: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          module_id: string
          order_num: number
          title: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          module_id?: string
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
          course_id: string
          created_at: string
          description: string | null
          file_type: string
          file_url: string
          id: string
          lesson_id: string | null
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          file_type: string
          file_url: string
          id?: string
          lesson_id?: string | null
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          file_type?: string
          file_url?: string
          id?: string
          lesson_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_materials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
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
          course_id: string
          created_at: string
          description: string | null
          id: string
          order_num: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          order_num: number
          title: string
        }
        Update: {
          course_id?: string
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
      course_reviews: {
        Row: {
          comment: string | null
          course_id: string
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          course_id: string
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          course_id?: string
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey"
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
          created_by: string
          description: string
          difficulty_level: string
          duration: number
          id: string
          is_published: boolean | null
          language: string
          preview_video_url: string | null
          price: number
          thumbnail_url: string | null
          title: string
          universidade_id: string | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by: string
          description: string
          difficulty_level: string
          duration: number
          id?: string
          is_published?: boolean | null
          language: string
          preview_video_url?: string | null
          price?: number
          thumbnail_url?: string | null
          title: string
          universidade_id?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string
          description?: string
          difficulty_level?: string
          duration?: number
          id?: string
          is_published?: boolean | null
          language?: string
          preview_video_url?: string | null
          price?: number
          thumbnail_url?: string | null
          title?: string
          universidade_id?: string | null
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
          {
            foreignKeyName: "courses_universidade_id_fkey"
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
      materiais: {
        Row: {
          arquivo_url: string | null
          created_at: string
          curso_id: string | null
          descricao: string | null
          id: string
          status: string | null
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
          status?: string | null
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
          status?: string | null
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
      mensagens_caronas: {
        Row: {
          carona_id: string
          created_at: string
          destinatario_id: string
          id: string
          lida: boolean
          mensagem: string
          remetente_id: string
        }
        Insert: {
          carona_id: string
          created_at?: string
          destinatario_id: string
          id?: string
          lida?: boolean
          mensagem: string
          remetente_id: string
        }
        Update: {
          carona_id?: string
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
          status: string | null
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
          status?: string | null
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
          status?: string | null
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
      reservas_caronas: {
        Row: {
          carona_id: string
          created_at: string
          id: string
          status: string
          updated_at: string
          usuario_id: string
        }
        Insert: {
          carona_id: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          usuario_id: string
        }
        Update: {
          carona_id?: string
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
      get_course_avg_rating: {
        Args: {
          course_id: string
        }
        Returns: number
      }
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
