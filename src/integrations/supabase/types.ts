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
      owner_property_assignments: {
        Row: {
          created_at: string | null
          id: string
          owner_id: string | null
          ownership_percentage: number | null
          property_id: string | null
          resident_at_property: boolean | null
          resident_from: string | null
          resident_to: string | null
          tax_credits: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          owner_id?: string | null
          ownership_percentage?: number | null
          property_id?: string | null
          resident_at_property?: boolean | null
          resident_from?: string | null
          resident_to?: string | null
          tax_credits?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          owner_id?: string | null
          ownership_percentage?: number | null
          property_id?: string | null
          resident_at_property?: boolean | null
          resident_from?: string | null
          resident_to?: string | null
          tax_credits?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "owner_property_assignments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_property_assignments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      owners: {
        Row: {
          citizenship: string | null
          city: string | null
          comune_name: string | null
          country: string | null
          country_of_birth: string | null
          created_at: string | null
          date_of_birth: string | null
          first_name: string
          full_year: boolean | null
          id: string
          is_resident_in_italy: boolean | null
          italian_tax_code: string | null
          last_name: string
          marital_status: string | null
          residence_start_date: string | null
          street: string | null
          updated_at: string | null
          user_id: string | null
          zip: string | null
        }
        Insert: {
          citizenship?: string | null
          city?: string | null
          comune_name?: string | null
          country?: string | null
          country_of_birth?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          first_name: string
          full_year?: boolean | null
          id?: string
          is_resident_in_italy?: boolean | null
          italian_tax_code?: string | null
          last_name: string
          marital_status?: string | null
          residence_start_date?: string | null
          street?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip?: string | null
        }
        Update: {
          citizenship?: string | null
          city?: string | null
          comune_name?: string | null
          country?: string | null
          country_of_birth?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          first_name?: string
          full_year?: boolean | null
          id?: string
          is_resident_in_italy?: boolean | null
          italian_tax_code?: string | null
          last_name?: string
          marital_status?: string | null
          residence_start_date?: string | null
          street?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          activity_2024: string | null
          comune: string | null
          created_at: string | null
          id: string
          label: string
          months_occupied: number | null
          property_type: string | null
          province: string | null
          purchase_date: string | null
          purchase_price: number | null
          remodeling: boolean | null
          rental_income: number | null
          sale_date: string | null
          sale_price: number | null
          street: string | null
          updated_at: string | null
          user_id: string | null
          zip: string | null
        }
        Insert: {
          activity_2024?: string | null
          comune?: string | null
          created_at?: string | null
          id?: string
          label: string
          months_occupied?: number | null
          property_type?: string | null
          province?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          remodeling?: boolean | null
          rental_income?: number | null
          sale_date?: string | null
          sale_price?: number | null
          street?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip?: string | null
        }
        Update: {
          activity_2024?: string | null
          comune?: string | null
          created_at?: string | null
          id?: string
          label?: string
          months_occupied?: number | null
          property_type?: string | null
          province?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          remodeling?: boolean | null
          rental_income?: number | null
          sale_date?: string | null
          sale_price?: number | null
          street?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      property_occupancy_statuses: {
        Row: {
          id: string
          occupancy_status: string | null
          property_id: string | null
        }
        Insert: {
          id?: string
          occupancy_status?: string | null
          property_id?: string | null
        }
        Update: {
          id?: string
          occupancy_status?: string | null
          property_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_occupancy_statuses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
