
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
  currentItems: UserProfile[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  totalPages: number;
  filteredAccounts: UserProfile[];
}

export const useAdminUsers = (defaultFilter: UserRole = 'all'): UseAdminUsersReturn => {
  const [filter, setFilter] = useState<UserRole>(defaultFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { users, loading, error, refetch } = useCleanAdminData();
  const navigate = useNavigate();
  
  // Admin status is now managed outside of the UI - always return false
  // since regular users cannot be made admin through the dashboard
  const isAdmin = useCallback(() => false, []);
  
  const handleRowClick = useCallback((userId: string) => {
    navigate(`/admin/accounts/${userId}`);
  }, [navigate]);
  
  // Filter users based on the selected filter
  const filteredAccounts = users.filter(user => {
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

  // Calculate pagination
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAccounts.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);
  
  return {
    users: filteredAccounts,
    loading,
    error,
    fetchUsers: refetch,
    isAdmin,
    filter,
    setFilter,
    handleRowClick,
    currentItems,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalPages,
    filteredAccounts
  };
};
