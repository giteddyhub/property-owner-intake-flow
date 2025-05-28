
export type UserRole = 'admin' | 'user' | 'all';

export interface AdminUser {
  id: string;
  full_name?: string;
  email: string;
  created_at: string;
  updated_at: string;
  is_admin?: boolean;
}

export interface UseAdminUsersReturn {
  users: AdminUser[];
  adminUsers: string[];
  loading: boolean;
  error: string | null;
  diagnosticInfo: any;
  fetchUsers: () => Promise<void>;
  addUser: (userData: any) => void;
  toggleAdminStatus: (userId: string, currentAdminStatus: boolean, userName: string) => Promise<boolean>;
  isAdmin: (userId: string) => boolean;
  filter: UserRole;
  setFilter: (filter: UserRole) => void;
}
