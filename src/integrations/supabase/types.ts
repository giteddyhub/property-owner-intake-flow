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
      cache: {
        Row: {
          expiration: number
          key: string
          value: string
        }
        Insert: {
          expiration: number
          key: string
          value: string
        }
        Update: {
          expiration?: number
          key?: string
          value?: string
        }
        Relationships: []
      }
      cache_locks: {
        Row: {
          expiration: number
          key: string
          owner: string
        }
        Insert: {
          expiration: number
          key: string
          owner: string
        }
        Update: {
          expiration?: number
          key?: string
          owner?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          accountant_id: number | null
          created_at: string
          custom_checkout_link: string | null
          email: string
          full_name: string
          id: string
          pdf_generated: boolean | null
          pdf_url: string | null
          state: string
          submitted_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          accountant_id?: number | null
          created_at?: string
          custom_checkout_link?: string | null
          email: string
          full_name: string
          id?: string
          pdf_generated?: boolean | null
          pdf_url?: string | null
          state?: string
          submitted_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          accountant_id?: number | null
          created_at?: string
          custom_checkout_link?: string | null
          email?: string
          full_name?: string
          id?: string
          pdf_generated?: boolean | null
          pdf_url?: string | null
          state?: string
          submitted_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      failed_jobs: {
        Row: {
          connection: string
          exception: string
          failed_at: string
          id: number
          payload: string
          queue: string
          uuid: string
        }
        Insert: {
          connection: string
          exception: string
          failed_at?: string
          id?: number
          payload: string
          queue: string
          uuid: string
        }
        Update: {
          connection?: string
          exception?: string
          failed_at?: string
          id?: number
          payload?: string
          queue?: string
          uuid?: string
        }
        Relationships: []
      }
      job_batches: {
        Row: {
          cancelled_at: number | null
          created_at: number
          failed_job_ids: string
          failed_jobs: number
          finished_at: number | null
          id: string
          name: string
          options: string | null
          pending_jobs: number
          total_jobs: number
        }
        Insert: {
          cancelled_at?: number | null
          created_at: number
          failed_job_ids: string
          failed_jobs: number
          finished_at?: number | null
          id: string
          name: string
          options?: string | null
          pending_jobs: number
          total_jobs: number
        }
        Update: {
          cancelled_at?: number | null
          created_at?: number
          failed_job_ids?: string
          failed_jobs?: number
          finished_at?: number | null
          id?: string
          name?: string
          options?: string | null
          pending_jobs?: number
          total_jobs?: number
        }
        Relationships: []
      }
      jobs: {
        Row: {
          attempts: number
          available_at: number
          created_at: number
          id: number
          payload: string
          queue: string
          reserved_at: number | null
        }
        Insert: {
          attempts: number
          available_at: number
          created_at: number
          id?: number
          payload: string
          queue: string
          reserved_at?: number | null
        }
        Update: {
          attempts?: number
          available_at?: number
          created_at?: number
          id?: number
          payload?: string
          queue?: string
          reserved_at?: number | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          batch: number
          id: number
          migration: string
        }
        Insert: {
          batch: number
          id?: number
          migration: string
        }
        Update: {
          batch?: number
          id?: number
          migration?: string
        }
        Relationships: []
      }
      model_has_permissions: {
        Row: {
          model_id: number
          model_type: string
          permission_id: number
        }
        Insert: {
          model_id: number
          model_type: string
          permission_id: number
        }
        Update: {
          model_id?: number
          model_type?: string
          permission_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "model_has_permissions_permission_id_foreign"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      model_has_roles: {
        Row: {
          model_id: number
          model_type: string
          role_id: number
        }
        Insert: {
          model_id: number
          model_type: string
          role_id: number
        }
        Update: {
          model_id?: number
          model_type?: string
          role_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "model_has_roles_role_id_foreign"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
      password_reset_tokens: {
        Row: {
          created_at: string | null
          email: string
          token: string
        }
        Insert: {
          created_at?: string | null
          email: string
          token: string
        }
        Update: {
          created_at?: string | null
          email?: string
          token?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          created_at: string | null
          guard_name: string
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          guard_name: string
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          guard_name?: string
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
      purchases: {
        Row: {
          amount: number
          contact_id: string
          created_at: string
          currency: string
          has_document_retrieval: boolean | null
          id: string
          payment_status: string
          stripe_payment_id: string | null
          stripe_session_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          contact_id: string
          created_at?: string
          currency?: string
          has_document_retrieval?: boolean | null
          id?: string
          payment_status?: string
          stripe_payment_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          contact_id?: string
          created_at?: string
          currency?: string
          has_document_retrieval?: boolean | null
          id?: string
          payment_status?: string
          stripe_payment_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      resident_contacts: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      role_has_permissions: {
        Row: {
          permission_id: number
          role_id: number
        }
        Insert: {
          permission_id: number
          role_id: number
        }
        Update: {
          permission_id?: number
          role_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "role_has_permissions_permission_id_foreign"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_has_permissions_role_id_foreign"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          guard_name: string
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          guard_name: string
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          guard_name?: string
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          id: string
          ip_address: string | null
          last_activity: number
          payload: string
          user_agent: string | null
          user_id: number | null
        }
        Insert: {
          id: string
          ip_address?: string | null
          last_activity: number
          payload: string
          user_agent?: string | null
          user_id?: number | null
        }
        Update: {
          id?: string
          ip_address?: string | null
          last_activity?: number
          payload?: string
          user_agent?: string | null
          user_id?: number | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          email_verified_at: string | null
          id: number
          name: string
          password: string
          remember_token: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          email_verified_at?: string | null
          id?: number
          name: string
          password: string
          remember_token?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          email_verified_at?: string | null
          id?: number
          name?: string
          password?: string
          remember_token?: string | null
          updated_at?: string | null
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
