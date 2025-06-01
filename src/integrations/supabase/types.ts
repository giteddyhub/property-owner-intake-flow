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
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_credentials"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_credentials: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          is_super_admin: boolean
          last_login_at: string | null
          login_count: number
          password_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          is_super_admin?: boolean
          last_login_at?: string | null
          login_count?: number
          password_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          is_super_admin?: boolean
          last_login_at?: string | null
          login_count?: number
          password_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          admin_id: string
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          token: string
          user_agent: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: string | null
          token: string
          user_agent?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          token?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_credentials"
            referencedColumns: ["id"]
          },
        ]
      }
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
      form_submissions: {
        Row: {
          created_at: string
          has_document_retrieval: boolean | null
          id: string
          is_primary_submission: boolean | null
          pdf_generated: boolean | null
          pdf_url: string | null
          state: string
          submitted_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          has_document_retrieval?: boolean | null
          id?: string
          is_primary_submission?: boolean | null
          pdf_generated?: boolean | null
          pdf_url?: string | null
          state?: string
          submitted_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          has_document_retrieval?: boolean | null
          id?: string
          is_primary_submission?: boolean | null
          pdf_generated?: boolean | null
          pdf_url?: string | null
          state?: string
          submitted_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_form_submissions_contact_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_form_submissions_contact_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          created_at: string
          form_submission_id: string | null
          id: string
          owner_id: string
          ownership_percentage: number
          property_id: string
          resident_at_property: boolean
          resident_from_date: string | null
          resident_to_date: string | null
          tax_credits: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          form_submission_id?: string | null
          id?: string
          owner_id: string
          ownership_percentage: number
          property_id: string
          resident_at_property?: boolean
          resident_from_date?: string | null
          resident_to_date?: string | null
          tax_credits?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          form_submission_id?: string | null
          id?: string
          owner_id?: string
          ownership_percentage?: number
          property_id?: string
          resident_at_property?: boolean
          resident_from_date?: string | null
          resident_to_date?: string | null
          tax_credits?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_assignments_form_submission_id"
            columns: ["form_submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assignments_owner_id"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assignments_property_id"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assignments_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assignments_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_property_assignments_form_submission_id_fkey"
            columns: ["form_submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
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
          address_state: string | null
          address_street: string
          address_zip: string
          citizenship: string
          country_of_birth: string
          created_at: string
          date_of_birth: string | null
          first_name: string
          form_submission_id: string | null
          id: string
          is_resident_in_italy: boolean
          italian_residence_city: string | null
          italian_residence_comune_name: string | null
          italian_residence_street: string | null
          italian_residence_zip: string | null
          italian_tax_code: string
          last_name: string
          marital_status: string
          state_of_birth: string | null
          state_of_citizenship: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_city: string
          address_country: string
          address_state?: string | null
          address_street: string
          address_zip: string
          citizenship: string
          country_of_birth: string
          created_at?: string
          date_of_birth?: string | null
          first_name: string
          form_submission_id?: string | null
          id?: string
          is_resident_in_italy?: boolean
          italian_residence_city?: string | null
          italian_residence_comune_name?: string | null
          italian_residence_street?: string | null
          italian_residence_zip?: string | null
          italian_tax_code: string
          last_name: string
          marital_status: string
          state_of_birth?: string | null
          state_of_citizenship?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_city?: string
          address_country?: string
          address_state?: string | null
          address_street?: string
          address_zip?: string
          citizenship?: string
          country_of_birth?: string
          created_at?: string
          date_of_birth?: string | null
          first_name?: string
          form_submission_id?: string | null
          id?: string
          is_resident_in_italy?: boolean
          italian_residence_city?: string | null
          italian_residence_comune_name?: string | null
          italian_residence_street?: string | null
          italian_residence_zip?: string | null
          italian_tax_code?: string
          last_name?: string
          marital_status?: string
          state_of_birth?: string | null
          state_of_citizenship?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_owners_form_submission_id"
            columns: ["form_submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_owners_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_owners_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owners_form_submission_id_fkey"
            columns: ["form_submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
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
          primary_submission_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          primary_submission_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          primary_submission_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_primary_submission"
            columns: ["primary_submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_primary_submission_id_fkey"
            columns: ["primary_submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
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
          created_at: string
          documents: string[] | null
          form_submission_id: string | null
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
          user_id: string
        }
        Insert: {
          activity_2024: string
          address_comune: string
          address_province: string
          address_street: string
          address_zip: string
          created_at?: string
          documents?: string[] | null
          form_submission_id?: string | null
          id?: string
          label: string
          occupancy_statuses?: string[]
          property_type: string
          purchase_date?: string | null
          purchase_price?: number | null
          remodeling?: boolean
          rental_income?: number | null
          sale_date?: string | null
          sale_price?: number | null
          updated_at?: string
          use_document_retrieval_service?: boolean | null
          user_id: string
        }
        Update: {
          activity_2024?: string
          address_comune?: string
          address_province?: string
          address_street?: string
          address_zip?: string
          created_at?: string
          documents?: string[] | null
          form_submission_id?: string | null
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
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_properties_form_submission_id"
            columns: ["form_submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_properties_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_properties_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_form_submission_id_fkey"
            columns: ["form_submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          amount: number
          created_at: string
          currency: string
          form_submission_id: string
          has_document_retrieval: boolean | null
          id: string
          payment_status: string
          stripe_payment_id: string | null
          stripe_session_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          form_submission_id: string
          has_document_retrieval?: boolean | null
          id?: string
          payment_status?: string
          stripe_payment_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          form_submission_id?: string
          has_document_retrieval?: boolean | null
          id?: string
          payment_status?: string
          stripe_payment_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_form_submission_id_fkey"
            columns: ["form_submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
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
      user_activities: {
        Row: {
          activity_description: string | null
          activity_type: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          activity_description?: string | null
          activity_type: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          activity_description?: string | null
          activity_type?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      admin_user_summary: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          last_submission_date: string | null
          primary_submission_id: string | null
          recent_activities: number | null
          total_assignments: number | null
          total_owners: number | null
          total_properties: number | null
          total_revenue: number | null
          total_submissions: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_primary_submission"
            columns: ["primary_submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_primary_submission_id_fkey"
            columns: ["primary_submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_delete_user: {
        Args: { admin_token: string; target_user_id: string }
        Returns: Json
      }
      create_admin_session: {
        Args: {
          admin_id: string
          ip_address?: string
          user_agent?: string
          expires_in_hours?: number
        }
        Returns: {
          session_id: string
          token: string
          expires_at: string
        }[]
      }
      create_initial_admin: {
        Args: {
          email: string
          password: string
          full_name: string
          is_super_admin?: boolean
        }
        Returns: string
      }
      get_admin_user_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          last_submission_date: string | null
          primary_submission_id: string | null
          recent_activities: number | null
          total_assignments: number | null
          total_owners: number | null
          total_properties: number | null
          total_revenue: number | null
          total_submissions: number | null
        }[]
      }
      hash_password: {
        Args: { password: string }
        Returns: string
      }
      invalidate_admin_session: {
        Args: { session_token: string }
        Returns: boolean
      }
      invalidate_all_admin_sessions: {
        Args: { admin_email: string }
        Returns: number
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_authenticated_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_super_admin: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          admin_token: string
          action: string
          target_type?: string
          target_id?: string
          details?: Json
        }
        Returns: boolean
      }
      log_user_activity: {
        Args: {
          user_id: string
          activity_type: string
          activity_description?: string
          entity_type?: string
          entity_id?: string
          metadata?: Json
        }
        Returns: string
      }
      migrate_existing_admins: {
        Args: { default_password: string }
        Returns: {
          email: string
          full_name: string
          created_at: string
        }[]
      }
      validate_admin_session: {
        Args: { session_token: string }
        Returns: {
          admin_id: string
          email: string
          full_name: string
          is_super_admin: boolean
        }[]
      }
      validate_admin_token_for_access: {
        Args: { admin_token: string }
        Returns: boolean
      }
      validate_admin_token_for_purchases: {
        Args: { token_param: string }
        Returns: boolean
      }
      verify_admin_password: {
        Args: { email: string; password: string }
        Returns: string
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
