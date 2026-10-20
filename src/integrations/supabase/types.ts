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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          address: string | null
          admin_notes: string | null
          course_id: string
          created_at: string
          education: string | null
          email: string
          full_name: string
          id: string
          message: string | null
          phone: string
          reference_code: string
          reviewed_at: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          course_id: string
          created_at?: string
          education?: string | null
          email: string
          full_name: string
          id?: string
          message?: string | null
          phone: string
          reference_code?: string
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          course_id?: string
          created_at?: string
          education?: string | null
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          phone?: string
          reference_code?: string
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          bg_color: string
          color: string
          created_at: string
          description_bn: string | null
          description_en: string | null
          icon: string
          id: string
          is_active: boolean
          name_bn: string
          name_en: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          bg_color?: string
          color?: string
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          name_bn: string
          name_en: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          bg_color?: string
          color?: string
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          name_bn?: string
          name_en?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          category_id: string | null
          created_at: string
          description_bn: string | null
          description_en: string | null
          duration_bn: string | null
          duration_en: string | null
          fee: number
          id: string
          image_url: string | null
          instructor_id: string | null
          is_featured: boolean
          is_free: boolean
          is_published: boolean
          is_scholarship: boolean
          level_bn: string | null
          level_en: string | null
          seo_description: string | null
          seo_title: string | null
          short_description_bn: string | null
          short_description_en: string | null
          slug: string
          sort_order: number
          title_bn: string
          title_en: string
          total_classes: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          duration_bn?: string | null
          duration_en?: string | null
          fee?: number
          id?: string
          image_url?: string | null
          instructor_id?: string | null
          is_featured?: boolean
          is_free?: boolean
          is_published?: boolean
          is_scholarship?: boolean
          level_bn?: string | null
          level_en?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_description_bn?: string | null
          short_description_en?: string | null
          slug: string
          sort_order?: number
          title_bn: string
          title_en: string
          total_classes?: number
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          duration_bn?: string | null
          duration_en?: string | null
          fee?: number
          id?: string
          image_url?: string | null
          instructor_id?: string | null
          is_featured?: boolean
          is_free?: boolean
          is_published?: boolean
          is_scholarship?: boolean
          level_bn?: string | null
          level_en?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_description_bn?: string | null
          short_description_en?: string | null
          slug?: string
          sort_order?: number
          title_bn?: string
          title_en?: string
          total_classes?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_items: {
        Row: {
          course_id: string
          created_at: string
          description_bn: string | null
          description_en: string | null
          id: string
          sort_order: number
          title_bn: string
          title_en: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          sort_order?: number
          title_bn: string
          title_en?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          sort_order?: number
          title_bn?: string
          title_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_items_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      instructors: {
        Row: {
          bio_bn: string | null
          bio_en: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name_bn: string
          name_en: string
          photo_url: string | null
          title_bn: string | null
          title_en: string | null
          updated_at: string
        }
        Insert: {
          bio_bn?: string | null
          bio_en?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name_bn: string
          name_en: string
          photo_url?: string | null
          title_bn?: string | null
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          bio_bn?: string | null
          bio_en?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name_bn?: string
          name_en?: string
          photo_url?: string | null
          title_bn?: string | null
          title_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      learning_outcomes: {
        Row: {
          course_id: string
          id: string
          sort_order: number
          text_bn: string
          text_en: string | null
        }
        Insert: {
          course_id: string
          id?: string
          sort_order?: number
          text_bn: string
          text_en?: string | null
        }
        Update: {
          course_id?: string
          id?: string
          sort_order?: number
          text_bn?: string
          text_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_outcomes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          application_id: string
          created_at: string
          id: string
          method: string | null
          paid_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          transaction_ref: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          application_id: string
          created_at?: string
          id?: string
          method?: string | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_ref?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          application_id?: string
          created_at?: string
          id?: string
          method?: string | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_ref?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          group_name: string
          id: string
          input_type: string
          key: string
          label: string
          sort_order: number
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          group_name?: string
          id?: string
          input_type?: string
          key: string
          label?: string
          sort_order?: number
          updated_at?: string
          value?: string
        }
        Update: {
          created_at?: string
          group_name?: string
          id?: string
          input_type?: string
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      submit_application: {
        Args: {
          _address?: string | null
          _course_id: string
          _education?: string | null
          _email: string
          _full_name: string
          _message?: string | null
          _phone: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      application_status: "pending" | "approved" | "rejected" | "enrolled"
      payment_status: "pending" | "submitted" | "paid" | "failed" | "waived"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      application_status: ["pending", "approved", "rejected", "enrolled"],
      payment_status: ["pending", "submitted", "paid", "failed", "waived"],
    },
  },
} as const
