
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
      
      try {
        // Using simple object extraction to avoid TypeScript's deep type analysis
        const { data, error } = await supabase
          .from('owner_property_assignments')
          .select();
        
        if (error) {
          console.error("Error fetching assignments:", error);
        } else {
          // Create plain objects manually to avoid TypeScript's deep instantiation issues
          const plainAssignments = data ? data.map(item => ({
            id: item.id,
            property_id: item.property_id,
            owner_id: item.owner_id,
            ownership_percentage: item.ownership_percentage,
            resident_at_property: item.resident_at_property,
            resident_from_date: item.resident_from_date,
            resident_to_date: item.resident_to_date,
            tax_credits: item.tax_credits
          })) : [];
          
          // Filter to only include assignments for our owners
          assignmentsData = plainAssignments.filter(item => 
            ownerIds.includes(item.owner_id)
          ) as DbAssignment[];
          
          console.log("Assignments data fetched:", assignmentsData.length);
        }
      } catch (error) {
        console.error("Error processing assignments:", error);
      }
    } else {
      console.log("No owners found, checking for assignments directly");
      
      try {
        const { data, error } = await supabase
          .from('owner_property_assignments')
          .select();
        
        if (error) {
          console.error("Error fetching assignments directly:", error);
        } else {
          // Create plain objects to avoid TypeScript's deep analysis
          assignmentsData = (data || []).map(item => ({
            id: item.id,
            property_id: item.property_id,
            owner_id: item.owner_id,
            ownership_percentage: item.ownership_percentage,
            resident_at_property: item.resident_at_property,
            resident_from_date: item.resident_from_date,
            resident_to_date: item.resident_to_date,
            tax_credits: item.tax_credits
          })) as DbAssignment[];
          
          console.log("Direct assignments data fetched:", assignmentsData.length);
        }
      } catch (error) {
        console.error("Error with direct assignments fetch:", error);
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
