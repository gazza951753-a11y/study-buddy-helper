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
          student_id: string | null
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
            | "new"
            | "pending_payment"
            | "paid"
            | "in_progress"
            | "review"
            | "revision"
            | "completed"
            | "cancelled"
            | "disputed"
          contact_name: string | null
          contact_phone: string | null
          contact_telegram: string | null
          attachment_urls: string[] | null
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
          student_id?: string | null
          author_id?: string | null
          work_type: string
          subject: string
          deadline_days: number
          title?: string | null
          description?: string | null
          price?: number
          payment_id?: string | null
          payment_status?: string | null
          status?: "new" | "pending_payment" | "paid" | "in_progress" | "review" | "revision" | "completed" | "cancelled" | "disputed"
          contact_name?: string | null
          contact_phone?: string | null
          contact_telegram?: string | null
          attachment_urls?: string[] | null
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
          student_id?: string | null
          author_id?: string | null
          work_type?: string
          subject?: string
          deadline_days?: number
          title?: string | null
          description?: string | null
          price?: number
          payment_id?: string | null
          payment_status?: string | null
          status?: "new" | "pending_payment" | "paid" | "in_progress" | "review" | "revision" | "completed" | "cancelled" | "disputed"
          contact_name?: string | null
          contact_phone?: string | null
          contact_telegram?: string | null
          attachment_urls?: string[] | null
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
    }
    Views: {}
    Functions: {
      get_author_stats: {
        Args: { p_author_id: string }
        Returns: {
          total_orders: number
          completed_orders: number
          active_orders: number
          total_earned: number
          avg_rating: number | null
        }[]
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
export type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]
export type Updates<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]
