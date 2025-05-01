
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
    const contactsResult = await supabase
      .from('contacts')
      .select('id')
      .eq('user_id', userId);
    
    if (contactsResult.error) {
      console.error("Error fetching contacts:", contactsResult.error);
      throw contactsResult.error;
    }
    
    const contactsData = contactsResult.data;
    console.log("Contacts associated with user:", contactsData?.length || 0);
    
    // Fetch owners data - use user_id directly
    const ownersResult = await supabase
      .from('owners')
      .select('*')
      .eq('user_id', userId);

    if (ownersResult.error) {
      console.error("Error fetching owners:", ownersResult.error);
      throw ownersResult.error;
    }
    
    // Use simple casting to avoid deep type instantiation
    const ownersData = (ownersResult.data || []) as DbOwner[];
    console.log("Owners data fetched:", ownersData.length);
    
    // Fetch properties data
    const propertiesResult = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', userId);

    if (propertiesResult.error) {
      console.error("Error fetching properties:", propertiesResult.error);
      throw propertiesResult.error;
    }
    
    // Use simple casting to avoid deep type instantiation
    const propertiesData = (propertiesResult.data || []) as DbProperty[];
    console.log("Properties data fetched:", propertiesData.length);
    
    // If we have owners, fetch assignments related to those owners
    let assignmentsData: DbAssignment[] = [];
    
    if (ownersData.length > 0) {
      const ownerIds = ownersData.map(o => o.id);
      
      const assignmentsResult = await supabase
        .from('owner_property_assignments')
        .select('*')
        .in('owner_id', ownerIds);
        
      if (assignmentsResult.error) {
        console.error("Error fetching assignments:", assignmentsResult.error);
        throw assignmentsResult.error;
      }
      
      assignmentsData = (assignmentsResult.data || []) as DbAssignment[];
      console.log("Assignments data fetched:", assignmentsData.length);
    } else {
      console.log("No owners found, skipping assignments fetch");
      
      // Alternative attempt - try fetching assignments directly by user_id
      // Avoid type annotations completely for this query
      const directAssignmentsResult = await supabase
        .from('owner_property_assignments')
        .select('*')
        .eq('user_id', userId);
        
      if (directAssignmentsResult.error) {
        console.error("Error fetching assignments by user_id:", directAssignmentsResult.error);
      } else {
        // Convert the data to plain objects to break any type recursion
        assignmentsData = directAssignmentsResult.data ? 
          JSON.parse(JSON.stringify(directAssignmentsResult.data)) : [];
        console.log("Assignments data fetched by user_id:", assignmentsData.length);
      }
    }

    // Return the final result
    return {
      ownersData,
      propertiesData,
      assignmentsData,
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
