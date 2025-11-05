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
      base_datos_cientifica: {
        Row: {
          created_at: string | null
          descripcion: string
          editores: string[] | null
          enlace: string
          id: string
          materias: string[] | null
          modo_acceso: string
          tipos: string[]
          titulo: string
        }
        Insert: {
          created_at?: string | null
          descripcion: string
          editores?: string[] | null
          enlace: string
          id?: string
          materias?: string[] | null
          modo_acceso: string
          tipos: string[]
          titulo: string
        }
        Update: {
          created_at?: string | null
          descripcion?: string
          editores?: string[] | null
          enlace?: string
          id?: string
          materias?: string[] | null
          modo_acceso?: string
          tipos?: string[]
          titulo?: string
        }
        Relationships: []
      }
      libros: {
        Row: {
          autor: string
          categoria: string
          created_at: string | null
          descripcion: string | null
          editorial: string | null
          estado: string
          id: string
          imagen_url: string | null
          isbn: string
          titulo: string
        }
        Insert: {
          autor: string
          categoria: string
          created_at?: string | null
          descripcion?: string | null
          editorial?: string | null
          estado?: string
          id?: string
          imagen_url?: string | null
          isbn: string
          titulo: string
        }
        Update: {
          autor?: string
          categoria?: string
          created_at?: string | null
          descripcion?: string | null
          editorial?: string | null
          estado?: string
          id?: string
          imagen_url?: string | null
          isbn?: string
          titulo?: string
        }
        Relationships: []
      }
      prestamos: {
        Row: {
          created_at: string | null
          estado: string
          fecha_devolucion: string | null
          fecha_prestamo: string | null
          id: string
          libro_id: string
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          estado?: string
          fecha_devolucion?: string | null
          fecha_prestamo?: string | null
          id?: string
          libro_id: string
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          estado?: string
          fecha_devolucion?: string | null
          fecha_prestamo?: string | null
          id?: string
          libro_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prestamos_libro_id_fkey"
            columns: ["libro_id"]
            isOneToOne: false
            referencedRelation: "libros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prestamos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nombre: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          nombre: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      reservas: {
        Row: {
          created_at: string | null
          estado: string
          fecha: string
          hora_fin: string
          hora_inicio: string
          id: string
          sala_id: string
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          estado?: string
          fecha: string
          hora_fin: string
          hora_inicio: string
          id?: string
          sala_id: string
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          estado?: string
          fecha?: string
          hora_fin?: string
          hora_inicio?: string
          id?: string
          sala_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservas_sala_id_fkey"
            columns: ["sala_id"]
            isOneToOne: false
            referencedRelation: "salas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      salas: {
        Row: {
          campus: string
          capacidad: number
          created_at: string | null
          id: string
          nombre_sala: string
          tiene_asiento_accesible: boolean | null
          tiene_energia: boolean | null
          tipo: string
        }
        Insert: {
          campus: string
          capacidad: number
          created_at?: string | null
          id?: string
          nombre_sala: string
          tiene_asiento_accesible?: boolean | null
          tiene_energia?: boolean | null
          tipo: string
        }
        Update: {
          campus?: string
          capacidad?: number
          created_at?: string | null
          id?: string
          nombre_sala?: string
          tiene_asiento_accesible?: boolean | null
          tiene_energia?: boolean | null
          tipo?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_sala_disponible: {
        Args: {
          p_fecha: string
          p_hora_fin: string
          p_hora_inicio: string
          p_sala_id: string
        }
        Returns: boolean
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
