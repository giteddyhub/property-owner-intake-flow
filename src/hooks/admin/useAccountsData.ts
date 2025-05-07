
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AccountData } from '@/types/admin';

export const useAccountsData = () => {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [adminUsers, setAdminUsers] = useState<string[]>([]);

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
    try {
      console.log('Fetching all profiles...');
      // First get all user profiles with a direct query to avoid RLS issues
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profiles data:', profilesData?.length || 0, 'records found');
      
      // Get admin users separately - this query doesn't cause recursion issues
      const { data: adminsData } = await supabase
        .from('admin_users')
        .select('id');
      
      console.log('Admin data:', adminsData?.length || 0, 'records found');
        
      // Store admin user IDs in state
      const adminUserIds = adminsData?.map(admin => admin.id) || [];
      setAdminUsers(adminUserIds);

      if (!profilesData || profilesData.length === 0) {
        setAccounts([]);
        setLoading(false);
        return;
      }

      // Fetch additional information for each account
      const enhancedAccounts = await Promise.all(
        profilesData.map(async (profile) => {
          try {
            // Count submissions
            const { count: submissionsCount, error: submissionsError } = await supabase
              .from('form_submissions')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', profile.id);
            
            if (submissionsError) {
              console.error('Error fetching submissions count:', submissionsError);
            }
            
            // Count properties
            const { count: propertiesCount, error: propertiesError } = await supabase
              .from('properties')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', profile.id);
            
            if (propertiesError) {
              console.error('Error fetching properties count:', propertiesError);
            }
            
            // Count owners
            const { count: ownersCount, error: ownersError } = await supabase
              .from('owners')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', profile.id);
            
            if (ownersError) {
              console.error('Error fetching owners count:', ownersError);
            }
            
            return {
              ...profile,
              submissions_count: submissionsCount || 0,
              properties_count: propertiesCount || 0,
              owners_count: ownersCount || 0,
              is_admin: adminUserIds.includes(profile.id)
            };
          } catch (error) {
            console.error(`Error enhancing profile ${profile.id}:`, error);
            // Return the profile with default counts if there's an error
            return {
              ...profile,
              submissions_count: 0,
              properties_count: 0,
              owners_count: 0,
              is_admin: adminUserIds.includes(profile.id)
            };
          }
        })
      );
      
      console.log('Enhanced accounts:', enhancedAccounts.length);
      setAccounts(enhancedAccounts);
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
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
  }, []);

  return {
    accounts,
    loading,
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
