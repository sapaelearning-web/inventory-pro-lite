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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      stock_consumption: {
        Row: {
          created_at: string
          created_by: string
          date: string
          edited_at: string | null
          edited_by: string | null
          id: string
          item_code: string
          item_name: string
          purpose_activity_code: string
          quantity_used: number
          rate_per_unit: number
          remarks: string | null
          total_value: number
          unit_of_measurement: string
          used_by: string
        }
        Insert: {
          created_at?: string
          created_by: string
          date: string
          edited_at?: string | null
          edited_by?: string | null
          id?: string
          item_code: string
          item_name: string
          purpose_activity_code: string
          quantity_used: number
          rate_per_unit: number
          remarks?: string | null
          total_value: number
          unit_of_measurement: string
          used_by: string
        }
        Update: {
          created_at?: string
          created_by?: string
          date?: string
          edited_at?: string | null
          edited_by?: string | null
          id?: string
          item_code?: string
          item_name?: string
          purpose_activity_code?: string
          quantity_used?: number
          rate_per_unit?: number
          remarks?: string | null
          total_value?: number
          unit_of_measurement?: string
          used_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_consumption_item_code_fkey"
            columns: ["item_code"]
            isOneToOne: false
            referencedRelation: "stock_items"
            referencedColumns: ["item_code"]
          },
        ]
      }
      stock_items: {
        Row: {
          created_at: string
          current_quantity: number
          id: string
          item_code: string
          item_name: string
          rate: number
          unit_of_measurement: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_quantity?: number
          id?: string
          item_code: string
          item_name: string
          rate?: number
          unit_of_measurement: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_quantity?: number
          id?: string
          item_code?: string
          item_name?: string
          rate?: number
          unit_of_measurement?: string
          updated_at?: string
        }
        Relationships: []
      }
      stock_receipts: {
        Row: {
          created_at: string
          created_by: string
          delivery_date: string
          edited_at: string | null
          edited_by: string | null
          id: string
          item_code: string
          item_name: string
          quantity_received: number
          rate_per_unit: number
          received_by: string
          supplier_name: string
          total_value: number
          unit_of_measurement: string
        }
        Insert: {
          created_at?: string
          created_by: string
          delivery_date: string
          edited_at?: string | null
          edited_by?: string | null
          id?: string
          item_code: string
          item_name: string
          quantity_received: number
          rate_per_unit: number
          received_by: string
          supplier_name: string
          total_value: number
          unit_of_measurement: string
        }
        Update: {
          created_at?: string
          created_by?: string
          delivery_date?: string
          edited_at?: string | null
          edited_by?: string | null
          id?: string
          item_code?: string
          item_name?: string
          quantity_received?: number
          rate_per_unit?: number
          received_by?: string
          supplier_name?: string
          total_value?: number
          unit_of_measurement?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_receipts_item_code_fkey"
            columns: ["item_code"]
            isOneToOne: false
            referencedRelation: "stock_items"
            referencedColumns: ["item_code"]
          },
        ]
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
