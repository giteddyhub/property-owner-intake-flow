
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
      console.log('Fetching profiles data using fallback method...');
      
      // Get current auth status to help diagnose issues
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      diagnostics.hasAuthSession = !!session;
      if (authError) {
        diagnostics.authError = authError.message;
      }
      
      // Try to get profiles directly first (this may fail due to RLS but we try anyway)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      diagnostics.profilesQueryStatus = profilesError ? 'failed' : 'success';
      diagnostics.profilesCount = profilesData?.length || 0;
      
      if (profilesError) {
        diagnostics.profilesError = profilesError.message;
        console.log('Error fetching profiles, falling back to admin access method:', profilesError.message);
      }
      
      // Try to get admin users directly
      const { data: adminUsersData, error: adminError } = await supabase
        .from('admin_users')
        .select('id');
      
      diagnostics.adminQueryStatus = adminError ? 'failed' : 'success';
      diagnostics.adminCount = adminUsersData?.length || 0;
      
      if (adminError) {
        diagnostics.adminError = adminError.message;
        console.log('Error fetching admin users:', adminError.message);
      }
      
      // Collect admin user IDs
      let adminUserIds: string[] = [];
      if (adminUsersData && adminUsersData.length > 0) {
        adminUserIds = adminUsersData.map(admin => admin.id);
      }
      setAdminUsers(adminUserIds);
      
      // If we have profiles data from direct query, use that
      let enhancedProfiles: AccountData[] = [];
      
      if (profilesData && profilesData.length > 0) {
        enhancedProfiles = profilesData.map(profile => ({
          ...profile,
          submissions_count: 0,
          properties_count: 0,
          owners_count: 0,
          is_admin: adminUserIds.includes(profile.id)
        }));
      } else {
        // If direct query failed, try edge function as a fallback
        try {
          console.log('Attempting to use admin-tools edge function as fallback...');
          
          // Set up headers with admin token if available
          const options: any = {};
          if (adminSession?.token) {
            options.headers = {
              'x-admin-token': adminSession.token
            };
            console.log('Using admin token for authentication');
          } else {
            console.warn('No admin token available for edge function call');
            diagnostics.noAdminToken = true;
          }
          
          const { data: edgeFunctionData, error: functionError } = await supabase.functions.invoke('admin-tools', {
            body: { 
              action: 'fetch_admin_users'
            },
            headers: options.headers
          });
          
          if (functionError) {
            throw new Error(`Edge function error: ${functionError.message}`);
          }
          
          if (edgeFunctionData && edgeFunctionData.data) {
            enhancedProfiles = edgeFunctionData.data;
            diagnostics.edgeFunctionSuccess = true;
            diagnostics.adminCount = edgeFunctionData.adminCount || 0;
            diagnostics.profileCount = edgeFunctionData.profileCount || 0;
          } else {
            throw new Error('No data returned from edge function');
          }
        } catch (edgeFunctionError: any) {
          console.error('Error calling admin-tools function:', edgeFunctionError);
          
          // If edge function fails too, try to create mock data as a last resort for testing
          console.log('Edge function failed, creating mock data for testing');
          diagnostics.adminFallbackUsed = true;
          
          // Create some mock data for development/testing
          enhancedProfiles = [
            {
              id: '00000000-0000-0000-0000-000000000001',
              email: 'test@example.com',
              full_name: 'Test User',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              submissions_count: 2,
              properties_count: 3,
              owners_count: 1,
              is_admin: false
            },
            {
              id: '00000000-0000-0000-0000-000000000002',
              email: 'admin@example.com',
              full_name: 'Admin User',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              submissions_count: 0,
              properties_count: 0,
              owners_count: 0,
              is_admin: true
            }
          ];
          diagnostics.adminFallbackCount = enhancedProfiles.length;
          
          // Show toast notification for mock data
          toast.warning('Using mock data for development', {
            description: 'Edge function could not be reached. Using mock data for testing.'
          });
        }
      }
      
      setAccounts(enhancedProfiles);
      
      if (enhancedProfiles.length === 0) {
        setError("No user profiles found. This could be due to database access restrictions or no users exist yet.");
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
