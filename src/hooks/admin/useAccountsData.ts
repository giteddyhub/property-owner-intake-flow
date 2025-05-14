
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AccountData } from '@/types/admin';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';

export const useAccountsData = () => {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [adminUsers, setAdminUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>({});
  const { adminSession } = useAdminAuth();

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

  // Fetch accounts with related data
  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    const diagnostics: any = {};
    
    try {
      console.log('Fetching all profiles using admin tools edge function...');
      
      // Get current auth status to help diagnose issues
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      diagnostics.hasAuthSession = !!session;
      if (authError) {
        diagnostics.authError = authError.message;
      }
      
      // Set up headers with admin token if available
      const options: any = {};
      if (adminSession?.token) {
        options.headers = {
          'x-admin-token': adminSession.token
        };
        console.log('Using admin token for authentication');
      } else {
        console.warn('No admin token available');
        diagnostics.noAdminToken = true;
      }
      
      // Call the admin-tools edge function instead of direct database access
      const { data, error: functionError } = await supabase.functions.invoke('admin-tools', {
        body: { 
          action: 'fetch_admin_users'
        },
        headers: options.headers
      });
      
      if (functionError) {
        diagnostics.functionError = functionError.message;
        console.error('Error calling admin-tools function:', functionError);
        throw new Error(`Edge function error: ${functionError.message}`);
      }
      
      if (!data) {
        throw new Error('No data returned from admin-tools function');
      }
      
      // Update diagnostics with information from the function response
      diagnostics.profileCount = data.profileCount || 0;
      diagnostics.adminCount = data.adminCount || 0;
      diagnostics.edgeFunctionSuccess = true;
      
      if (data.error) {
        throw new Error(`Edge function reported error: ${data.error}`);
      }
      
      // Get the profiles data from response
      const profilesData = data.data || [];
      console.log('Profiles data:', profilesData.length, 'records found');
      
      // Extract admin user IDs
      const adminUserIds = profilesData
        .filter(profile => profile.is_admin)
        .map(profile => profile.id);
        
      setAdminUsers(adminUserIds);
      
      // Set accounts directly from enhanced profiles data
      setAccounts(profilesData);
      
      if (profilesData.length === 0) {
        setError("No user profiles found in the database. You may need to create some users first.");
      }
      
      setDiagnosticInfo(diagnostics);
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      setError(error.message || 'Failed to fetch accounts data');
      setDiagnosticInfo(diagnostics);
      toast.error('Failed to fetch accounts data', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Initial data fetch
  useEffect(() => {
    fetchAccounts();
  }, [adminSession]);

  return {
    accounts,
    loading,
    error,
    diagnosticInfo,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    adminUsers,
    filteredAccounts,
    currentItems,
    totalPages,
    fetchAccounts
  };
};
