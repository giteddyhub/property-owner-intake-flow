
import { supabase } from '@/integrations/supabase/client';

export interface UserFetchResult {
  users: any[];
  adminUsers: string[];
  diagnostics: any;
  error?: string;
}

export const fetchUsersFromAdminTools = async (adminToken?: string): Promise<UserFetchResult | null> => {
  try {
    const { data: adminToolsData, error: adminToolsError } = await supabase.functions.invoke('admin-tools', {
      body: { 
        action: 'fetch_admin_users'
      },
      headers: adminToken ? {
        'x-admin-token': adminToken
      } : undefined
    });
    
    if (!adminToolsError && adminToolsData) {
      console.log('Successfully fetched users data from admin-tools function');
      
      const adminIds = adminToolsData?.data
        ?.filter((user: any) => user.is_admin)
        .map((user: any) => user.id) || [];
      
      return {
        users: adminToolsData?.data || [],
        adminUsers: adminIds,
        diagnostics: {
          dataSource: 'admin-tools',
          usersCount: adminToolsData?.data?.length || 0
        }
      };
    } else {
      console.warn('Error fetching from admin-tools:', adminToolsError);
      return null;
    }
  } catch (error: any) {
    console.error('Failed to call admin-tools edge function:', error);
    return null;
  }
};

export const fetchUsersDirectly = async (adminToken?: string): Promise<UserFetchResult> => {
  const diagnostics: any = {};
  
  // Set up headers with admin token if available
  let options = {};
  if (adminToken) {
    options = {
      headers: {
        'x-admin-token': adminToken
      }
    };
    console.log('Using admin token for authentication');
  }
  
  // Get profiles
  const { data: profilesData, error: profilesError, status: profilesStatus } = await supabase
    .from('profiles')
    .select('*', options);
  
  diagnostics.profilesQueryStatus = profilesStatus;
  diagnostics.profilesCount = profilesData?.length || 0;
  
  if (profilesError) {
    diagnostics.profilesError = profilesError.message;
    console.error('Error fetching profiles:', profilesError);
  }
  
  // Get admin users
  const { data: adminsData, error: adminsError, status: adminsStatus } = await supabase
    .from('admin_users')
    .select('id', options);
    
  diagnostics.adminQueryStatus = adminsStatus;
  diagnostics.adminCount = adminsData?.length || 0;
  
  if (adminsError) {
    diagnostics.adminError = adminsError.message;
    console.error('Error fetching admin users:', adminsError);
  }
  
  const adminUserIds = adminsData?.map(admin => admin.id) || [];
  
  return {
    users: profilesData || [],
    adminUsers: adminUserIds,
    diagnostics
  };
};
