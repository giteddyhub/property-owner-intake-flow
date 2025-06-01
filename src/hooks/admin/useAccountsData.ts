
import { useState, useEffect } from 'react';
import { useCleanAdminData, UserProfile } from './useCleanAdminData';

export interface AccountData extends UserProfile {
  is_admin?: boolean;
}

export const useAccountsData = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { users, loading, error, refetch } = useCleanAdminData();

  // Convert UserProfile to AccountData format for compatibility and sort by creation date
  const accounts: AccountData[] = users
    .map(user => ({
      ...user,
      is_admin: false // No longer tracking admin status in UI
    }))
    .sort((a, b) => {
      // Sort by created_at in descending order (most recent first)
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB.getTime() - dateA.getTime();
    });

  // Filter accounts based on search query
  const filteredAccounts = accounts.filter(account => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (account.full_name && account.full_name.toLowerCase().includes(query)) ||
        (account.email && account.email.toLowerCase().includes(query))
      );
    }
    return true;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAccounts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return {
    accounts,
    loading,
    error,
    diagnosticInfo: {}, // No longer needed with clean implementation
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    adminUsers: [], // Empty since admin management is removed
    filteredAccounts,
    currentItems,
    totalPages,
    fetchAccounts: refetch
  };
};
