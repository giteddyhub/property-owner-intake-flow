
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCleanAdminData, UserProfile } from './useCleanAdminData';

export type UserRole = 'all' | 'admins' | 'users';

export interface UseAdminUsersReturn {
  users: UserProfile[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => void;
  isAdmin: (userId: string) => boolean;
  filter: UserRole;
  setFilter: (filter: UserRole) => void;
  handleRowClick: (userId: string) => void;
}

export const useAdminUsers = (defaultFilter: UserRole = 'all'): UseAdminUsersReturn => {
  const [filter, setFilter] = useState<UserRole>(defaultFilter);
  const { users, loading, error, refetch } = useCleanAdminData();
  const navigate = useNavigate();
  
  // Admin status is now managed outside of the UI - always return false
  // since regular users cannot be made admin through the dashboard
  const isAdmin = useCallback(() => false, []);
  
  const handleRowClick = useCallback((userId: string) => {
    navigate(`/admin/accounts/${userId}`);
  }, [navigate]);
  
  // Filter users based on the selected filter
  const filteredUsers = users.filter(user => {
    switch (filter) {
      case 'admins':
        // No users are shown as admins since admin management is removed
        return false;
      case 'users':
        return true;
      case 'all':
      default:
        return true;
    }
  });
  
  return {
    users: filteredUsers,
    loading,
    error,
    fetchUsers: refetch,
    isAdmin,
    filter,
    setFilter,
    handleRowClick
  };
};
