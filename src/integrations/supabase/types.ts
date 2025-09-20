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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      biblioteca: {
        Row: {
          conteudo: string | null
          created_at: string
          id: string
          materia: string
          resumo: string | null
          tipo: string
          titulo: string
          url: string | null
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          id?: string
          materia: string
          resumo?: string | null
          tipo: string
          titulo: string
          url?: string | null
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          id?: string
          materia?: string
          resumo?: string | null
          tipo?: string
          titulo?: string
          url?: string | null
        }
        Relationships: []
      }
      chats_ia: {
        Row: {
          created_at: string
          id: string
          materia: string | null
          pergunta: string
          resposta: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          materia?: string | null
          pergunta: string
          resposta?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          materia?: string | null
          pergunta?: string
          resposta?: string | null
          user_id?: string
        }
        Relationships: []
      }
      essays: {
        Row: {
          created_at: string | null
          feedback: string | null
          id: string
          score: number | null
          tema: string
          texto: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          score?: number | null
          tema: string
          texto: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          score?: number | null
          tema?: string
          texto?: string
          user_id?: string
        }
        Relationships: []
      }
      planos_estudos: {
        Row: {
          created_at: string
          id: string
          meta_semanal: Json | null
          progresso_semanal: number | null
          tarefas: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meta_semanal?: Json | null
          progresso_semanal?: number | null
          tarefas?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meta_semanal?: Json | null
          progresso_semanal?: number | null
          tarefas?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      progresso: {
        Row: {
          acertos_percent: number | null
          created_at: string
          data_atividade: string
          horas: number | null
          id: string
          materia: string
          user_id: string
        }
        Insert: {
          acertos_percent?: number | null
          created_at?: string
          data_atividade?: string
          horas?: number | null
          id?: string
          materia: string
          user_id: string
        }
        Update: {
          acertos_percent?: number | null
          created_at?: string
          data_atividade?: string
          horas?: number | null
          id?: string
          materia?: string
          user_id?: string
        }
        Relationships: []
      }
      questoes: {
        Row: {
          alternativas: Json
          created_at: string
          dificuldade: number | null
          enunciado: string
          id: string
          materia: string
          resposta_correta: string
        }
        Insert: {
          alternativas: Json
          created_at?: string
          dificuldade?: number | null
          enunciado: string
          id?: string
          materia: string
          resposta_correta: string
        }
        Update: {
          alternativas?: Json
          created_at?: string
          dificuldade?: number | null
          enunciado?: string
          id?: string
          materia?: string
          resposta_correta?: string
        }
        Relationships: []
      }
      redacoes: {
        Row: {
          competencia_1: number | null
          competencia_2: number | null
          competencia_3: number | null
          competencia_4: number | null
          competencia_5: number | null
          created_at: string
          feedback_ia: string | null
          id: string
          nota: number | null
          tema: string
          texto: string
          user_id: string
        }
        Insert: {
          competencia_1?: number | null
          competencia_2?: number | null
          competencia_3?: number | null
          competencia_4?: number | null
          competencia_5?: number | null
          created_at?: string
          feedback_ia?: string | null
          id?: string
          nota?: number | null
          tema: string
          texto: string
          user_id: string
        }
        Update: {
          competencia_1?: number | null
          competencia_2?: number | null
          competencia_3?: number | null
          competencia_4?: number | null
          competencia_5?: number | null
          created_at?: string
          feedback_ia?: string | null
          id?: string
          nota?: number | null
          tema?: string
          texto?: string
          user_id?: string
        }
        Relationships: []
      }
      simulados: {
        Row: {
          acertos: number | null
          acertos_percent: number | null
          created_at: string
          id: string
          materia: string | null
          questoes_count: number
          tempo_gasto: number | null
          tipo: string
          user_id: string
        }
        Insert: {
          acertos?: number | null
          acertos_percent?: number | null
          created_at?: string
          id?: string
          materia?: string | null
          questoes_count: number
          tempo_gasto?: number | null
          tipo: string
          user_id: string
        }
        Update: {
          acertos?: number | null
          acertos_percent?: number | null
          created_at?: string
          id?: string
          materia?: string | null
          questoes_count?: number
          tempo_gasto?: number | null
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      study_plans: {
        Row: {
          created_at: string | null
          focus_area: string
          id: string
          plan_content: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          focus_area: string
          id?: string
          plan_content: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          focus_area?: string
          id?: string
          plan_content?: string
          user_id?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          created_at: string
          id: string
          is_premium: boolean | null
          nome: string
          objetivo: string | null
          plano: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_premium?: boolean | null
          nome: string
          objetivo?: string | null
          plano?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_premium?: boolean | null
          nome?: string
          objetivo?: string | null
          plano?: string | null
          updated_at?: string
          user_id?: string
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
