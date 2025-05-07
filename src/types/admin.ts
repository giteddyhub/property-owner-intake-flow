
export interface AccountData {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  submissions_count: number;
  properties_count: number;
  owners_count: number;
  is_admin?: boolean;
}
