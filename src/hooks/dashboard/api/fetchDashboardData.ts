
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DbOwner, DbProperty, DbAssignment } from '../types';

interface FetchUserDataParams {
  userId: string | undefined;
}

interface FetchUserDataResult {
  ownersData: DbOwner[];
  propertiesData: DbProperty[];
  assignmentsData: DbAssignment[];
  error: Error | null;
}

export const fetchUserData = async ({ userId }: FetchUserDataParams): Promise<FetchUserDataResult> => {
  if (!userId) {
    console.log("No userId provided to fetchUserData, skipping data fetch");
    return {
      ownersData: [],
      propertiesData: [],
      assignmentsData: [],
      error: null
    };
  }

  try {
    console.log("Fetching user data for userId:", userId);
    
    // First, check if the user exists in the auth.users table
    const { data: authUserData, error: authUserError } = await supabase.auth.getUser();
    
    if (authUserError) {
      console.error("Error fetching auth user:", authUserError);
      // Continue anyway as we might be using a pendingUserId
    } else {
      console.log("Auth user data:", authUserData?.user?.id);
    }
    
    // Fetch contacts associated with this user
    const { data: contactsData, error: contactsError } = await supabase
      .from('contacts')
      .select('id')
      .eq('user_id', userId);
    
    if (contactsError) {
      console.error("Error fetching contacts:", contactsError);
      throw contactsError;
    }
    
    console.log("Contacts associated with user:", contactsData?.length || 0);
    
    // Fetch owners data - use user_id directly
    const { data: ownersData, error: ownersError } = await supabase
      .from('owners')
      .select('*')
      .eq('user_id', userId);

    if (ownersError) {
      console.error("Error fetching owners:", ownersError);
      throw ownersError;
    }
    console.log("Owners data fetched:", ownersData?.length || 0);
    
    // Fetch properties data
    const { data: propertiesData, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', userId);

    if (propertiesError) {
      console.error("Error fetching properties:", propertiesError);
      throw propertiesError;
    }
    console.log("Properties data fetched:", propertiesData?.length || 0);
    
    // If we have owners, fetch assignments related to those owners
    let assignmentsData: any[] = [];
    if (ownersData && ownersData.length > 0) {
      const ownerIds = ownersData.map(o => o.id);
      const { data, error: assignmentsError } = await supabase
        .from('owner_property_assignments')
        .select('*')
        .in('owner_id', ownerIds);
        
      if (assignmentsError) {
        console.error("Error fetching assignments:", assignmentsError);
        throw assignmentsError;
      }
      assignmentsData = data || [];
      console.log("Assignments data fetched:", assignmentsData.length);
    } else {
      console.log("No owners found, skipping assignments fetch");
      
      // Alternative attempt - try fetching assignments directly by user_id
      const { data, error: assignmentsError } = await supabase
        .from('owner_property_assignments')
        .select('*')
        .eq('user_id', userId);
        
      if (assignmentsError) {
        console.error("Error fetching assignments by user_id:", assignmentsError);
      } else {
        assignmentsData = data || [];
        console.log("Assignments data fetched by user_id:", assignmentsData.length);
      }
    }

    // Use type assertions to avoid deep type instantiation
    return {
      ownersData: (ownersData || []) as DbOwner[],
      propertiesData: (propertiesData || []) as DbProperty[],
      assignmentsData: assignmentsData as DbAssignment[],
      error: null
    };

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    toast.error('Failed to load your data. Please try again later.');
    return {
      ownersData: [],
      propertiesData: [],
      assignmentsData: [],
      error: error as Error
    };
  }
};
