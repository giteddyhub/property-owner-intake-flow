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
      contacts: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      owner_property_assignments: {
        Row: {
          contact_id: string | null
          created_at: string
          id: string
          owner_id: string
          ownership_percentage: number
          property_id: string
          resident_at_property: boolean
          resident_from_date: string | null
          resident_to_date: string | null
          tax_credits: number | null
          updated_at: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          id?: string
          owner_id: string
          ownership_percentage: number
          property_id: string
          resident_at_property?: boolean
          resident_from_date?: string | null
          resident_to_date?: string | null
          tax_credits?: number | null
          updated_at?: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          id?: string
          owner_id?: string
          ownership_percentage?: number
          property_id?: string
          resident_at_property?: boolean
          resident_from_date?: string | null
          resident_to_date?: string | null
          tax_credits?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_property_assignments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
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
          address_city: string
          address_country: string
          address_street: string
          address_zip: string
          citizenship: string
          contact_id: string | null
          country_of_birth: string
          created_at: string
          date_of_birth: string | null
          first_name: string
          id: string
          is_resident_in_italy: boolean
          italian_residence_city: string | null
          italian_residence_comune_name: string | null
          italian_residence_street: string | null
          italian_residence_zip: string | null
          italian_tax_code: string
          last_name: string
          marital_status: string
          spent_over_182_days: boolean | null
          updated_at: string
        }
        Insert: {
          address_city: string
          address_country: string
          address_street: string
          address_zip: string
          citizenship: string
          contact_id?: string | null
          country_of_birth: string
          created_at?: string
          date_of_birth?: string | null
          first_name: string
          id?: string
          is_resident_in_italy?: boolean
          italian_residence_city?: string | null
          italian_residence_comune_name?: string | null
          italian_residence_street?: string | null
          italian_residence_zip?: string | null
          italian_tax_code: string
          last_name: string
          marital_status: string
          spent_over_182_days?: boolean | null
          updated_at?: string
        }
        Update: {
          address_city?: string
          address_country?: string
          address_street?: string
          address_zip?: string
          citizenship?: string
          contact_id?: string | null
          country_of_birth?: string
          created_at?: string
          date_of_birth?: string | null
          first_name?: string
          id?: string
          is_resident_in_italy?: boolean
          italian_residence_city?: string | null
          italian_residence_comune_name?: string | null
          italian_residence_street?: string | null
          italian_residence_zip?: string | null
          italian_tax_code?: string
          last_name?: string
          marital_status?: string
          spent_over_182_days?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "owners_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          activity_2024: string
          address_comune: string
          address_province: string
          address_street: string
          address_zip: string
          contact_id: string | null
          created_at: string
          documents: string[] | null
          id: string
          label: string
          occupancy_statuses: string[]
          property_type: string
          purchase_date: string | null
          purchase_price: number | null
          remodeling: boolean
          rental_income: number | null
          sale_date: string | null
          sale_price: number | null
          updated_at: string
          use_document_retrieval_service: boolean | null
        }
        Insert: {
          activity_2024: string
          address_comune: string
          address_province: string
          address_street: string
          address_zip: string
          contact_id?: string | null
          created_at?: string
          documents?: string[] | null
          id?: string
          label: string
          occupancy_statuses: string[]
          property_type: string
          purchase_date?: string | null
          purchase_price?: number | null
          remodeling?: boolean
          rental_income?: number | null
          sale_date?: string | null
          sale_price?: number | null
          updated_at?: string
          use_document_retrieval_service?: boolean | null
        }
        Update: {
          activity_2024?: string
          address_comune?: string
          address_province?: string
          address_street?: string
          address_zip?: string
          contact_id?: string | null
          created_at?: string
          documents?: string[] | null
          id?: string
          label?: string
          occupancy_statuses?: string[]
          property_type?: string
          purchase_date?: string | null
          purchase_price?: number | null
          remodeling?: boolean
          rental_income?: number | null
          sale_date?: string | null
          sale_price?: number | null
          updated_at?: string
          use_document_retrieval_service?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
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
