export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          username: string
          email: string
          phone: string | null
          telegram_username: string | null
          role: "student" | "author"
          is_admin: boolean
          bio: string | null
          specializations: string[] | null
          bonus_balance: number
          referral_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          email: string
          phone?: string | null
          telegram_username?: string | null
          role?: "student" | "author"
          is_admin?: boolean
          bio?: string | null
          specializations?: string[] | null
          bonus_balance?: number
          referral_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          email?: string
          phone?: string | null
          telegram_username?: string | null
          role?: "student" | "author"
          is_admin?: boolean
          bio?: string | null
          specializations?: string[] | null
          bonus_balance?: number
          referral_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          id: string
          key: string
          label: string
          value: Json
          updated_at: string | null
        }
        Insert: {
          id?: string
          key: string
          label: string
          value: Json
          updated_at?: string | null
        }
        Update: {
          id?: string
          key?: string
          label?: string
          value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          student_id: string
          author_id: string | null
          work_type: string
          subject: string
          deadline_days: number
          title: string | null
          description: string | null
          price: number
          payment_id: string | null
          payment_status: string | null
          status:
            | "pending_payment"
            | "paid"
            | "in_progress"
            | "review"
            | "revision"
            | "completed"
            | "cancelled"
            | "disputed"
          deadline_date: string | null
          accepted_at: string | null
          submitted_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
          student_rating: number | null
          student_review: string | null
        }
        Insert: {
          id?: string
          student_id: string
          author_id?: string | null
          work_type: string
          subject: string
          deadline_days: number
          title?: string | null
          description?: string | null
          price: number
          payment_id?: string | null
          payment_status?: string | null
          status?: "pending_payment" | "paid" | "in_progress" | "review" | "revision" | "completed" | "cancelled" | "disputed"
          deadline_date?: string | null
          accepted_at?: string | null
          submitted_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
          student_rating?: number | null
          student_review?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          author_id?: string | null
          work_type?: string
          subject?: string
          deadline_days?: number
          title?: string | null
          description?: string | null
          price?: number
          payment_id?: string | null
          payment_status?: string | null
          status?: "pending_payment" | "paid" | "in_progress" | "review" | "revision" | "completed" | "cancelled" | "disputed"
          deadline_date?: string | null
          accepted_at?: string | null
          submitted_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
          student_rating?: number | null
          student_review?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      order_messages: {
        Row: {
          id: string
          order_id: string
          sender_id: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          sender_id: string
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          sender_id?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_messages_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      order_files: {
        Row: {
          id: string
          order_id: string
          uploader_id: string
          file_name: string
          file_url: string
          file_size: number | null
          file_type: "requirement" | "result"
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          uploader_id: string
          file_name: string
          file_url: string
          file_size?: number | null
          file_type: "requirement" | "result"
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          uploader_id?: string
          file_name?: string
          file_url?: string
          file_size?: number | null
          file_type?: "requirement" | "result"
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          body: string
          is_read: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          body: string
          is_read?: boolean
          link?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          body?: string
          is_read?: boolean
          link?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_author_stats: {
        Args: { p_author_id: string }
        Returns: {
          total_orders: number
          completed_orders: number
          total_earned: number
          avg_rating: number
        }[]
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
