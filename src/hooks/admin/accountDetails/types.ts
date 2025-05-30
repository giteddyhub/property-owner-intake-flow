
export interface AccountDetails {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  is_admin: boolean;
  primary_submission_id?: string;
  total_revenue: number;
  last_submission_date?: string;
  recent_activities: number;
  // Add missing properties for compatibility with AccountData
  submissions_count: number;
  properties_count: number;
  owners_count: number;
}

export interface FormSubmission {
  id: string;
  submitted_at: string;
  state: string;
  pdf_generated: boolean;
  pdf_url: string | null;
  is_primary_submission: boolean;
  created_at: string; // Added missing property
  user_id: string; // Added missing property for consistency
}
